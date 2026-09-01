-- AlterTable: add accessToken column to wallets
-- Nullable so existing rows are unaffected (no data migration needed)
ALTER TABLE "wallets" ADD COLUMN "accessToken" TEXT;
