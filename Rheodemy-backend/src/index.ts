import http from "http";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { initSocketServer } from "./socket/index";
import { logger } from "./utils/logger";

/**
 * Server entrypoint.
 * 1. Validates env vars (env.ts crashes on import if invalid)
 * 2. Creates HTTP server (needed to share with Socket.io)
 * 3. Attaches Socket.io to HTTP server
 * 4. Tests DB connection
 * 5. Starts listening
 * 6. Handles graceful shutdown (SIGINT/SIGTERM)
 */

async function main() {
  try {
    // Create shared HTTP server (Express + Socket.io share the same port)
    const httpServer = http.createServer(app);

    // Attach Socket.io
    initSocketServer(httpServer);

    // Test DB connection
    await prisma.$connect();
    logger.info("✅ Database connected");

    // Auto-create default users if missing (without cleaning data)
    await ensureDefaultUsers();

    // Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Rheodemy server running on port ${env.PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`🔑 Auth API:     http://localhost:${env.PORT}/api/auth`);
      logger.info(`⚡ Socket.io:    ws://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server", { error: String(error) });
    process.exit(1);
  }
}

// ── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown() {
  logger.info("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function ensureDefaultUsers() {
  try {
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminExists) {
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.default.hash("password123", 12);
      
      // Create admin
      await prisma.user.create({
        data: {
          firstName: "Admin",
          lastName: "User",
          email: "admin@rheodemy.com",
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      });
      logger.info("👤 Auto-created default admin user");

      // Create default instructor if not exists
      const instructorExists = await prisma.user.findUnique({ where: { email: "instructor@rheodemy.com" } });
      if (!instructorExists) {
        const instructor = await prisma.user.create({
          data: {
            firstName: "Jane",
            lastName: "Doe",
            email: "instructor@rheodemy.com",
            passwordHash,
            role: "INSTRUCTOR",
            status: "ACTIVE",
          },
        });
        await prisma.wallet.create({
          data: {
            userId: instructor.id,
            walletAddress: "https://rafiki.example.com/instructor",
            provider: "rafiki",
            currency: "USD",
          },
        });
        logger.info("👤 Auto-created default instructor user & wallet");
      }

      // Create default student if not exists
      const studentExists = await prisma.user.findUnique({ where: { email: "student@rheodemy.com" } });
      if (!studentExists) {
        const student = await prisma.user.create({
          data: {
            firstName: "John",
            lastName: "Smith",
            email: "student@rheodemy.com",
            passwordHash,
            role: "STUDENT",
            status: "ACTIVE",
          },
        });
        await prisma.wallet.create({
          data: {
            userId: student.id,
            walletAddress: "https://rafiki.example.com/student",
            provider: "rafiki",
            currency: "USD",
          },
        });
        logger.info("👤 Auto-created default student user & wallet");
      }
    }
  } catch (error) {
    logger.error("❌ Failed to ensure default users", { error: String(error) });
  }
}

main();
