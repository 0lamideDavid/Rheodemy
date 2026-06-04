/**
 * requestLogger.ts — HTTP request logging middleware
 *
 * Logs each incoming request and its response time.
 * Format: [METHOD] /path → STATUS (Xms)
 *
 * Skips the /health endpoint to avoid log noise during uptime checks.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip health check noise
  if (req.path === '/health') {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'error'
                   : res.statusCode >= 400 ? 'warn'
                   : 'info';

    logger[level](
      `${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
      req.body && Object.keys(req.body).length
        ? { body: sanitise(req.body) }
        : undefined
    );
  });

  next();
}

/**
 * Strip sensitive fields from logged request bodies.
 */
function sanitise(body: Record<string, unknown>): Record<string, unknown> {
  const REDACTED = ['password', 'passwordHash', 'privateKey', 'token'];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    result[key] = REDACTED.includes(key) ? '[REDACTED]' : value;
  }

  return result;
}
