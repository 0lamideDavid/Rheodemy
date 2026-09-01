-- AlterEnum: add FAILED value to SessionStatus
-- This distinguishes ILP payment failure from admin kill-switch (KILLED)
ALTER TYPE "SessionStatus" ADD VALUE 'FAILED';
