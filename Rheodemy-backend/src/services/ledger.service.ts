import { LedgerAccountKind, LedgerDirection, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

/**
 * Double-entry ledger.
 *
 * Every charge is balanced:
 *   DEBIT  learner   gross
 *   CREDIT creator   gross * CREATOR_SHARE
 *   CREDIT platform  gross - creatorShare
 *
 * Idempotency keys make retries safe (duplicate ticks / polls never double-post).
 */

type Tx = Prisma.TransactionClient;

export interface ChargeResult {
  gross: number;
  creatorAmount: number;
  platformAmount: number;
  currency: string;
  idempotent: boolean;
}

export class LedgerService {
  /** Share of each charge that goes to the creator (0.55 = 55%). */
  static get creatorShare(): number {
    return env.CREATOR_SHARE ?? 0.55;
  }

  static toDecimal(value: number | string): Prisma.Decimal {
    return new Prisma.Decimal(value);
  }

  private static async getUserAccount(
    tx: Tx,
    userId: string,
    kind: LedgerAccountKind,
    currency: string
  ) {
    return tx.ledgerAccount.upsert({
      where: { userId_kind_currency: { userId, kind, currency } },
      update: {},
      create: { userId, kind, currency, balance: 0 },
    });
  }

  private static async getPlatformAccount(tx: Tx, currency: string) {
    const existing = await tx.ledgerAccount.findFirst({
      where: { userId: null, kind: "PLATFORM", currency },
    });
    if (existing) return existing;
    return tx.ledgerAccount.create({
      data: { userId: null, kind: "PLATFORM", currency, balance: 0 },
    });
  }

  private static async postEntry(
    tx: Tx,
    input: {
      accountId: string;
      direction: LedgerDirection;
      amount: Prisma.Decimal;
      currency: string;
      idempotencyKey: string;
      description?: string;
      sessionId?: string;
      topUpId?: string;
      tickIndex?: number;
    }
  ) {
    const existing = await tx.ledgerEntry.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return { entry: existing, created: false };

    const entry = await tx.ledgerEntry.create({
      data: {
        accountId: input.accountId,
        direction: input.direction,
        amount: input.amount,
        currency: input.currency,
        idempotencyKey: input.idempotencyKey,
        description: input.description,
        sessionId: input.sessionId,
        topUpId: input.topUpId,
        tickIndex: input.tickIndex,
      },
    });

    await tx.ledgerAccount.update({
      where: { id: input.accountId },
      data: {
        balance:
          input.direction === "DEBIT"
            ? { decrement: input.amount }
            : { increment: input.amount },
      },
    });

    return { entry, created: true };
  }

  /**
   * Posts a balanced charge for one tick. Returns the split amounts.
   * Safe to call twice with the same (sessionId, tickIndex).
   */
  static async postCharge(input: {
    sessionId: string;
    tickIndex: number;
    gross: number;
    learnerId: string;
    creatorId: string;
    currency?: string;
  }): Promise<ChargeResult> {
    const currency = input.currency ?? "USD";
    const gross = this.toDecimal(input.gross).toDecimalPlaces(6);
    const creatorAmount = gross
      .mul(this.creatorShare)
      .toDecimalPlaces(6);
    const platformAmount = gross.sub(creatorAmount).toDecimalPlaces(6);

    return prisma.$transaction(async (tx) => {
      const learnerAccount = await this.getUserAccount(
        tx,
        input.learnerId,
        "LEARNER",
        currency
      );
      const creatorAccount = await this.getUserAccount(
        tx,
        input.creatorId,
        "CREATOR",
        currency
      );
      const platformAccount = await this.getPlatformAccount(tx, currency);

      const learner = await this.postEntry(tx, {
        accountId: learnerAccount.id,
        direction: "DEBIT",
        amount: gross,
        currency,
        sessionId: input.sessionId,
        tickIndex: input.tickIndex,
        idempotencyKey: `${input.sessionId}:${input.tickIndex}:learner`,
        description: "Lesson streaming charge",
      });
      const creator = await this.postEntry(tx, {
        accountId: creatorAccount.id,
        direction: "CREDIT",
        amount: creatorAmount,
        currency,
        sessionId: input.sessionId,
        tickIndex: input.tickIndex,
        idempotencyKey: `${input.sessionId}:${input.tickIndex}:creator`,
        description: "Lesson streaming earnings",
      });
      await this.postEntry(tx, {
        accountId: platformAccount.id,
        direction: "CREDIT",
        amount: platformAmount,
        currency,
        sessionId: input.sessionId,
        tickIndex: input.tickIndex,
        idempotencyKey: `${input.sessionId}:${input.tickIndex}:platform`,
        description: "Platform fee",
      });

      return {
        gross: Number(gross),
        creatorAmount: Number(creatorAmount),
        platformAmount: Number(platformAmount),
        currency,
        idempotent: !learner.created || !creator.created,
      };
    });
  }

  /** Credits a confirmed top-up exactly once. */
  static async creditTopUp(topUpId: string) {
    return prisma.$transaction(async (tx) => {
      const topUp = await tx.topUp.findUnique({ where: { id: topUpId } });
      if (!topUp) throw new Error("Top-up not found");
      if (topUp.status === "COMPLETED") {
        return { credited: false, amount: Number(topUp.amount) };
      }

      const account = await this.getUserAccount(
        tx,
        topUp.userId,
        "LEARNER",
        topUp.currency
      );

      await this.postEntry(tx, {
        accountId: account.id,
        direction: "CREDIT",
        amount: topUp.amount,
        currency: topUp.currency,
        topUpId: topUp.id,
        idempotencyKey: `topup:${topUp.id}`,
        description: `Wallet top-up (${topUp.provider})`,
      });

      await tx.topUp.update({
        where: { id: topUp.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      return { credited: true, amount: Number(topUp.amount) };
    });
  }

  /**
   * Reverses every charge posted for a session (used when settlement fails).
   * Idempotent: a second call is a no-op.
   */
  static async reverseSessionCharges(sessionId: string) {
    return prisma.$transaction(async (tx) => {
      const entries = await tx.ledgerEntry.findMany({
        where: {
          sessionId,
          NOT: { idempotencyKey: { startsWith: "reversal:" } },
        },
      });

      for (const entry of entries) {
        const key = `reversal:${entry.id}`;
        const existing = await tx.ledgerEntry.findUnique({
          where: { idempotencyKey: key },
        });
        if (existing) continue;

        const opposite: LedgerDirection =
          entry.direction === "DEBIT" ? "CREDIT" : "DEBIT";

        await tx.ledgerEntry.create({
          data: {
            accountId: entry.accountId,
            direction: opposite,
            amount: entry.amount,
            currency: entry.currency,
            sessionId,
            tickIndex: entry.tickIndex,
            idempotencyKey: key,
            description: "Reversal: settlement failed",
          },
        });

        await tx.ledgerAccount.update({
          where: { id: entry.accountId },
          data: {
            balance:
              entry.direction === "DEBIT"
                ? { increment: entry.amount }
                : { decrement: entry.amount },
          },
        });
      }
    });
  }

  /** Learner balance = credits - debits. */
  static async getLearnerBalance(userId: string, currency = "USD") {
    const account = await prisma.ledgerAccount.findUnique({
      where: {
        userId_kind_currency: { userId, kind: "LEARNER", currency },
      },
    });
    return account ? Number(account.balance) : 0;
  }

  /** Creator balance = accumulated 55% credits. */
  static async getCreatorBalance(userId: string, currency = "USD") {
    const account = await prisma.ledgerAccount.findUnique({
      where: {
        userId_kind_currency: { userId, kind: "CREATOR", currency },
      },
    });
    return account ? Number(account.balance) : 0;
  }

  /** Recent ledger entries for a user, shaped for the wallet UI. */
  static async getEntriesForUser(userId: string, currency = "USD") {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        account: {
          userId,
          currency,
          kind: { in: ["LEARNER", "CREATOR"] },
        },
      },
      include: { account: { select: { kind: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return entries.map((entry) => {
      const isCredit = entry.direction === "CREDIT";
      return {
        id: entry.id,
        type: isCredit ? ("CREDIT" as const) : ("DEBIT" as const),
        amount: Number(entry.amount),
        description:
          entry.description ??
          (entry.account.kind === "CREATOR" ? "Creator earnings" : "Wallet debit"),
        createdAt: entry.createdAt,
      };
    });
  }
}
