/**
 * paymentSession.service.ts — Server-authoritative metered sessions.
 *
 * The server owns the money clock. Clients only start / pause / resume / end.
 * Every tick:
 *   1. Computes the charge from the course rate and the tick interval.
 *   2. Posts a balanced ledger charge (learner debit, creator 55%, platform 45%).
 *   3. Updates the session total and emits `payment:tick` + `wallet:updated`.
 *
 * At session end the gross total is settled over Open Payments (or simulated),
 * then a Transaction + Payout are recorded. If settlement fails, the ledger
 * charges for that session are reversed so the learner is not left charged.
 */

import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { RafikiService } from "./rafiki.service";
import { LedgerService } from "./ledger.service";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { SocketService } from "../socket/index";

const MIN_CHARGE_USD = 0.000001;
const SETTLEMENT_POLL_MS = 1500;
const SETTLEMENT_TIMEOUT_MS = 20000;

interface SessionRuntime {
  sessionId: string;
  userId: string;
  courseId: string;
  instructorId: string;
  pricePerMinute: number;
  unlockPrice: number;
  currency: string;
  tickIndex: number;
  totalCharged: number;
  paused: boolean;
  locked: boolean;
  timer: ReturnType<typeof setInterval> | null;
}

const activeSessions = new Map<string, SessionRuntime>();

export interface StartSessionInput {
  userId: string;
  courseId: string;
  lessonId?: string;
}

