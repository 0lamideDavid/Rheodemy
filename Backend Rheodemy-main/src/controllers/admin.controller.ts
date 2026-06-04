/**
 * admin.controller.ts — Admin dashboard HTTP handlers
 *
 * All endpoints require ADMIN role (enforced in admin.routes.ts).
 *
 * Endpoints:
 *   GET  /admin/sessions          — List all currently ACTIVE sessions (in-memory ticker Map)
 *   GET  /admin/sessions/history  — List sessions from DB with filters
 *   GET  /admin/fx/rates          — Return current FX rate table
 */

import { Request, Response, NextFunction } from 'express';
import { SessionStatus } from '@prisma/client';
import { PaymentSessionService } from '../services/paymentSession.service';
import { FxService } from '../services/fx.service';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';

export class AdminController {

  /**
   * GET /admin/sessions
   *
   * Returns all sessions currently in the activeTickers Map — these are
   * sessions with a live running interval. Useful for demo oversight.
   */
  static async getActiveSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeIds = PaymentSessionService.getActiveSessionIds();

      // Fetch full session records from DB for each active ID
      const sessions = activeIds.length > 0
        ? await prisma.paymentSession.findMany({
            where: { id: { in: activeIds } },
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
              course: { select: { id: true, title: true, pricePerMinute: true } },
            },
            orderBy: { startedAt: 'desc' },
          })
        : [];

      sendSuccess(res, {
        count: sessions.length,
        sessions,
      }, `${sessions.length} active session(s) found`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/sessions/history?status=ENDED&limit=20&offset=0
   *
   * Paginated session history from the DB.
   * Optional filter: ?status=ACTIVE|ENDED|KILLED
   */
  static async getSessionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as SessionStatus | undefined;
      const limit  = Math.min(Number(req.query.limit  ?? 20), 100);
      const offset = Number(req.query.offset ?? 0);

      const where = status ? { status } : {};

      const [sessions, total] = await prisma.$transaction([
        prisma.paymentSession.findMany({
          where,
          include: {
            user:   { select: { id: true, firstName: true, lastName: true, email: true } },
            course: { select: { id: true, title: true } },
            transactions: {
              select: { id: true, amount: true, tickIndex: true, ilpPacketRef: true, createdAt: true },
              orderBy: { tickIndex: 'asc' },
            },
          },
          orderBy: { startedAt: 'desc' },
          take:   limit,
          skip:   offset,
        }),
        prisma.paymentSession.count({ where }),
      ]);

      sendSuccess(res, { total, limit, offset, sessions }, 'Session history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/fx/rates
   *
   * Returns the current FX rate table (loaded from env).
   * Useful during demo to confirm rates being applied to NGN display.
   */
  static async getFxRates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates      = FxService.getRates();
      const currencies = FxService.getSupportedCurrencies();
      sendSuccess(res, { base: 'USD', rates, supported: currencies }, 'FX rates retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/fx/convert?amount=0.001&from=USD&to=NGN
   *
   * One-off conversion for the demo UI or debugging.
   */
  static async convertCurrency(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const amount = Number(req.query.amount ?? 0);
      const from   = String(req.query.from ?? 'USD');
      const to     = String(req.query.to   ?? 'NGN');

      const result = FxService.convert(amount, from, to);
      sendSuccess(res, result, 'Conversion complete');
    } catch (err) {
      next(err);
    }
  }
}
