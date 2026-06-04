/**
 * logger.ts — Structured console logger with timestamps and log levels
 *
 * Replaces raw console.log() calls with consistent, levelled output.
 * Format: [TIMESTAMP] [LEVEL] message
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.info('Server started on port 4000');
 *   logger.error('Payment failed', { sessionId, error: err.message });
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function timestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, message: string, meta?: object): string {
  const prefix = `[${timestamp()}] [${level.toUpperCase().padEnd(5)}]`;
  const metaStr = meta ? `  ${JSON.stringify(meta)}` : '';
  return `${prefix} ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: object): void {
    console.log(format('info', message, meta));
  },

  warn(message: string, meta?: object): void {
    console.warn(format('warn', message, meta));
  },

  error(message: string, meta?: object): void {
    console.error(format('error', message, meta));
  },

  debug(message: string, meta?: object): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(format('debug', message, meta));
    }
  },
};
