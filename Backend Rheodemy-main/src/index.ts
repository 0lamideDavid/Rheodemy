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

main();
