-- DropForeignKey
ALTER TABLE "payment_sessions" DROP CONSTRAINT "payment_sessions_lessonId_fkey";

-- AlterTable
ALTER TABLE "payment_sessions" ALTER COLUMN "lessonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_sessions" ADD CONSTRAINT "payment_sessions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