export interface SessionSummary {
  sessionId: string;
  status: string;
  totalPaid: number;
  currency: string;
  startedAt: Date;
  endedAt: Date | null;
  tickCount: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PaymentSessionService {
  private static tickSeconds(): number {
    return Math.max(1, Math.round((env.TICK_INTERVAL_MS ?? 5000) / 1000));
  }

  /**
   * Opens a new PaymentSession and starts the server ticker.
   */
  static async startSession(input: StartSessionInput): Promise<{ sessionId: string }> {
    const { userId, courseId, lessonId } = input;

    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          walletAddress:
            process.env.STUDENT_WALLET_ADDRESS ??
            `https://ilp.interledger-test.dev/${userId}`,
          provider: "rafiki",
          currency: "USD",
        },
      });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError("Course not found", 404);

    const session = await prisma.paymentSession.create({
      data: {
        userId,
        courseId,
        ...(lessonId ? { lessonId } : {}),
        totalPaid: 0,
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const studentName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Anonymous Student";

    const runtime: SessionRuntime = {
      sessionId: session.id,
      userId,
      courseId,
      instructorId: course.instructorId,
      pricePerMinute: Number(course.pricePerMinute),
      unlockPrice: Number(course.unlockPrice ?? 0),
      currency: course.currency || "USD",
      tickIndex: 0,
      totalCharged: 0,
      paused: false,
      locked: false,
      timer: null,
    };

    runtime.timer = setInterval(() => {
      void PaymentSessionService.tick(runtime);
    }, env.TICK_INTERVAL_MS ?? 5000);
    activeSessions.set(session.id, runtime);

    SocketService.emitSessionStarted(
      session.id,
      userId,
      courseId,
      course.instructorId,
      course.title,
      studentName
    );

    logger.info(`[PaymentSession] ▶ Session ${session.id} started`);
    return { sessionId: session.id };
  }

  private static async tick(runtime: SessionRuntime): Promise<void> {
    if (runtime.paused || runtime.locked) return;
    runtime.locked = true;

    try {
      const active = await prisma.paymentSession.findUnique({
        where: { id: runtime.sessionId },
        select: { status: true },
      });
      if (!active || active.status !== "ACTIVE") {
        this.stopRuntime(runtime);
        return;
      }

      const tickAmount =
        (runtime.pricePerMinute * this.tickSeconds()) / 60;
      if (!Number.isFinite(tickAmount) || tickAmount <= 0) return;

      // Respect the lifetime cap when one is configured.
      let amount = tickAmount;
      if (runtime.unlockPrice > 0) {
        const remaining = runtime.unlockPrice - runtime.totalCharged;
        if (remaining <= 0) {
          await this.endSession(runtime.sessionId, runtime.userId, false, "cap_reached");
          return;
        }
        amount = Math.min(amount, remaining);
      }

      const balance = await LedgerService.getLearnerBalance(
        runtime.userId,
        runtime.currency
      );
      if (balance < amount) {
        await this.endSession(
          runtime.sessionId,
          runtime.userId,
          false,
          "insufficient_balance"
        );
        return;
      }

      runtime.tickIndex += 1;
      const charge = await LedgerService.postCharge({
        sessionId: runtime.sessionId,
        tickIndex: runtime.tickIndex,
        gross: amount,
        learnerId: runtime.userId,
        creatorId: runtime.instructorId,
        currency: runtime.currency,
      });
      runtime.totalCharged = Number(
        (runtime.totalCharged + charge.gross).toFixed(6)
      );

      await prisma.paymentSession.update({
        where: { id: runtime.sessionId },
        data: { totalPaid: { increment: charge.gross } },
      });

      const [learnerBalance, creatorBalance] = await Promise.all([
        LedgerService.getLearnerBalance(runtime.userId, runtime.currency),
        LedgerService.getCreatorBalance(runtime.instructorId, runtime.currency),
      ]);

      const payload = {
        amountPaid: charge.gross,
        creatorEarnings: charge.creatorAmount,
        platformFee: charge.platformAmount,
        currency: runtime.currency,
        balance: learnerBalance,
        creatorBalance,
        totalPaid: runtime.totalCharged,
        tickIndex: runtime.tickIndex,
        state: "paying",
      };

      SocketService.emitTick(runtime.sessionId, payload, runtime.instructorId);
      SocketService.emitWalletUpdated(runtime.userId, {
        learnerBalance,
        creatorBalance: 0,
        currency: runtime.currency,
      });
      SocketService.emitWalletUpdated(runtime.instructorId, {
        learnerBalance: 0,
        creatorBalance,
        currency: runtime.currency,
      });
    } catch (error) {
      logger.error(`[PaymentSession] Tick failed for ${runtime.sessionId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      runtime.locked = false;
    }
  }

  private static stopRuntime(runtime: SessionRuntime) {
    if (runtime.timer) clearInterval(runtime.timer);
    runtime.timer = null;
    activeSessions.delete(runtime.sessionId);
  }

  static async pauseSession(
    sessionId: string,
    userId: string,
    isAdmin = false
  ): Promise<SessionSummary> {
    const runtime = activeSessions.get(sessionId);
    if (!runtime) throw new AppError("Session is not active", 400);
    if (!isAdmin && runtime.userId !== userId) {
      throw new AppError("You do not own this session", 403);
    }
    runtime.paused = true;
    SocketService.emitTick(sessionId, { state: "paused", totalPaid: runtime.totalCharged }, runtime.instructorId);
    return this.getSession(sessionId);
  }

  static async resumeSession(
    sessionId: string,
    userId: string,
    isAdmin = false
  ): Promise<SessionSummary> {
    const runtime = activeSessions.get(sessionId);
    if (!runtime) throw new AppError("Session is not active", 400);
    if (!isAdmin && runtime.userId !== userId) {
      throw new AppError("You do not own this session", 403);
    }
    runtime.paused = false;
    SocketService.emitTick(sessionId, { state: "paying", totalPaid: runtime.totalCharged }, runtime.instructorId);
    return this.getSession(sessionId);
  }

  /**
   * Ends a session. The server computes the total; any client-supplied amount
   * is ignored. Settles the gross total, then records Transaction + Payout.
   */
  static async endSession(
    sessionId: string,
    userId: string,
    isAdmin = false,
    reason = "ended"
  ): Promise<SessionSummary> {
    const runtime = activeSessions.get(sessionId);
    if (runtime) this.stopRuntime(runtime);

    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          include: {
            instructor: { include: { wallet: true } },
          },
        },
        user: true,
      },
    });

    if (!session) throw new AppError("Session not found", 404);
    if (!isAdmin && session.userId !== userId) {
      throw new AppError("You do not own this session", 403);
    }
    if (session.status !== "ACTIVE") {
      throw new AppError("Session already ended", 400);
    }

    const gross = runtime
      ? runtime.totalCharged
      : Number(session.totalPaid);

    // Nothing worth settling.
    if (gross < MIN_CHARGE_USD) {
      const now = new Date();
      const updated = await prisma.paymentSession.update({
        where: { id: sessionId },
        data: { status: "ENDED", endedAt: now, totalPaid: 0 },
      });
      const summary = this.toSummary(updated, runtime?.tickIndex ?? 0);
      SocketService.emitSessionEnded(sessionId, summary, session.course.instructorId);
      return summary;
    }

    const mode = env.SETTLEMENT_MODE ?? "ilp";
    let ilpRef: string | null = null;
    try {
      if (mode === "ilp") {
        const result = await RafikiService.settleGross(gross);
        ilpRef = result.outgoingPaymentId;

        // Poll until the testnet reports a terminal state (bounded).
        const deadline = Date.now() + SETTLEMENT_TIMEOUT_MS;
        let status = result.status;
        let currentId = result.outgoingPaymentId;
        while (
          status !== "COMPLETED" &&
          status !== "FAILED" &&
          Date.now() < deadline
        ) {
          await sleep(SETTLEMENT_POLL_MS);
          const payment = await RafikiService.getOutgoingPayment(currentId);
          status = payment.status;
          currentId = payment.id;
        }
        if (status === "FAILED") {
          throw new Error("Outgoing payment failed");
        }
        if (status !== "COMPLETED") {
          logger.warn(
            `[PaymentSession] Settlement ${ilpRef} still ${status}; treating as accepted for demo.`
          );
        }
      } else {
        logger.info(
          `[PaymentSession] Simulated settlement for ${sessionId}: $${gross.toFixed(6)}`
        );
      }
    } catch (settlementError) {
      logger.error(
        `[PaymentSession] Settlement failed for ${sessionId}; reversing ledger charges.`,
        {
          error:
            settlementError instanceof Error
              ? settlementError.message
              : String(settlementError),
        }
      );
      await LedgerService.reverseSessionCharges(sessionId).catch(() => undefined);
      await prisma.paymentSession.update({
        where: { id: sessionId },
        data: { status: "FAILED", endedAt: new Date(), totalPaid: 0 },
      });
      SocketService.emitSessionKilled(sessionId, "ILP settlement failed");
      throw settlementError;
    }

    const creatorShare = LedgerService.creatorShare;
    const platformFee = Number((gross * (1 - creatorShare)).toFixed(6));
    const netAmount = Number((gross * creatorShare).toFixed(6));
    const instructorWallet =
      session.course.instructor.wallet?.walletAddress ??
      process.env.PLATFORM_WALLET_ADDRESS ??
      process.env.TEACHER_WALLET_ADDRESS ??
      "";

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          sessionId,
          amount: gross,
          platformFee,
          netAmount,
          currency: session.course.currency || "USD",
          ilpPacketRef: ilpRef,
          tickIndex: Math.max(1, runtime?.tickIndex ?? 1),
        },
      });

      await tx.payout.create({
        data: {
          transactionId: transaction.id,
          instructorWallet,
          amount: netAmount,
          currency: session.course.currency || "USD",
          status: "SUCCESS",
          ilpPacketRef: ilpRef,
        },
      });

      await tx.paymentSession.update({
        where: { id: sessionId },
        data: { status: "ENDED", endedAt: now, totalPaid: gross },
      });
    });

    const updated = await prisma.paymentSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    const summary = this.toSummary(updated, runtime?.tickIndex ?? 0);
    logger.info(
      `[PaymentSession] ■ Session ${sessionId} ${reason}. $${gross.toFixed(6)} settled.`
    );
    SocketService.emitSessionEnded(sessionId, summary, session.course.instructorId);
    return summary;
  }

  static async getInstructorSessions(instructorId: string, limit = 10) {
    const sessions = await prisma.paymentSession.findMany({
      where: { course: { instructorId }, status: "ENDED" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        course: { select: { title: true, pricePerMinute: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { endedAt: "desc" },
      take: limit,
    });

    return sessions.map((s) => {
      const studentName = s.user
        ? `${s.user.firstName} ${
            s.user.lastName ? s.user.lastName[0] + "." : ""
          }`.trim()
        : "Anonymous Student";
      const totalPaid = Number(s.totalPaid);
      return {
        id: s.id,
        studentName,
        courseTitle: s.course.title,
        lessonTitle: s.lesson?.title || "General Lesson",
        totalPaid,
        durationSec:
          (totalPaid / (Number(s.course.pricePerMinute) || 1)) * 60,
        creatorEarnings: Number((totalPaid * LedgerService.creatorShare).toFixed(6)),
        endedAt: s.endedAt,
      };
    });
  }

  static async getSession(sessionId: string): Promise<SessionSummary> {
    const session = await prisma.paymentSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    const runtime = activeSessions.get(sessionId);
    return this.toSummary(session, runtime?.tickIndex ?? 0);
  }

  static getActiveSessionIds(): string[] {
    return Array.from(activeSessions.keys());
  }

  static async killSession(
    sessionId: string,
    userId: string,
    isAdmin = false
  ): Promise<SessionSummary> {
    const runtime = activeSessions.get(sessionId);
    if (runtime) {
      if (!isAdmin && runtime.userId !== userId) {
        throw new AppError("You do not own this session", 403);
      }
      this.stopRuntime(runtime);
    }

    const now = new Date();
    const session = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: { status: "KILLED", endedAt: now, killSwitchAt: now },
    });
    logger.info(`[PaymentSession] ✗ Session ${sessionId} KILLED`);
    SocketService.emitSessionKilled(sessionId, "Kill switch");
    return this.toSummary(session, runtime?.tickIndex ?? 0);
  }

  private static toSummary(
    session: {
      id: string;
      status: string;
      totalPaid: unknown;
      startedAt: Date;
      endedAt: Date | null;
    },
    tickCount: number
  ): SessionSummary {
    return {
      sessionId: session.id,
      status: session.status,
      totalPaid: Number(session.totalPaid),
      currency: "USD",
      startedAt: session.startedAt,
      endedAt: session.endedAt ?? null,
      tickCount,
    };
  }
}
