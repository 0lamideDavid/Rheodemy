-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'AUDIO', 'EBOOK');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN "contentType" "ContentType" NOT NULL DEFAULT 'VIDEO';
