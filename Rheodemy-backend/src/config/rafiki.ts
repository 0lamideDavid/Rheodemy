/**
 * rafiki.ts — Dual Open Payments client factory
 *
 * Architecture: Static Dual-Pointer / Master Faucet
 * ──────────────────────────────────────────────────
 * Instead of dynamic per-user wallets, we use two pre-registered static wallets:
 *   - STUDENT wallet  → sends payments (signer: STUDENT_KEY_ID + STUDENT_PRIVATE_KEY)
 *   - TEACHER wallet  → receives payments (signer: TEACHER_KEY_ID + TEACHER_PRIVATE_KEY)
 *
 * Each wallet requires its OWN authenticated client because:
 *   - Creating an IncomingPayment must be signed by the TEACHER key
 *   - Creating an OutgoingPayment must be signed by the STUDENT key
 *   - A single client can only sign with one key
 *
 * Both clients are singletons — initialized once at first use and reused across
 * all ticker ticks to avoid re-authentication overhead.
 */

import { createAuthenticatedClient, AuthenticatedClient } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Singleton client instances ─────────────────────────────────────────────────

let _studentClient: AuthenticatedClient | null = null;
let _teacherClient: AuthenticatedClient | null = null;

// ── Private key loader ────────────────────────────────────────────────────────

/**
 * Loads an Ed25519 private key from a PEM file path.
 * The Open Payments SDK expects the raw key bytes as a Uint8Array.
 */
function loadPrivateKey(pemPath: string): Buffer {
  const absolutePath = resolve(process.cwd(), pemPath);
  return readFileSync(absolutePath); // readFileSync returns Buffer — satisfies KeyLike
}

// ── Client factory ────────────────────────────────────────────────────────────

/**
 * Returns the singleton Open Payments client for the STUDENT wallet.
 * Signs all requests with STUDENT_KEY_ID and STUDENT_PRIVATE_KEY_PATH.
 * Used to: resolve student wallet, request quote grant, create outgoing payment.
 */
export async function getStudentClient(): Promise<AuthenticatedClient> {
  if (_studentClient) return _studentClient;

  const walletAddressUrl = process.env.STUDENT_WALLET_ADDRESS;
  const keyId = process.env.STUDENT_KEY_ID;
  const keyPath = process.env.STUDENT_PRIVATE_KEY_PATH;

  if (!walletAddressUrl || !keyId || !keyPath) {
    throw new Error(
      '[RafikiConfig] Missing student ILP credentials. ' +
        'Required env vars: STUDENT_WALLET_ADDRESS, STUDENT_KEY_ID, STUDENT_PRIVATE_KEY_PATH'
    );
  }

  _studentClient = await createAuthenticatedClient({
    keyId,
    privateKey: loadPrivateKey(keyPath),
    walletAddressUrl,
    // @ts-ignore - Disable strict OpenAPI validation
    validateResponses: false,
  });

  console.log('[RafikiConfig] Student Open Payments client initialised ✓');
  return _studentClient;
}

/**
 * Returns the singleton Open Payments client for the TEACHER wallet.
 * Signs all requests with TEACHER_KEY_ID and TEACHER_PRIVATE_KEY_PATH.
 * Used to: resolve teacher wallet, create incoming payment (invoice).
 */
export async function getTeacherClient(): Promise<AuthenticatedClient> {
  if (_teacherClient) return _teacherClient;

  const walletAddressUrl = process.env.TEACHER_WALLET_ADDRESS;
  const keyId = process.env.TEACHER_KEY_ID;
  const keyPath = process.env.TEACHER_PRIVATE_KEY_PATH;

  if (!walletAddressUrl || !keyId || !keyPath) {
    throw new Error(
      '[RafikiConfig] Missing teacher ILP credentials. ' +
        'Required env vars: TEACHER_WALLET_ADDRESS, TEACHER_KEY_ID, TEACHER_PRIVATE_KEY_PATH'
    );
  }

  _teacherClient = await createAuthenticatedClient({
    keyId,
    privateKey: loadPrivateKey(keyPath),
    walletAddressUrl,
    // @ts-ignore - Disable strict OpenAPI validation
    validateResponses: false,
  });

  console.log('[RafikiConfig] Teacher Open Payments client initialised ✓');
  return _teacherClient;
}

// ── Testnet constants ─────────────────────────────────────────────────────────

export const RafikiConfig = {
  assetCode: 'USD',
  assetScale: 2, // testnet uses scale 2

  /** Convert a human-readable USD float to the scaled integer Open Payments expects */
  toScaledAmount(usd: number): bigint {
    return BigInt(Math.round(usd * 10 ** RafikiConfig.assetScale));
  },

  /** Convert a scaled integer back to a human-readable USD float */
  fromScaledAmount(scaled: bigint): number {
    return Number(scaled) / 10 ** RafikiConfig.assetScale;
  },
} as const;
