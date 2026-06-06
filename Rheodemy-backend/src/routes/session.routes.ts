/**
 * session.routes.ts — ILP Payment Session routes
 *
 * All routes require authentication (JWT guard).
 * Kill switch is additionally guarded by INSTRUCTOR or ADMIN role.
 *
 * Routes:
 *   POST   /sessions/start       → Start a new payment session + Chunky Ticker
 *   POST   /sessions/:id/end     → End session cleanly, stop ticker, return summary
 *   POST   /sessions/:id/kill    → Force-kill session (admin / instructor kill switch)
 *   GET    /sessions/:id         → Get session status and running total
 */

import { Router } from 'express';
import { PaymentSessionController } from '../controllers/paymentSession.controller';
import { authenticate, authorize } from '../middleware/authenticate';

const router = Router();

// All session routes require a valid JWT
router.use(authenticate);

// ── Session lifecycle ─────────────────────────────────────────────────────────

router.post('/start',     (req, res, next) => PaymentSessionController.startSession(req, res, next));
router.post('/:id/tick',  (req, res, next) => PaymentSessionController.tickSession(req, res, next));
router.post('/:id/end',   (req, res, next) => PaymentSessionController.endSession(req, res, next));
router.get('/:id',        (req, res, next) => PaymentSessionController.getSession(req, res, next));

// ── Kill switch — INSTRUCTOR or ADMIN only ────────────────────────────────────
router.post('/:id/kill',
  authorize('INSTRUCTOR', 'ADMIN'),
  (req, res, next) => PaymentSessionController.killSession(req, res, next)
);

export default router;
