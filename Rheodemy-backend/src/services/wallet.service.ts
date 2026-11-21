import { randomUUID } from "crypto";
import { prisma } from "../config/prisma";
import { NotFound, BadRequest } from "../utils/errors";
import { LedgerService } from "./ledger.service";

const CURRENCY = "USD";
const MIN_TOPUP = 0.5;
const MAX_TOPUP = 10_000;
/** Simulated rails confirm this many ms after the top-up is created. */
const SIMULATED_CONFIRM_MS = 2_000;

export interface TopUpInput {
  amount: number;
  provider?: string;
  currency?: string;
}

export class WalletService {
  /**
   * Real balances from the double-entry ledger.
   * - Learner balance: top-ups minus streamed charges.
   * - Creator balance: 55% of every charge on their courses.
   */
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw NotFound("User not found");

    const learnerBalance = await LedgerService.getLearnerBalance(userId, CURRENCY);
    const creatorBalance =
      user.role === "INSTRUCTOR" || user.role === "ADMIN"
        ? await LedgerService.getCreatorBalance(userId, CURRENCY)
        : 0;

    return {
      learnerBalance,
      creatorBalance,
      currency: CURRENCY,
    };
  }

  async getTransactions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw NotFound("User not found");
    return LedgerService.getEntriesForUser(userId, CURRENCY);
  }

  async getWalletPointer(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { walletAddress: true },
    });
    if (!wallet) throw NotFound("Wallet not found");
    return { pointerUrl: wallet.walletAddress };
  }

  /**
   * Creates a pending top-up. With the simulated rail the confirmation is
   * picked up by polling `getTopUpStatus` (or the webhook seam).
   */
  async createTopUp(userId: string, input: TopUpInput) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw BadRequest("Top-up amount must be a positive number");
    }
    if (amount < MIN_TOPUP) {
      throw BadRequest(`Minimum top-up is $${MIN_TOPUP}`);
    }
    if (amount > MAX_TOPUP) {
      throw BadRequest(`Maximum top-up is $${MAX_TOPUP}`);
    }

    const provider = input.provider ?? "simulated";
    const reference = `topup_${randomUUID()}`;

    const topUp = await prisma.topUp.create({
      data: {
        userId,
        reference,
        amount,
        currency: input.currency ?? CURRENCY,
        provider,
        status: "PENDING",
      },
    });

    return {
      reference: topUp.reference,
      amount: Number(topUp.amount),
      currency: topUp.currency,
      provider: topUp.provider,
      status: topUp.status,
      // Simulated rails need no external redirect.
      authorizationUrl: null,
    };
  }

  /**
   * Returns a top-up's status. Simulated top-ups auto-confirm after a short
   * delay, which mirrors a provider callback without trusting the browser.
   */
  async getTopUpStatus(userId: string, reference: string) {
    const topUp = await prisma.topUp.findFirst({
      where: { reference, userId },
    });
    if (!topUp) throw NotFound("Top-up not found");

    let status = topUp.status;
    if (
      status === "PENDING" &&
      topUp.provider === "simulated" &&
      Date.now() - topUp.createdAt.getTime() >= SIMULATED_CONFIRM_MS
    ) {
      await LedgerService.creditTopUp(topUp.id);
      status = "COMPLETED";
    }

    return {
      reference: topUp.reference,
      amount: Number(topUp.amount),
      currency: topUp.currency,
      provider: topUp.provider,
      status,
      completedAt:
        status === "COMPLETED" ? new Date().toISOString() : null,
    };
  }

  /**
   * Webhook seam for real providers. Verifies the reference exists, then
   * credits exactly once (idempotent by top-up id).
   */
  async confirmTopUp(reference: string, providerRef?: string) {
    const topUp = await prisma.topUp.findUnique({ where: { reference } });
    if (!topUp) throw NotFound("Top-up not found");

    const result = await LedgerService.creditTopUp(topUp.id);
    if (providerRef) {
      await prisma.topUp.update({
        where: { id: topUp.id },
        data: { providerRef },
      });
    }

    return {
      reference: topUp.reference,
      userId: topUp.userId,
      credited: result.credited,
      amount: result.amount,
      currency: topUp.currency,
    };
  }
}

export const walletService = new WalletService();
