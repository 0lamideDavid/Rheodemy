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

    // 4. Create default courses for instructor if none exist (or recreate if thumbnails are missing)
    const coursesWithoutThumbnails = await prisma.course.count({
      where: { instructorId: instructor.id, thumbnailUrl: null }
    });
    const outdatedLessons = await prisma.lesson.count({
      where: { 
        OR: [
          { contentUrl: { contains: "BigBuckBunny" } },
          { contentUrl: { contains: "mov_bbb.mp4" } }
        ]
      }
    });
    if (coursesWithoutThumbnails > 0 || outdatedLessons > 0) {
      logger.info("🗑️ Re-seeding instructor courses to apply new featured images & reliable videos...");
      await prisma.course.deleteMany({ where: { instructorId: instructor.id } });
    }

    const courseCount = await prisma.course.count({ where: { instructorId: instructor.id } });
    if (courseCount === 0) {
      const dummyVideoUrl = "jy02Y501NLjgcgnNQbhiDQrbTtNZqIpdSYpT02KpPLzHzs";
      
      // Course 1
      const c1 = await prisma.course.create({
        data: {
          title: "Web Development for Beginners",
          description: "A comprehensive introduction to modern web technologies. Learn HTML, CSS, JavaScript, and start building websites.",
          pricePerMinute: 0.05,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c1.id, title: "Module 1: HTML Structure & Tags", description: "Learn how to structure web pages using HTML.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c1.id, title: "Module 1: CSS Foundations", description: "Learn how to style and design your layouts.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
          { courseId: c1.id, title: "Module 2: Responsive Design & Grid", description: "Design web pages that look great on any device.", contentUrl: dummyVideoUrl, durationSec: 500, order: 3 },
          { courseId: c1.id, title: "Module 2: JavaScript Introduction", description: "Learn JavaScript programming fundamentals.", contentUrl: dummyVideoUrl, durationSec: 600, order: 4 },
          { courseId: c1.id, title: "Module 2: DOM Manipulation", description: "Connect HTML elements with JavaScript logic.", contentUrl: dummyVideoUrl, durationSec: 700, order: 5 },
        ]
      });

      // Course 2
      const c2 = await prisma.course.create({
        data: {
          title: "Mastering React and Next.js",
          description: "Take your frontend development skills to the next level. Build robust applications with Server Components and the Next.js App Router.",
          pricePerMinute: 0.15,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c2.id, title: "Module 1: Component Architecture", description: "Understand component composition, props, and design.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c2.id, title: "Module 1: State & Lifecycle Hooks", description: "Master React state, hooks, and side effects.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
          { courseId: c2.id, title: "Module 2: Next.js Routing", description: "Learn layout architecture and dynamic routes.", contentUrl: dummyVideoUrl, durationSec: 500, order: 3 },
          { courseId: c2.id, title: "Module 2: Server Components & SSR", description: "Understand data rendering models and hydration.", contentUrl: dummyVideoUrl, durationSec: 600, order: 4 },
          { courseId: c2.id, title: "Module 2: Custom Optimization Techniques", description: "Optimize bundle sizes, images, and fonts.", contentUrl: dummyVideoUrl, durationSec: 700, order: 5 },
        ]
      });

      // Course 3
      const c3 = await prisma.course.create({
        data: {
          title: "AI and Machine Learning Foundations",
          description: "Explore the mathematics and algorithms behind modern AI. Build linear models, basic neural networks, and deploy them.",
          pricePerMinute: 0.30,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c3.id, title: "Module 1: Linear Algebra & Probability", description: "Mathematical foundations needed for machine learning.", contentUrl: dummyVideoUrl, durationSec: 300, order: 1 },
          { courseId: c3.id, title: "Module 1: Data Cleaning & Wrangling", description: "How to prepare raw datasets for model training.", contentUrl: dummyVideoUrl, durationSec: 400, order: 2 },
          { courseId: c3.id, title: "Module 2: Supervised Learning & Regression", description: "Implement your first linear regression models.", contentUrl: dummyVideoUrl, durationSec: 500, order: 3 },
          { courseId: c3.id, title: "Module 2: Neural Networks & Layers", description: "Understand perceptrons and backpropagation.", contentUrl: dummyVideoUrl, durationSec: 600, order: 4 },
          { courseId: c3.id, title: "Module 2: Cloud Model Deployment", description: "Deploy your model to an endpoint for client usage.", contentUrl: dummyVideoUrl, durationSec: 700, order: 5 },
        ]
      });

      logger.info("👤 Auto-created 3 default courses for instructor with featured images");
    }
  } catch (error) {
    logger.error("❌ Failed to ensure default users", { error: String(error) });
  }
}

main();
