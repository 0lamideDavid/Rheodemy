/**
 * authorize-master-wallet.ts
 *
 * Generates a persistent, recurring high-limit access token for the Student
 * Master Wallet and saves it to Supabase via Prisma.
 *
 * Key changes vs original:
 *   - Grant uses `interval: 'R/P1Y'` (recurring, resets yearly) so it never
 *     expires within a normal session window
 *   - Limit raised to $10,000 at scale 2 so it covers long demo sessions
 *   - On success the token is persisted to the `wallets.accessToken` column
 *     in Supabase — no env-var copy/paste needed after each run
 *
 * Run:
 *   node node_modules/.bin/ts-node --transpile-only src/scripts/authorize-master-wallet.ts
 */

import 'dotenv/config';
import { createAuthenticatedClient, isPendingGrant, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { prisma } from '../config/prisma';

const STUDENT_WALLET_ADDRESS = process.env.STUDENT_WALLET_ADDRESS ?? 'https://ilp.interledger-test.dev/rheodemy';
const STUDENT_KEY_ID         = process.env.STUDENT_KEY_ID         ?? 'rheodemy-student-key-1';
const STUDENT_KEY_PATH       = process.env.STUDENT_PRIVATE_KEY_PATH ?? './keys/student.private.pem';

// $10,000.00 at assetScale 2 — covers any realistic demo session length
const LIMIT_AMOUNT = '1000000';

function loadKey(path: string): Buffer {
  return readFileSync(resolve(process.cwd(), path));
}

async function saveTokenToDatabase(token: string): Promise<void> {
  try {
    await prisma.platformConfig.upsert({
      where:  { key: 'MASTER_STUDENT_TOKEN' },
      update: { value: token },
      create: { key: 'MASTER_STUDENT_TOKEN', value: token },
    });
    console.log('✅ Token saved to Supabase (platform_config) successfully');
    console.log('   Render will read it automatically on next payment — no manual update needed.');
  } catch (dbErr: any) {
    console.warn('\n⚠️  Could not save token to database.');
    console.warn('   Error:', dbErr?.message);
    console.warn('   → Copy the token above and update MASTER_STUDENT_TOKEN in Render manually.\n');
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 Rheodemy — Master Wallet Authorization (Recurring Grant)');
  console.log(`   WALLET: ${STUDENT_WALLET_ADDRESS}`);

  const studentClient = await createAuthenticatedClient({
    keyId:          STUDENT_KEY_ID,
    privateKey:     loadKey(STUDENT_KEY_PATH),
    walletAddressUrl: STUDENT_WALLET_ADDRESS,
    // @ts-ignore
    validateResponses: false,
    requestTimeoutMs:  60000,
  });

  const studentWallet = await studentClient.walletAddress.get({ url: STUDENT_WALLET_ADDRESS });
  const assetCode  = studentWallet.assetCode;
  const assetScale = studentWallet.assetScale;

  console.log(`\n▶ Requesting recurring high-limit grant (${LIMIT_AMOUNT} ${assetCode} @ scale ${assetScale}, interval R/P1Y)`);

  const nonce = Math.random().toString(36).substring(2, 18);

  const outgoingGrantRequest = await studentClient.grant.request(
    { url: studentWallet.authServer },
    {
      access_token: {
        access: [{
          type:       'outgoing-payment',
          actions:    ['create', 'read', 'list'],
          identifier: STUDENT_WALLET_ADDRESS,
          limits: {
            debitAmount: {
              value:      LIMIT_AMOUNT,
              assetCode,
              assetScale,
            },
            interval: 'R/P1Y', // recurring — resets yearly, survives past 10-minute window
          },
        }],
      },
      interact: {
        start: ['redirect'],
        finish: {
          method: 'redirect',
          uri:    'https://rheodemy.app/payment/callback',
          nonce,
        },
      },
    }
  );

  // ── Non-interactive path (grant auto-issued) ────────────────────────────────
  if (!isPendingGrant(outgoingGrantRequest)) {
    const token = outgoingGrantRequest.access_token.value;
    console.log('\n✅ Token automatically issued (no interaction required).');
    console.log(`Token: ${token}`);
    await saveTokenToDatabase(token);
    return;
  }

  // ── Interactive path (user must click Approve in browser) ──────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('🌐 USER ACTION REQUIRED');
  console.log('═'.repeat(60));
  console.log('Open this URL in your browser to approve the master limit:');
  console.log(`\n  ${outgoingGrantRequest.interact.redirect}\n`);
  console.log('After clicking "Approve", your browser redirects to a broken page (https://rheodemy.app...).');
  console.log('Copy the ENTIRE URL from the browser address bar, paste it here, and press ENTER:');
  console.log('═'.repeat(60) + '\n');

  const readline = require('readline').createInterface({
    input:  process.stdin,
    output: process.stdout,
  });

  const redirectUrl = await new Promise<string>((resolve) => {
    readline.question('Paste the redirect URL here: ', (ans: string) => {
      readline.close();
      resolve(ans.trim());
    });
  });

  let interact_ref: string | undefined;
  try {
    const urlObj = new URL(redirectUrl);
    interact_ref = urlObj.searchParams.get('interact_ref') || undefined;
    if (!interact_ref) throw new Error('No interact_ref param found');
  } catch (err) {
    console.error('❌ Failed to parse interact_ref from URL:', redirectUrl);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }

  console.log('\n▶ Verifying authorization with interact_ref...', interact_ref);

  const continuedGrant = await studentClient.grant.continue(
    {
      url:         outgoingGrantRequest.continue.uri,
      accessToken: outgoingGrantRequest.continue.access_token.value,
    },
    { interact_ref }
  );

  if (!isFinalizedGrant(continuedGrant)) {
    throw new Error('❌ Grant still pending — did you approve it in the browser?');
  }

  const token = continuedGrant.access_token.value;
  console.log('\n✅ Grant approved and finalized!');
  console.log(`Token: ${token}`);
  await saveTokenToDatabase(token);
}

main().catch(async (err) => {
  console.error('\n❌ Authorization failed:');
  console.error('  message:     ', err?.message);
  console.error('  status:      ', err?.status ?? err?.statusCode ?? 'unknown');
  console.error('  description: ', err?.description ?? '');
  console.error('  errorCode:   ', err?.errorCode ?? '');
  console.error('  errors:      ', JSON.stringify(err?.validationErrors ?? err?.errors ?? [], null, 2));
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
