import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 * In development, hot-reload (ts-node-dev) would create a new PrismaClient
 * on every restart, eventually exhausting DB connections. This pattern
 * stores the client on `globalThis` to reuse across reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
