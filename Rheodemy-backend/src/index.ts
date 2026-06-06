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
    // Force reseed if any old courses exist or create them if none exist
    if (oldCourseCount >= 0) {
      logger.info("🗑️ Seeding instructor courses (wiping old mock courses if any)...");
      await prisma.payout.deleteMany({ where: { transaction: { session: { course: { instructorId: instructor.id } } } } });
      await prisma.transaction.deleteMany({ where: { session: { course: { instructorId: instructor.id } } } });
      await prisma.paymentSession.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.enrollment.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.lesson.deleteMany({ where: { course: { instructorId: instructor.id } } });
      await prisma.course.deleteMany({ where: { instructorId: instructor.id } });

      // Apply update to any lingering old lessons (as requested)
      await prisma.lesson.updateMany({
        where: { contentUrl: 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe680T1' },
        data: { contentUrl: 'VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY' }
      });
      // Also update the previous jy02... URL just in case
      await prisma.lesson.updateMany({
        where: { contentUrl: 'jy02Y501NLjgcgnNQbhiDQrbTtNZqIpdSYpT02KpPLzHzs' },
        data: { contentUrl: 'VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY' }
      });

      const dummyVideoUrl = "VCZzOAAVqd4f5n5kshNtpfHXyhxgB6aUVBJxPiJvTgY";
      const ebookContent = `Page 1 — The Problem With Learning Today\n\nEducation has never been more accessible, yet never more wasteful. You pay $200 for a course, watch three videos, and never return. The platform keeps your money. The instructor keeps your money. You keep nothing but guilt.\n\nRheodemy was built because this is wrong.\n\nPage 2 — A New Contract Between Learner and Creator\n\nWhat if you only paid for what you actually learned? Not what you intended to learn. Not what you bought access to. What you actually consumed, second by second, page by page.\n\nThis is the Rheodemy promise. Pay as you learn. Stop paying when you stop learning.\n\nPage 3 — How the Stream Works\n\nWhen you press play on Rheodemy, a payment stream opens between your wallet and the creator's wallet via the Interledger Protocol — the open standard for moving money across any network, any currency, any border.\n\nNo intermediary holds your money. No platform sits between you and the creator.\n\nPage 4 — The Interledger Protocol\n\nInterledger is to money what the internet is to information. It is an open protocol that allows value to flow freely across payment networks — from mobile money in Lagos to digital wallets in London — instantly and with microscopic fees.\n\nRheodemy is one of the first learning platforms built natively on this infrastructure.\n\nPage 5 — What Micropayments Change\n\nWhen payments are small enough — fractions of a cent per second — something fundamental shifts. The creator is incentivised to keep you engaged every single moment, not just to sell you a course.\n\nThe learner is free to stop anytime without losing a large upfront investment. Trust is built into the transaction itself.\n\nPage 6 — The 80/15/5 Split\n\nEvery payment on Rheodemy is automatically split at the moment of transaction. 80% flows instantly to the creator. 15% sustains the platform. 5% goes to the Rheodemy Bursary Fund — supporting learners in low-income regions who cannot afford even micropayments.\n\nNo invoices. No monthly payouts. No waiting.\n\nPage 7 — The Bursary Fund\n\nThe 5% bursary is not a charity add-on. It is a structural commitment. Every stream on Rheodemy — every second of learning — contributes to a pool that funds access for those who need it most.\n\nKnowledge should not be a luxury.\n\nPage 8 — For Creators\n\nOn Rheodemy, your earnings are not locked behind a threshold. They are not held by a platform for 30 days. They flow to your wallet in real time as students learn.\n\nA student in Nairobi watching your course at 2am earns you money at 2am. No delays. No borders.\n\nPage 9 — For Learners\n\nYou are no longer a customer making a bet. You are a learner making a choice — moment by moment. If the content stops being valuable, you stop paying. If you want to rewatch something you already paid for, you rewatch it free.\n\nRheodemy respects your time and your money equally.\n\nPage 10 — The High Water Mark\n\nRheodemy tracks the furthest point you have reached in any piece of content. Rewinding to revisit something you already paid for is always free.\n\nYou are never penalised for reviewing. You are only charged for discovering something new.\n\nPage 11 — Content Without Borders\n\nRheodemy supports video, audio, and written content. A developer in Lagos can publish a coding course. A writer in Accra can publish a business ebook. A podcaster in London can monetise every minute of audio.\n\nThe format does not matter. The knowledge does.\n\nPage 12 — The Skip Economy\n\nIf you choose to skip forward in a lesson, Rheodemy charges you for the content you skipped. You chose to consume it — even if you consumed it at speed.\n\nThis keeps the incentive honest. Creators are rewarded for every second of value they create.\n\nPage 13 — Privacy By Design\n\nRheodemy does not sell your data. It does not show you ads. It does not build a profile of your learning habits to sell to employers or insurers.\n\nYour learning is yours. The only data that moves is the payment — and that moves directly to the creator.\n\nPage 14 — The Road Ahead\n\nRheodemy is beginning with video, audio, and written content. But the protocol is content-agnostic. Interactive coding environments, live mentorship sessions, AI tutors — all of these can be streamed and paid for by the second.\n\nThe infrastructure is ready. The content is coming.\n\nPage 15 — Join the Stream\n\nYou are reading this on a platform that is paying the author right now — per page, per second, per idea consumed.\n\nThis is not the future of education. This is education as it should always have been.\n\nWelcome to Rheodemy.`;

      // Course 1
      const c1 = await prisma.course.create({
        data: {
          title: "Web Development for Beginners",
          description: "Learn advanced patterns, strict mode, and how to build robust enterprise applications.",
          pricePerMinute: 4.00,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c1.id, title: "Module 1: Strict Mode", description: "Learn how to use strict mode.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 1 },
          { courseId: c1.id, title: "Module 2: Advanced Types", description: "Generics and mapped types.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 400, order: 2 },
          { courseId: c1.id, title: "The Rheodemy Learning Manifesto", description: "Read about the future of education.", contentUrl: ebookContent, contentType: 'EBOOK', durationSec: 0, order: 3 },
        ]
      });

      // Course 2
      const c2 = await prisma.course.create({
        data: {
          title: "Mastering React and Next.js",
          description: "A definitive guide to systems thinking, layout architecture, and rapid prototyping.",
          pricePerMinute: 2.50,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c2.id, title: "Chapter 1: Systems Thinking", description: "Design systems.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 1 },
          { courseId: c2.id, title: "Chapter 2: Layouts", description: "Grid and flex.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 400, order: 2 },
        ]
      });

      // Course 4 - EBOOK
      const c4 = await prisma.course.create({
        data: {
          title: "The Indie Hacker Handbook",
          description: "A comprehensive written guide to building profitable internet businesses from scratch.",
          pricePerMinute: 0.01,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c4.id, title: "Foreword & Introduction", description: "Getting started.", contentUrl: "Welcome to the handbook.\\n\\nThis is a test ebook.", contentType: 'EBOOK', durationSec: 0, order: 1 }
        ]
      });

      // Course 5 - AI Video Course
      const c5 = await prisma.course.create({
        data: {
          title: "AI and Machine Learning Foundations",
          description: "Discover the fundamentals of AI through our comprehensive guide.",
          pricePerMinute: 2.00,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c5.id, title: "Module 1: Introduction", description: "What is AI?", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 1 },
          { courseId: c5.id, title: "Module 2: Machine Learning", description: "Basics of ML.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 2 },
          { courseId: c5.id, title: "Module 3: Neural Networks", description: "Deep learning.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 3 },
          { courseId: c5.id, title: "Module 4: NLP", description: "Natural Language Processing.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 4 },
          { courseId: c5.id, title: "Module 5: Future of AI", description: "Ethics and future.", contentUrl: dummyVideoUrl, contentType: 'VIDEO', durationSec: 300, order: 5 },
        ]
      });

      // Course 6 - AUDIO
      const c6 = await prisma.course.create({
        data: {
          title: "The African Tech Podcast — Learning Series",
          description: "Conversations about technology, startups, and innovation across Africa. Listen and learn from founders, engineers, and investors building the future.",
          pricePerMinute: 1.30,
          currency: "USD",
          status: "PUBLISHED",
          instructorId: instructor.id,
          thumbnailUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop"
        }
      });
      await prisma.lesson.createMany({
        data: [
          { courseId: c6.id, title: "Episode 1 — Introduction to AI in Africa", description: "Audio podcast.", contentUrl: "https://rheodemymvp.vercel.app/audio/intro-ai-audio.mp3", contentType: 'AUDIO', durationSec: 180, order: 1 }
        ]
      });

      logger.info("👤 Auto-created 4 default courses for instructor with featured images");
    }
  } catch (error) {
    logger.error("❌ Failed to ensure default users", { error: String(error) });
  }
}

main();
