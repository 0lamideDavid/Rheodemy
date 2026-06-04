import { PrismaClient, Role, UserStatus, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean existing data (order matters due to foreign keys)
  console.log("🧹 Cleaning old data...");
  await prisma.payout.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.paymentSession.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash password for all users
  const passwordHash = await bcrypt.hash("password123", 12);

  // 3. Create Instructor
  console.log("👤 Creating Instructor...");
  const instructor = await prisma.user.create({
    data: {
      firstName: "Jane",
      lastName: "Doe",
      email: "instructor@rheodemy.com",
      passwordHash,
      role: Role.INSTRUCTOR,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Instructor Wallet
  await prisma.wallet.create({
    data: {
      userId: instructor.id,
      walletAddress: "https://rafiki.example.com/instructor",
      provider: "rafiki",
      currency: "USD",
    },
  });

  // 4. Create Student
  console.log("👤 Creating Student...");
  const student = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Smith",
      email: "student@rheodemy.com",
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Student Wallet
  await prisma.wallet.create({
    data: {
      userId: student.id,
      walletAddress: "https://rafiki.example.com/student",
      provider: "rafiki",
      currency: "USD",
    },
  });

  // 5. Create Admin User
  console.log("👤 Creating Admin...");
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@rheodemy.com",
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 6. Create Courses & Lessons
  console.log("📚 Creating Courses & Lessons...");

  // Course 1: Introduction to Web3 & Interledger
  const course1 = await prisma.course.create({
    data: {
      title: "Introduction to Web3 and Interledger Protocol",
      description: "Learn how the Interledger Protocol (ILP) enables packetized micropayments across the web. We cover Rafiki, Open Payments API, and streaming mechanics.",
      pricePerMinute: 0.10, // $0.10 per minute
      currency: "USD",
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        courseId: course1.id,
        title: "Lesson 1: The Evolution of Web Payments",
        description: "An overview of traditional payments vs packet-based routing.",
        contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        durationSec: 300, // 5 mins
        order: 1,
      },
      {
        courseId: course1.id,
        title: "Lesson 2: Interledger Protocol (ILP) Deep Dive",
        description: "Understanding connector networks, peer-to-peer trust, and packets.",
        contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        durationSec: 420, // 7 mins
        order: 2,
      },
      {
        courseId: course1.id,
        title: "Lesson 3: Rafiki & Open Payments Architecture",
        description: "How to integrate Rafiki in your web app for automated billing.",
        contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        durationSec: 600, // 10 mins
        order: 3,
      },
    ],
  });

  // Course 2: Advanced TypeScript Design Patterns
  const course2 = await prisma.course.create({
    data: {
      title: "Advanced TypeScript Design Patterns",
      description: "Master clean, performant TypeScript development. Learn about generic design patterns, dependency injection, and scalable application architectures.",
      pricePerMinute: 0.25, // $0.25 per minute
      currency: "USD",
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        courseId: course2.id,
        title: "Lesson 1: Advanced Types & Generics Constraints",
        description: "Conditional types, mapped types, and generic helper structures.",
        contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        durationSec: 480, // 8 mins
        order: 1,
      },
      {
        courseId: course2.id,
        title: "Lesson 2: Dependency Injection & InversifyJS",
        description: "Decoupling services from controllers using modern DI frameworks.",
        contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        durationSec: 540, // 9 mins
        order: 2,
      },
    ],
  });

  // Course 3: Escrow Mechanics & Micropayment Risk (Draft)
  const course3 = await prisma.course.create({
    data: {
      title: "Escrow Mechanics and Micropayment Risk Management",
      description: "A deep dive into ledger locking, timeout resolution, and streaming risks. (Draft Course)",
      pricePerMinute: 0.15,
      currency: "USD",
      status: CourseStatus.DRAFT,
      instructorId: instructor.id,
    },
  });

  await prisma.lesson.create({
    data: {
      courseId: course3.id,
      title: "Lesson 1: The Double Spend Problem in Micropayments",
      description: "How ledger states handle sub-second ticks.",
      contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      durationSec: 360,
      order: 1,
    },
  });

  // 7. Create Enrollment for Student
  console.log("📝 Enrolling student in Course 1...");
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
