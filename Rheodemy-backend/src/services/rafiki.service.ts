/**
 * rafiki.service.ts — Open Payments 4-step payment pipeline
 *
 * Implements the Shared Pool / Master Faucet payment flow:
 *
 * Per-payment pipeline (called once at session end):
 *   Step 1 — Teacher client resolves teacher wallet address
 *   Step 2 — Teacher client requests incoming payment grant → creates IncomingPayment (the invoice)
 *   Step 3 — Student client resolves student wallet address
 *   Step 4 — Student client requests quote grant + creates Quote against the IncomingPayment
 *   Step 5 — Student client dispatches OutgoingPayment using token loaded from Supabase DB
 *
 * Key design decisions:
 *   - Teacher and student use SEPARATE authenticated clients (separate Ed25519 keys)
 *   - Both clients are singletons (cached) — no re-auth overhead per payment
 *   - Access token is loaded from `wallets.accessToken` in Supabase first,
 *     falling back to MASTER_STUDENT_TOKEN env var if the DB field is null
 *   - If the token is expired (403 / "Inactive Token"), a clear re-run instruction
 *     is logged rather than a cryptic ILP error
 *   - IncomingPayment expires 10 minutes after creation — tight window prevents
 *     orphan invoices on the teacher wallet if endSession is called promptly
 */

import { getStudentClient, getTeacherClient, RafikiConfig } from '../config/rafiki';
import { isPendingGrant } from '@interledger/open-payments';
import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

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
   * Loads the master student access token.
   * Priority: wallets.accessToken in Supabase → MASTER_STUDENT_TOKEN env var
   *
   * Storing the token in the DB means a fresh recurring grant can be applied
   * by running authorize-master-wallet.ts without redeploying Render.
   */
  static async getMasterToken(): Promise<string> {
    // 1. Check platform_config table first — written by authorize-master-wallet.ts
    const config = await prisma.platformConfig.findUnique({
      where: { key: 'MASTER_STUDENT_TOKEN' },
    });
    if (config?.value) {
      return config.value;
    }

    // 2. Fallback to env var (used when DB row doesn't exist yet or DB is unreachable)
    const envToken = process.env.MASTER_STUDENT_TOKEN;
    if (envToken) {
      return envToken;
    }

    throw new Error(
      '[RafikiService] No ILP access token found. ' +
      'Run: npx ts-node --transpile-only src/scripts/authorize-master-wallet.ts'
    );
  }

  /**
   * Executes a single complete ILP payment from the student wallet
   * to the teacher wallet for the given USD amount.
   *
   * This is called once atomically at session end — never per-tick.
   * If ANY step fails, the entire method throws and the caller marks
   * the session as FAILED.
   *
   * @param amountUsd  Human-readable USD float for the session total (e.g. 0.05)
   */
  static async executeTickPayment(amountUsd: number): Promise<TickPaymentResult> {
    const teacherWalletAddress = process.env.TEACHER_WALLET_ADDRESS!;
    const studentWalletAddress = process.env.STUDENT_WALLET_ADDRESS!;

    const teacherClient = await getTeacherClient();
    const studentClient = await getStudentClient();

    const scaledAmount = RafikiConfig.toScaledAmount(amountUsd);
    // 10-minute window — incoming payment won't linger as "pending" on teacher wallet
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    try {
      // ── Step 1: Resolve teacher wallet address ────────────────────────────
      const teacherWallet = await teacherClient.walletAddress.get({
        url: teacherWalletAddress,
      });

      // ── Step 2: Teacher client requests grant + creates IncomingPayment ───
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
          url:         (teacherWallet as any).resourceServer ?? new URL(teacherWalletAddress).origin,
          accessToken: teacherGrant.access_token.value,
        },
        {
          walletAddress: teacherWalletAddress,
          incomingAmount: {
            value:      scaledAmount.toString(),
            assetCode:  RafikiConfig.assetCode,
            assetScale: RafikiConfig.assetScale,
          },
          expiresAt,
        }
      );

      // ── Step 3: Resolve student wallet address ────────────────────────────
      const studentWallet = await studentClient.walletAddress.get({
        url: studentWalletAddress,
      });

      // ── Step 4: Student client requests quote grant + creates Quote ────────
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
          url:         (studentWallet as any).resourceServer ?? new URL(studentWalletAddress).origin,
          accessToken: quoteGrant.access_token.value,
        },
        {
          walletAddress: studentWalletAddress,
          receiver:      incomingPayment.id,
          method:        'ilp',
        }
      );

      // ── Step 5: Student dispatches OutgoingPayment using DB-loaded token ──
      const masterToken = await RafikiService.getMasterToken();

      const outgoingPayment = await studentClient.outgoingPayment.create(
        {
          url:         (studentWallet as any).resourceServer ?? new URL(studentWalletAddress).origin,
          accessToken: masterToken,
        },
        {
          walletAddress: studentWalletAddress,
          quoteId:       quote.id,
        }
      );

      return {
        incomingPaymentId: incomingPayment.id,
        outgoingPaymentId: outgoingPayment.id,
        quotedAmount:      quote.debitAmount.value,
        sentAmount:        outgoingPayment.sentAmount?.value ?? '0',
        receivedAssetCode: quote.receiveAmount.assetCode,
        sentAssetCode:     quote.debitAmount.assetCode,
      };

    } catch (error: any) {
      // Surface token expiry clearly so the fix is obvious in Render logs
      if (error?.description === 'Inactive Token' || error?.status === 403) {
        logger.error(
          '🔑 ILP Token expired or inactive. ' +
          'Re-run: npx ts-node --transpile-only src/scripts/authorize-master-wallet.ts'
        );
      }
      throw error;
    }
  }
}
