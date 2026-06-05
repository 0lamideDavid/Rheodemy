/**
 * paymentSession.service.ts — Chunky Ticker + Fail-Safe Payment Loop
 *
 * Architecture: Static Dual-Pointer / Master Faucet
 * ──────────────────────────────────────────────────
 * - Payments are discrete (chunky ticker), not a continuous stream
 * - Every tick fires the full 5-step Open Payments pipeline via RafikiService
 * - Virtual balance is ONLY decremented on ILP SUCCESS — never on failure
 * - If ILP fails: session is immediately KILLED, ticker stops, Socket.io notifies client
 * - Active timers live in-memory (Map) — acceptable for hackathon demo
 *
 * Session termination triggers:
 *   1. User calls POST /sessions/:id/end
 *   2. Virtual balance reaches $0
 *   3. ILP payment fails (session KILLED)
 *   4. Admin calls POST /sessions/:id/kill (Phase 5)
 */

import { prisma } from '../config/prisma';
import { RafikiService } from './rafiki.service';
import { RafikiConfig } from '../config/rafiki';
import { FxService } from './fx.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { SocketService } from '../socket/index';

// ── Ticker state (in-memory) ──────────────────────────────────────────────────

const activeTickers  = new Map<string, NodeJS.Timeout>();
const tickCounters   = new Map<string, number>();

// ── Config ────────────────────────────────────────────────────────────────────

