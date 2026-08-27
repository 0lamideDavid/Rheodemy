import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../types/auth.types";
import { sendSuccess } from "../utils/response";
import { BadRequest } from "../utils/errors";

/**
 * AuthController — thin HTTP layer.
 * Validates input with Zod, delegates to AuthService, sends response.
 * Zero business logic here.
 */

export class AuthController {
  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw BadRequest(
          Object.values(errors).flat().join(", ") || "Validation failed"
        );
      }

      const result = await authService.register(parsed.data);
      sendSuccess(res, result, "Registration successful", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        throw BadRequest(
          Object.values(errors).flat().join(", ") || "Validation failed"
        );
      }

      const result = await authService.login(parsed.data);
      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(req.user!.userId);
      sendSuccess(res, result, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
