/**
 * Custom application error.
 * Extends native Error with an HTTP status code so the global
 * error handler can return the correct response without guessing.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8 (Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Convenience factories ────────────────────────────────────────────────────

export const BadRequest = (msg = "Bad request") => new AppError(msg, 400);
export const Unauthorized = (msg = "Unauthorized") => new AppError(msg, 401);
export const Forbidden = (msg = "Forbidden") => new AppError(msg, 403);
export const NotFound = (msg = "Resource not found") => new AppError(msg, 404);
export const Conflict = (msg = "Conflict") => new AppError(msg, 409);
export const InternalError = (msg = "Internal server error") =>
  new AppError(msg, 500, false);
