import { Response } from "express";

/**
 * Standardized JSON response format.
 * Every endpoint returns { success, message, data } — no exceptions.
 */

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message = "Something went wrong",
  statusCode = 500
): void {
  const response: ApiResponse = { success: false, message };
  res.status(statusCode).json(response);
}
