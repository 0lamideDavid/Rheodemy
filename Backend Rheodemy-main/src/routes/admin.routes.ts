/**
 * admin.routes.ts — Admin dashboard routes
 *
 * All routes require: authenticated JWT + ADMIN role.
 *
 * Routes:
 *   GET /admin/sessions          — Live active session list
 *   GET /admin/sessions/history  — Paginated session history
 *   GET /admin/fx/rates          — Current FX rate table
 *   GET /admin/fx/convert        — Currency conversion
 */

import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/authenticate';

const router = Router();

// All admin routes require a valid JWT + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ── Session Management ────────────────────────────────────────────────────────
router.get('/sessions',         (req, res, next) => AdminController.getActiveSessions(req, res, next));
router.get('/sessions/history', (req, res, next) => AdminController.getSessionHistory(req, res, next));

// ── FX Controls ───────────────────────────────────────────────────────────────
router.get('/fx/rates',   (req, res, next) => AdminController.getFxRates(req, res, next));
router.get('/fx/convert', (req, res, next) => AdminController.convertCurrency(req, res, next));

export default router;
