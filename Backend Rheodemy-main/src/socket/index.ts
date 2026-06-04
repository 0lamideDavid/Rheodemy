/**
 * socket/index.ts — Socket.io server setup and SocketService
 *
 * Architecture:
 * ─────────────
 * The Socket.io server is attached to the same HTTP server as Express.
 * Clients connect using a JWT (sent as a handshake auth token) which is
 * verified before the connection is accepted.
 *
 * Client-side connection:
 *   const socket = io('http://localhost:4000', {
 *     auth: { token: '<JWT from login>' }
 *   });
 *
 * Events emitted by server → client:
 *   payment:tick   — every chunky ticker interval (tick result with FX data)
 *   session:started — when a new payment session begins
 *   session:ended   — when session ends gracefully
 *   session:killed  — when session is force-killed (ILP failure or admin)
 *
 * Room strategy:
 *   Each session gets its own Socket.io room: `session:<sessionId>`
 *   Students are joined to their session room on connection by providing
 *   their sessionId via socket query param.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

// ── Singleton Socket.io server ────────────────────────────────────────────────

let _io: SocketServer | null = null;

/**
 * Initialise the Socket.io server and attach it to the HTTP server.
 * Call this once from src/index.ts after creating the HTTP server.
 */
export function initSocketServer(httpServer: HttpServer): SocketServer {
  _io = new SocketServer(httpServer, {
    cors: {
      origin: '*',           // tighten for production
      methods: ['GET', 'POST'],
    },
  });

  // ── JWT Auth Middleware ───────────────────────────────────────────────────
  _io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      logger.warn('[Socket.io] Connection rejected — no token', { id: socket.id });
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyToken(token);
      // Attach user info to the socket for use in event handlers
      (socket as any).user = payload;
      next();
    } catch {
      logger.warn('[Socket.io] Connection rejected — invalid token', { id: socket.id });
      next(new Error('Invalid token'));
    }
  });

  // ── Connection Handler ────────────────────────────────────────────────────
  _io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info('[Socket.io] Client connected', {
      socketId: socket.id,
      userId: user?.userId,
      role: user?.role,
    });

    // Client can join a session room by emitting 'join:session'
    socket.on('join:session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      logger.info('[Socket.io] Client joined session room', {
        socketId: socket.id,
        sessionId,
      });
      socket.emit('joined', { sessionId });
    });

    socket.on('disconnect', (reason) => {
      logger.info('[Socket.io] Client disconnected', {
        socketId: socket.id,
        reason,
      });
    });
  });

  logger.info('[Socket.io] Server initialised ✓');
  return _io;
}

/**
 * Returns the Socket.io server instance.
 * Throws if initSocketServer() has not been called yet.
 */
export function getIO(): SocketServer {
  if (!_io) {
    throw new Error('[Socket.io] Server not initialised. Call initSocketServer() first.');
  }
  return _io;
}

// ── SocketService — event emitters ───────────────────────────────────────────

export const SocketService = {
  /**
   * Emitted on every chunky ticker interval.
   * Delivers the full TickResult (including FX data) to clients in the session room.
   */
  emitTick(sessionId: string, tickResult: object): void {
    if (!_io) return;
    _io.to(`session:${sessionId}`).emit('payment:tick', { sessionId, ...tickResult });
    logger.debug('[Socket.io] payment:tick emitted', { sessionId });
  },

  /**
   * Emitted when a new payment session starts.
   */
  emitSessionStarted(sessionId: string, userId: string, courseId: string): void {
    if (!_io) return;
    _io.to(`session:${sessionId}`).emit('session:started', {
      sessionId,
      userId,
      courseId,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Emitted when a session ends gracefully.
   */
  emitSessionEnded(sessionId: string, summary: object): void {
    if (!_io) return;
    _io.to(`session:${sessionId}`).emit('session:ended', { sessionId, ...summary });
    logger.debug('[Socket.io] session:ended emitted', { sessionId });
  },

  /**
   * Emitted when a session is force-killed (ILP failure or admin kill switch).
   */
  emitSessionKilled(sessionId: string, reason: string): void {
    if (!_io) return;
    _io.to(`session:${sessionId}`).emit('session:killed', {
      sessionId,
      reason,
      timestamp: new Date().toISOString(),
    });
    logger.debug('[Socket.io] session:killed emitted', { sessionId, reason });
  },
};
