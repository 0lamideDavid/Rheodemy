import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { Unauthorized, Forbidden } from "../utils/errors";
import { Role } from "@prisma/client";

/**
 * Extend Express Request to carry the authenticated user's identity.
 * After authenticate() runs, req.user is always available.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and blocks BANNED/SUSPENDED users on every request.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw Unauthorized("No authentication token provided");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    // Block banned/suspended users at the gate
    if (payload.status === "BANNED") {
      throw Forbidden("Your account has been banned");
    }
    if (payload.status === "SUSPENDED") {
      throw Forbidden("Your account is suspended");
    }

    // Attach user identity to request
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware factory.
 * Usage: authorize("INSTRUCTOR", "ADMIN")
 * Must be used AFTER authenticate().
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(Unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(Forbidden("You do not have permission to access this resource"));
    }

    next();
  };
}
