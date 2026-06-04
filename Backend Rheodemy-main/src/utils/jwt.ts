import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role, UserStatus } from "@prisma/client";

/**
 * JWT payload — what gets embedded in every token.
 * Middleware reads userId + role + status on every authenticated request.
 */
export interface JwtPayload {
  userId: string;
  role: Role;
  status: UserStatus;
}

const TOKEN_EXPIRY = "7d"; // 7 days — fine for a hackathon demo

/**
 * Sign a JWT with the user's identity.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode a JWT.
 * Throws if the token is expired, malformed, or tampered with.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
