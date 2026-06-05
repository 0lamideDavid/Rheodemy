import { prisma } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { Conflict, Unauthorized, Forbidden } from "../utils/errors";
import { RegisterInput, LoginInput } from "../types/auth.types";
import { Role } from "@prisma/client";

/**
 * AuthService — all authentication business logic.
 * Controllers call these methods; this layer talks to Prisma.
 */

export class AuthService {
  /**
   * Register a new user.
   * 1. Check if email already exists → 409 Conflict
   * 2. Hash password
   * 3. Create user record
   * 4. Sign JWT
   * 5. Return token + user (without password hash)
   */
  async register(input: RegisterInput) {
    const { firstName, lastName, email, password, role } = input;

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw Conflict("A user with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with default wallet
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: role as Role,
        wallet: {
          create: {
            walletAddress: role === "INSTRUCTOR" ? (process.env.TEACHER_WALLET_ADDRESS || "https://ilp.interledger-test.dev/rheodemy") : (process.env.STUDENT_WALLET_ADDRESS || "https://ilp.interledger-test.dev/olamide"),
            provider: "rafiki",
            currency: "USD",
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Sign token
    const token = signToken({
      userId: user.id,
      role: user.role,
      status: user.status,
    });

    return { user, token };
  }

  /**
   * Login an existing user.
   * 1. Find user by email → 401 if not found
   * 2. Compare passwords → 401 if wrong
   * 3. Check user status → 403 if BANNED/SUSPENDED
   * 4. Sign JWT
   * 5. Return token + user
   */
  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user (include passwordHash for comparison)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw Unauthorized("Invalid email or password");
    }

    // Compare passwords
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw Unauthorized("Invalid email or password");
    }

    // Check account status
    if (user.status === "BANNED") {
      throw Forbidden("Your account has been banned. Contact support.");
    }
    if (user.status === "SUSPENDED") {
      throw Forbidden("Your account is suspended. Contact support.");
    }

    // Sign token
    const token = signToken({
      userId: user.id,
      role: user.role,
      status: user.status,
    });

    // Return user without password hash
    const { passwordHash: _removed, ...safeUser } = user;

    return { user: safeUser, token };
  }
}

export const authService = new AuthService();
