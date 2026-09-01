-- CreateTable: platform_config
-- Stores platform-level key/value config (no FK constraints).
-- Used for the master ILP access token.
CREATE TABLE "platform_config" (
  "key"       TEXT NOT NULL,
  "value"     TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "platform_config_pkey" PRIMARY KEY ("key")
);
