/**
 * paymentSession.controller.ts — HTTP handlers for payment sessions
 *
 * Thin layer: validate request → call PaymentSessionService → return JSON.
 * No business logic here.
 *
 * Endpoints:
 *   POST /sessions/start     → startSession()
 *   POST /sessions/:id/end   → endSession()
 *   POST /sessions/:id/kill  → killSession()  (admin kill switch)
 *   GET  /sessions/:id       → getSession()   (status check)
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentSessionService } from '../services/paymentSession.service';
import { sendSuccess } from '../utils/response';
import { BadRequest } from '../utils/errors';

// ── Validation Schemas ────────────────────────────────────────────────────────

const StartSessionSchema = z.object({
  courseId: z.string().uuid('courseId must be a valid UUID'),
  lessonId: z.string().uuid('lessonId must be a valid UUID').optional(),
});

// ── Controller ────────────────────────────────────────────────────────────────

export class PaymentSessionController {

  /**
   * POST /sessions/start
   * Body: { courseId, lessonId? }
   *
   * Opens a PaymentSession and starts the Chunky Ticker.
   * Wallet addresses are resolved from ENV — no client input needed.
   */
  static async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = StartSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw BadRequest(
          Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
        );
      }

      const userId = req.user!.userId;
      const result = await PaymentSessionService.startSession({
        userId,
        courseId: parsed.data.courseId,
        lessonId: parsed.data.lessonId,
      });

      sendSuccess(res, result, 'Payment session started. Chunky Ticker is running.', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/end
   * Stops the ticker and marks the session ENDED.
   */
  static async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await PaymentSessionService.endSession(req.params.id);
      sendSuccess(res, summary, 'Session ended successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/kill
   * Force-kills a session — admin kill switch.
   */
  static async killSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await PaymentSessionService.killSession(req.params.id);
      sendSuccess(res, summary, 'Session killed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /sessions/:id
   * Returns current session status and running total.
   */
  static async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await PaymentSessionService.getSession(req.params.id);
      sendSuccess(res, summary, 'Session retrieved');
    } catch (err) {
      next(err);
    }
  }
}
