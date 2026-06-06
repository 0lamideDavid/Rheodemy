/**
 * paymentSession.service.ts — Chunky Ticker + Fail-Safe Payment Loop
 *
 * Architecture: Static Dual-Pointer / Master Faucet
 * ──────────────────────────────────────────────────
 * - Virtual balance is decremented on session end via a single ILP payment
 * - Active sessions live in-memory (Map) — acceptable for hackathon demo
 *
 * Session termination triggers:
 *   1. User calls POST /sessions/:id/end
 *   2. Admin calls POST /sessions/:id/kill (Phase 5)
 */

import { prisma } from '../config/prisma';
import { RafikiService } from './rafiki.service';
import { RafikiConfig } from '../config/rafiki';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { SocketService } from '../socket/index';

// ── Ticker state (in-memory) ──────────────────────────────────────────────────

// ── State (in-memory) ──────────────────────────────────────────────────

const activeSessions = new Set<string>();

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StartSessionInput {
  userId:   string;
  courseId: string;
  lessonId?: string;
}

export interface TickResult {
  transactionId: string;
  payoutId:      string;
  amountPaid:    number;
  currency:      string;        // always USD (base)
  localAmount:   number;        // amountPaid converted to student's display currency
  localCurrency: string;        // e.g. 'NGN'
  fxRate:        number;        // rate used for conversion
  ilpRef:        string;        // outgoing payment URL — unique ILP reference
  tickIndex:     number;
  totalPaid:     number;        // session running total (USD) after this tick
  totalPaidLocal: number;       // session running total in local currency
}

export interface SessionSummary {
  sessionId:  string;
  status:     string;
  totalPaid:  number;
  currency:   string;
  startedAt:  Date;
  endedAt:    Date | null;
  tickCount:  number;
}

// ── PaymentSessionService ─────────────────────────────────────────────────────

export class PaymentSessionService {

  /**
   * Opens a new PaymentSession.
   */
  static async startSession(input: StartSessionInput): Promise<{ sessionId: string }> {
    const { userId, courseId, lessonId } = input;

    // Ensure student has sufficient virtual balance before starting
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      console.warn(`[PaymentSession] Student wallet not found for user ${userId}. Auto-creating default wallet...`);
      wallet = await prisma.wallet.create({
        data: {
          userId,
          walletAddress: `https://ilp.interledger-test.dev/${userId}`,
          provider: "rafiki",
          currency: "USD"
        }
      });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const session = await prisma.paymentSession.create({
      data: {
        userId,
        courseId,
        ...(lessonId ? { lessonId } : {}),
        totalPaid: 0,
        status: 'ACTIVE',
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const studentName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Anonymous Student';

    activeSessions.add(session.id);

    // Notify connected clients
    SocketService.emitSessionStarted(session.id, userId, courseId, course.instructorId, course.title, studentName);

    console.log(
      `[PaymentSession] ▶ Session ${session.id} started.`
    );

    return { sessionId: session.id };
  }

  /**
   * Ends a session cleanly — called by the student clicking "Stop" or tab close.
   */
  static async endSession(sessionId: string, totalAmount: number): Promise<SessionSummary> {
    activeSessions.delete(sessionId);

    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: { course: true, user: true }
    });

    if (!session || session.status !== 'ACTIVE') {
      throw new AppError('Session not found or already ended', 400);
    }

    // 2. Attempt ILP payment for the total amount
    let ilpResult: any;
    if (totalAmount > 0) {
      try {
        ilpResult = await RafikiService.executeTickPayment(totalAmount);
      } catch (ilpError) {
        console.error(
          `[PaymentSession] ✗ Final payment FAILED for session ${sessionId}. ` +
          `Killing session. Error:`, ilpError
        );
        return await PaymentSessionService._killSession(sessionId, 'ILP payment failed');
      }

      // 3. ILP succeeded — now safely record in DB within a transaction
      const platformFee  = parseFloat((totalAmount * 0.1).toFixed(9));  // 10% cut
      const netAmount    = parseFloat((totalAmount - platformFee).toFixed(9));

      await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            sessionId,
            amount:       totalAmount,
            platformFee,
            netAmount,
            currency:     RafikiConfig.assetCode,
            ilpPacketRef: ilpResult.outgoingPaymentId,
            tickIndex:    1,
          },
        });

        await tx.payout.create({
          data: {
            transactionId:   transaction.id,
            instructorWallet: process.env.TEACHER_WALLET_ADDRESS!,
            amount:           netAmount,
            currency:         RafikiConfig.assetCode,
            status:           'SUCCESS',
            ilpPacketRef:     ilpResult.outgoingPaymentId,
          },
        });

        await tx.paymentSession.update({
          where: { id: sessionId },
          data:  { totalPaid: { increment: totalAmount } },
        });
      });
    }

    const now = new Date();
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data:  { status: 'ENDED', endedAt: now },
    });

    logger.info(`[PaymentSession] ■ Session ${sessionId} ENDED. $${Number(updatedSession.totalPaid).toFixed(6)} total paid.`);

    const summary: SessionSummary = {
      sessionId,
      status:    'ENDED',
      totalPaid: Number(updatedSession.totalPaid),
      currency:  RafikiConfig.assetCode,
      startedAt: updatedSession.startedAt,
      endedAt:   now,
      tickCount: totalAmount > 0 ? 1 : 0,
    };

    SocketService.emitSessionEnded(sessionId, summary, session.course.instructorId);

    return summary;
  }



  /**
   * Returns current session status — used by polling or admin dashboard.
   */
  static async getSession(sessionId: string): Promise<SessionSummary> {
    const session = await prisma.paymentSession.findUniqueOrThrow({
      where: { id: sessionId },
    });

    return {
      sessionId,
      status:    session.status,
      totalPaid: Number(session.totalPaid),
      currency:  RafikiConfig.assetCode,
      startedAt: session.startedAt,
      endedAt:   session.endedAt ?? null,
      tickCount: 0,
    };
  }

  /**
   * Returns all currently ACTIVE session IDs (for admin dashboard).
   */
  static getActiveSessionIds(): string[] {
    return Array.from(activeSessions);
  }

  /**
   * Force-kills a session — called by the kill switch endpoint (Phase 5) or on ILP failure.
   */
  static async killSession(sessionId: string): Promise<SessionSummary> {
    return PaymentSessionService._killSession(sessionId, 'Admin kill switch');
  }

  /**
   * Internal kill implementation — used by both ILP failure and kill switch.
   */
  static async _killSession(sessionId: string, reason: string): Promise<SessionSummary> {
    activeSessions.delete(sessionId);

    const now = new Date();
    const session = await prisma.paymentSession.update({
      where: { id: sessionId },
      data:  { status: 'KILLED', endedAt: now, killSwitchAt: now },
    });

    logger.info(`[PaymentSession] ✗ Session ${sessionId} KILLED. Reason: ${reason}.`);

    SocketService.emitSessionKilled(sessionId, reason);

    return {
      sessionId,
      status:    'KILLED',
      totalPaid: Number(session.totalPaid),
      currency:  RafikiConfig.assetCode,
      startedAt: session.startedAt,
      endedAt:   now,
      tickCount: 0,
    };
  }
}
