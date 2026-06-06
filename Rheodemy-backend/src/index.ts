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
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.default.hash("password123", 12);

    // 1. Create Admin if not exists
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminExists) {
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
    }

    // 2. Create default instructor if not exists
    let instructor = await prisma.user.findUnique({ where: { email: "instructor@rheodemy.com" } });
    if (!instructor) {
      instructor = await prisma.user.create({
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

    // 3. Create default student if not exists
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

    // 4. Create default courses for instructor if none exist
    const oldCourseCount = await prisma.course.count({
      where: { instructorId: instructor.id }
    });
    // Force reseed if any old courses exist
    if (oldCourseCount > 0) {
      logger.info("🗑️ Re-seeding instructor courses to apply new screenshot UI mock courses...");
      await prisma.payout.deleteMany({ where: { transaction: { session: { course: { instructorId: instructor.id } } } } });
      await prisma.transaction.deleteMany({ where: { session: { course: { instructorId: instructor.id } } } });
      await prisma.paymentSession.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.enrollment.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.lesson.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.course.deleteMany({ where: { instructorId: instructor.id } });

      const dummyVideoUrl = "jy02Y501NLjgcgnNQbhiDQrbTtNZqIpdSYpT02KpPLzHzs";
      
      // Course 1
      const c1 = await prisma.course.create({
        data: {
          title: "Mastering TypeScript",
          description: "Learn advanced patterns, strict mode, and how to build robust enterprise applications.",
          pricePerMinute: 0.12,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c1.id, title: "Module 1: Strict Mode", description: "Learn how to use strict mode.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c1.id, title: "Module 2: Advanced Types", description: "Generics and mapped types.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
        ]
      });

      // Course 2
      const c2 = await prisma.course.create({
        data: {
          title: "The 10x Designer Handbook",
          description: "A definitive guide to systems thinking, layout architecture, and rapid prototyping.",
          pricePerMinute: 0.05,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c2.id, title: "Chapter 1: Systems Thinking", description: "Design systems.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c2.id, title: "Chapter 2: Layouts", description: "Grid and flex.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
        ]
      });

      // Course 3
      const c3 = await prisma.course.create({
        data: {
          title: "Y Combinator: Startup School (Audio)",
          description: "Listen to the world's best startup advice while commuting or running.",
          pricePerMinute: 0.02,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c3.id, title: "Episode 1: How to get ideas", description: "Paul Graham on ideas.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c3.id, title: "Episode 2: MVP", description: "Building a minimum viable product.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
        ]
      });

      // Course 4
      const c4 = await prisma.course.create({
        data: {
          title: "AI and Machine Learning Foundations",
          description: "Explore the mathematics and algorithms behind modern AI. Build linear models, basic neural networks, and deploy them.",
          pricePerMinute: 0.30,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://plus.unsplash.com/premium_photo-1683121710572-7723bd2e235d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWklMjBhbmQlMjBtYWNoaW5lJTIwbGVhcm5pbmd8ZW58MHx8MHx8fDA%3D"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c4.id, title: "Module 1: Linear Algebra", description: "Math foundations.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c4.id, title: "Module 2: Neural Networks", description: "Backpropagation.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
        ]
      });

      logger.info("👤 Auto-created 4 default courses for instructor with featured images");
    }
  } catch (error) {
    logger.error("❌ Failed to ensure default users", { error: String(error) });
  }
}

main();
