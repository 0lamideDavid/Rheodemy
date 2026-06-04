/**
 * rafiki.service.ts — Open Payments 4-step payment pipeline
 *
 * Implements the Shared Pool / Master Faucet payment flow:
 *
 * Per-tick pipeline:
 *   Step 1 — Teacher client resolves teacher wallet address
 *   Step 2 — Teacher client requests incoming payment grant → creates IncomingPayment (the invoice)
 *   Step 3 — Student client requests outgoing payment + quote grant
 *   Step 4 — Student client creates Quote against the IncomingPayment
 *   Step 5 — Student client dispatches OutgoingPayment to complete the transfer
 *
 * Key design decisions:
 *   - Teacher and student use SEPARATE authenticated clients (separate Ed25519 keys)
 *   - Both clients are singletons (cached) — no re-auth overhead per tick
 *   - Incoming payment expires 30s after creation — tight window prevents orphan invoices
 *   - If ANY step fails, the entire tick throws — caller handles fail-safe logic
 */

import { getStudentClient, getTeacherClient, RafikiConfig } from '../config/rafiki';
import { isPendingGrant } from '@interledger/open-payments';

// ── Result types ──────────────────────────────────────────────────────────────

export interface TickPaymentResult {
  incomingPaymentId: string;   // Teacher's incoming payment resource URL
  outgoingPaymentId: string;   // Student's outgoing payment resource URL (stored as ilpPacketRef)
  quotedAmount: string;        // Scaled amount string from the quote
  sentAmount: string;          // Actual sent amount (may differ due to FX)
  receivedAssetCode: string;
  sentAssetCode: string;
}

// ── RafikiService ─────────────────────────────────────────────────────────────

export class RafikiService {
  /**
   * Executes a single complete ILP micropayment from the student wallet
   * to the teacher wallet.
   *
   * This is the core of the Chunky Ticker — called once per interval.
   * If ANY step fails, the entire method throws and the caller is
   * responsible for NOT deducting the student's virtual balance.
   *
   * @param amountUsd  Human-readable USD float for this tick (e.g. 0.001)
   */
  static async executeTickPayment(amountUsd: number): Promise<TickPaymentResult> {
    const teacherWalletAddress = process.env.TEACHER_WALLET_ADDRESS!;
    const studentWalletAddress = process.env.STUDENT_WALLET_ADDRESS!;

    const teacherClient = await getTeacherClient();
    const studentClient = await getStudentClient();

    const scaledAmount = RafikiConfig.toScaledAmount(amountUsd);
    const expiresAt = new Date(Date.now() + 30_000).toISOString(); // 30s window

    // ── Step 1: Resolve teacher wallet address ──────────────────────────────
    const teacherWallet = await teacherClient.walletAddress.get({
      url: teacherWalletAddress,
    });

    // ── Step 2: Teacher client requests grant + creates IncomingPayment ─────
    const teacherGrant = await teacherClient.grant.request(
      { url: teacherWallet.authServer },
      {
        access_token: {
          access: [{ type: 'incoming-payment', actions: ['create', 'read', 'complete'] }],
        },
      }
    );

    if (isPendingGrant(teacherGrant)) {
      throw new Error(
        '[RafikiService] Teacher wallet requires interactive grant — ' +
          'ensure non-interactive access is enabled on interledger-test.dev'
      );
    }

    const incomingPayment = await teacherClient.incomingPayment.create(
      {
        url: (teacherWallet as any).resourceServer ?? new URL(teacherWalletAddress).origin,
        accessToken: teacherGrant.access_token.value,
      },
      {
        walletAddress: teacherWalletAddress,
        incomingAmount: {
          value: scaledAmount.toString(),
          assetCode: RafikiConfig.assetCode,
          assetScale: RafikiConfig.assetScale,
        },
        expiresAt,
      }
    );

    // ── Step 3: Resolve student wallet address ──────────────────────────────
    const studentWallet = await studentClient.walletAddress.get({
      url: studentWalletAddress,
    });

    // ── Step 4: Student client requests quote grant + creates Quote ─────────
    const quoteGrant = await studentClient.grant.request(
      { url: studentWallet.authServer },
      {
        access_token: {
          access: [{ type: 'quote', actions: ['create', 'read'] }],
        },
      }
    );

    if (isPendingGrant(quoteGrant)) {
      throw new Error('[RafikiService] Student wallet requires interactive grant for quote');
    }

    const quote = await studentClient.quote.create(
      {
        url: (studentWallet as any).resourceServer ?? new URL(studentWalletAddress).origin,
        accessToken: quoteGrant.access_token.value,
      },
      {
        walletAddress: studentWalletAddress,
        receiver: incomingPayment.id,
        method: 'ilp',
      }
    );

    // ── Step 5: Student client dispatches OutgoingPayment using Master Token ─
    const masterToken = process.env.MASTER_STUDENT_TOKEN;
    if (!masterToken) {
      throw new Error('[RafikiService] Missing MASTER_STUDENT_TOKEN in environment variables');
    }

    const outgoingPayment = await studentClient.outgoingPayment.create(
      {
        url: (studentWallet as any).resourceServer ?? new URL(studentWalletAddress).origin,
        accessToken: masterToken,
      },
      {
        walletAddress: studentWalletAddress,
        quoteId: quote.id,
      }
    );

    return {
      incomingPaymentId: incomingPayment.id,
      outgoingPaymentId: outgoingPayment.id,
      quotedAmount: quote.debitAmount.value,
      sentAmount: outgoingPayment.sentAmount?.value ?? '0',
      receivedAssetCode: quote.receiveAmount.assetCode,
      sentAssetCode: quote.debitAmount.assetCode,
    };
  }
}
