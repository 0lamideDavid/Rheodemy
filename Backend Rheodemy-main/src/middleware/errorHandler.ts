import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

/**
 * Global Express error handler.
 * Must have 4 parameters so Express recognizes it as an error handler.
 *
 * - AppError (operational): return the status code and message from the error.
 * - Unknown errors: return 500 and a generic message (don't leak internals).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log all errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // JWT-specific errors (from jsonwebtoken library)
  if (err.name === "JsonWebTokenError") {
    sendError(res, "Invalid authentication token", 401);
    return;
  }
  if (err.name === "TokenExpiredError") {
    sendError(res, "Authentication token has expired", 401);
    return;
  }

  // Unknown / unexpected errors — don't leak details
  sendError(res, "Internal server error", 500);
}
