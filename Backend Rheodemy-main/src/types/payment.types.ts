/**
 * payment.types.ts
 *
 * TypeScript interfaces that mirror the Prisma-generated types from Phase 1.
 * These allow Phase 4 to compile before Lauretta's schema migrations are applied.
 *
 * ⚠️  HANDOFF NOTE (for Lauretta):
 * Once `npx prisma generate` has been run with the full schema, these interfaces
 * can be replaced with direct imports from `@prisma/client`:
 *   import { PaymentSession, Transaction, Wallet } from '@prisma/client';
 */

// ── Session Status ────────────────────────────────────────────────────────────

export type SessionStatus = 'ACTIVE' | 'ENDED' | 'KILLED';

// ── PaymentSession ────────────────────────────────────────────────────────────

export interface PaymentSession {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  totalPaid: number;       // Accumulated USD (float) across all ticks
  status: SessionStatus;
  killSwitchAt?: Date | null;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  sessionId: string;
  amount: number;          // USD amount for this single tick
  currency: string;        // e.g. 'USD'
  ilpPacketRef?: string | null; // Outgoing payment ID from Open Payments
  timestamp: Date;
}

// ── Wallet (subset used by payment layer) ────────────────────────────────────

export interface Wallet {
  id: string;
  userId: string;
  walletAddress: string;   // Open Payments wallet address URL
  provider: string;        // e.g. 'interledger-testnet'
  balance: number;
  currency: string;
}

// ── Request / Response shapes ─────────────────────────────────────────────────

export interface StartSessionInput {
  userId: string;
  courseId: string;
  lessonId?: string;
  studentWalletAddress: string;   // Sender wallet (student)
  instructorWalletAddress: string; // Receiver wallet (instructor)
}

export interface TickResult {
  transactionId: string;
  amountPaid: number;
  currency: string;
  ilpRef: string | null;
  timestamp: Date;
  totalPaid: number;       // Session running total after this tick
}

export interface SessionSummary {
  sessionId: string;
  status: SessionStatus;
  totalPaid: number;
  currency: string;
  startedAt: Date;
  endedAt: Date | null;
  tickCount: number;
}
