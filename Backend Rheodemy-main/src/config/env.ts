import dotenv from "dotenv";
import { z } from "zod";

// Load .env file before validation
dotenv.config();

/**
 * Zod schema for environment variables.
 * Validates and coerces all required env vars at startup.
 * If any are missing or invalid, the app crashes immediately with a clear error.
 */
const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),

  // Auth
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),

  // FX (hardcoded for demo)
  USD_TO_NGN: z.coerce.number().positive().default(1600),

  // Rafiki / ILP
  RAFIKI_BACKEND_URL: z.string().url().optional(),
  RAFIKI_AUTH_URL: z.string().url().optional(),
  PLATFORM_WALLET_ADDRESS: z.string().optional(),
});

/**
 * Parse and validate — crashes on startup if env is invalid.
 * This is intentional: fail fast, not at runtime in a service.
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