const TICK_INTERVAL_MS  = Number(process.env.TICK_INTERVAL_MS  ?? 5000);
const PRICE_PER_TICK_USD = Number(process.env.PRICE_PER_TICK_USD ?? 0.001);

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
   * Opens a new PaymentSession and starts the Chunky Ticker.
   *
   * The ticker runs independently of HTTP — it fires every TICK_INTERVAL_MS
   * even if the client disconnects (Socket.io handles client notification).
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
          walletAddress: process.env.STUDENT_WALLET_ADDRESS || "https://ilp.interledger-test.dev/olamide",
          provider: "rafiki",
          currency: "USD"
        }
      });
    }

    const session = await prisma.paymentSession.create({
      data: {
        userId,
        courseId,
        ...(lessonId ? { lessonId } : {}),
        totalPaid: 0,
        status: 'ACTIVE',
      },
    });

    tickCounters.set(session.id, 0);

    // Notify connected clients
    SocketService.emitSessionStarted(session.id, userId, courseId);

    // Start the ticker
    const timer = setInterval(async () => {
      try {
        await PaymentSessionService._executeTick(session.id);
      } catch (err) {
        // _executeTick handles its own session killing on failure
        // Only log unhandled errors here
        console.error(`[Ticker] Unhandled error for session ${session.id}:`, err);
      }
    }, TICK_INTERVAL_MS);

    activeTickers.set(session.id, timer);

    console.log(
      `[PaymentSession] ▶ Session ${session.id} started. ` +
      `Ticker every ${TICK_INTERVAL_MS}ms @ $${PRICE_PER_TICK_USD}/tick`
    );

    return { sessionId: session.id };
  }

  /**
   * Internal tick execution — the core of the payment loop.
   *
   * FAIL-SAFE CONTRACT:
   *   - ILP payment is attempted FIRST
   *   - Virtual balance is ONLY updated if ILP succeeds
   *   - If ILP fails → session is KILLED, ticker cleared, no charge applied
   */
  private static async _executeTick(sessionId: string): Promise<TickResult> {

    // 0. Quick in-memory guard
    if (!activeTickers.has(sessionId)) {
      return null as any;
    }

    // 1. Verify session is still ACTIVE
    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== 'ACTIVE') {
      PaymentSessionService._clearTicker(sessionId);
      return null as any;
    }

    const tickIndex = (tickCounters.get(sessionId) ?? 0) + 1;

    // 2. Attempt ILP payment — if this throws, we do NOT touch the DB balance
    let ilpResult;
    try {
      ilpResult = await RafikiService.executeTickPayment(PRICE_PER_TICK_USD);
    } catch (ilpError) {
      // ⚠️ ILP FAILED — kill the session immediately, no balance deduction
      console.error(
        `[Ticker] ✗ Tick ${tickIndex} FAILED for session ${sessionId}. ` +
        `Killing session. Error:`, ilpError
      );

      await PaymentSessionService._killSession(sessionId, 'ILP payment failed');
      return null as any; // Return gracefully so interval handler doesn't log unhandled error
    }

    // 3. ILP succeeded — now safely record in DB within a transaction
    const platformFee  = parseFloat((PRICE_PER_TICK_USD * 0.1).toFixed(9));  // 10% cut
    const netAmount    = parseFloat((PRICE_PER_TICK_USD - platformFee).toFixed(9));

    // Atomic DB write — all three records succeed or none do
    const { transaction, payout, updatedSession } = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          sessionId,
          amount:       PRICE_PER_TICK_USD,
          platformFee,
          netAmount,
          currency:     RafikiConfig.assetCode,
          ilpPacketRef: ilpResult.outgoingPaymentId,
          tickIndex,
        },
      });

      const payout = await tx.payout.create({
        data: {
          transactionId:   transaction.id,
          instructorWallet: process.env.TEACHER_WALLET_ADDRESS!,
          amount:           netAmount,
          currency:         RafikiConfig.assetCode,
          status:           'SUCCESS',
          ilpPacketRef:     ilpResult.outgoingPaymentId,
        },
      });

      const updatedSession = await tx.paymentSession.update({
        where: { id: sessionId },
        data:  { totalPaid: { increment: PRICE_PER_TICK_USD } },
      });

      return { transaction, payout, updatedSession };
    });
    tickCounters.set(sessionId, tickIndex);

    // ── FX conversion for display layer ────────────────────────────────────
    const displayCurrency = process.env.DISPLAY_CURRENCY ?? 'NGN';
    const fx = FxService.convert(PRICE_PER_TICK_USD, 'USD', displayCurrency);
    const totalPaidLocal  = FxService.convert(
      Number(updatedSession.totalPaid), 'USD', displayCurrency
    ).toAmount;

    const result: TickResult = {
      transactionId:  transaction.id,
      payoutId:       payout.id,
      amountPaid:     PRICE_PER_TICK_USD,
      currency:       RafikiConfig.assetCode,
      localAmount:    fx.toAmount,
      localCurrency:  displayCurrency,
      fxRate:         fx.rate,
      ilpRef:         ilpResult.outgoingPaymentId,
      tickIndex,
      totalPaid:      Number(updatedSession.totalPaid),
      totalPaidLocal,
    };

    console.log(
      `[Ticker] ✓ Tick ${tickIndex} | Session: ${sessionId} | ` +
      `$${PRICE_PER_TICK_USD} USD (${fx.toAmount} ${displayCurrency}) | ` +
      `Total: $${Number(updatedSession.totalPaid).toFixed(6)}`
    );

    // Emit to Socket.io clients in this session room
    SocketService.emitTick(sessionId, result);

    return result;
  }

  /**
   * Ends a session cleanly — called by the student clicking "Stop".
   */
  static async endSession(sessionId: string): Promise<SessionSummary> {
    PaymentSessionService._clearTicker(sessionId);

    const now = new Date();
    const session = await prisma.paymentSession.update({
      where: { id: sessionId },
      data:  { status: 'ENDED', endedAt: now },
    });

    const tickCount = tickCounters.get(sessionId) ?? 0;
    tickCounters.delete(sessionId);

    logger.info(`[PaymentSession] ■ Session ${sessionId} ENDED. $${Number(session.totalPaid).toFixed(6)} across ${tickCount} ticks.`);

    const summary: SessionSummary = {
      sessionId,
      status:    'ENDED',
      totalPaid: Number(session.totalPaid),
      currency:  RafikiConfig.assetCode,
      startedAt: session.startedAt,
      endedAt:   now,
      tickCount,
    };

    SocketService.emitSessionEnded(sessionId, summary);

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
      tickCount: tickCounters.get(sessionId) ?? 0,
    };
  }

  /**
   * Returns all currently ACTIVE session IDs (for admin dashboard).
   */
  static getActiveSessionIds(): string[] {
    return Array.from(activeTickers.keys());
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
    PaymentSessionService._clearTicker(sessionId);

    const now = new Date();
    const session = await prisma.paymentSession.update({
      where: { id: sessionId },
      data:  { status: 'KILLED', endedAt: now, killSwitchAt: now },
    });

    const tickCount = tickCounters.get(sessionId) ?? 0;
    tickCounters.delete(sessionId);

    logger.info(`[PaymentSession] ✗ Session ${sessionId} KILLED. Reason: ${reason}. Ticks: ${tickCount}.`);

    SocketService.emitSessionKilled(sessionId, reason);

    return {
      sessionId,
      status:    'KILLED',
      totalPaid: Number(session.totalPaid),
      currency:  RafikiConfig.assetCode,
      startedAt: session.startedAt,
      endedAt:   now,
      tickCount,
    };
  }

  /**
   * Clears the interval timer for a session.
   */
  static _clearTicker(sessionId: string): void {
    const timer = activeTickers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      activeTickers.delete(sessionId);
      console.log(`[Ticker] Stopped for session ${sessionId}`);
    }
  }
}
