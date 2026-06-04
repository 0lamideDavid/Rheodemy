/**
 * test-ilp-transfer.ts
 *
 * Standalone ILP test: TEACHER wallet → STUDENT wallet
 * (teacher pays/tops-up the student — reverse of the session flow)
 *
 * Run: node node_modules/.bin/ts-node --transpile-only src/scripts/test-ilp-transfer.ts
 *
 * What this tests:
 *  1. Both Ed25519 keys are valid and accepted by interledger-test.dev
 *  2. The 5-step Open Payments pipeline works end-to-end
 *  3. Actual testnet funds move between the two static wallets
 */

import 'dotenv/config';
import { createAuthenticatedClient, isPendingGrant, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const TEACHER_WALLET = process.env.TEACHER_WALLET_ADDRESS ?? 'https://ilp.interledger-test.dev/olamide';
const TEACHER_KEY_ID = process.env.TEACHER_KEY_ID ?? 'rheodemy-teacher-key-1';
const TEACHER_KEY_PATH = process.env.TEACHER_PRIVATE_KEY_PATH ?? './keys/teacher.private.pem';

const STUDENT_WALLET = process.env.STUDENT_WALLET_ADDRESS ?? 'https://ilp.interledger-test.dev/rheodemy';
const STUDENT_KEY_ID = process.env.STUDENT_KEY_ID ?? 'rheodemy-student-key-1';
const STUDENT_KEY_PATH = process.env.STUDENT_PRIVATE_KEY_PATH ?? './keys/student.private.pem';

// Transfer amount: $0.01 USD (10 nano-USD at scale 9)
const AMOUNT_USD    = 0.01;
const EXPIRES_AT    = new Date(Date.now() + 60_000).toISOString(); // 60s window

function loadKey(path: string): Buffer {
  return readFileSync(resolve(process.cwd(), path));
}

function log(step: string, data?: object) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶ ${step}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Rheodemy — Live ILP Transfer Test');
  console.log(`   SENDER:   ${TEACHER_WALLET}  (Teacher)`);
  console.log(`   RECEIVER: ${STUDENT_WALLET}  (Student)`);
  console.log(`   AMOUNT:   $${AMOUNT_USD} USD`);

  // ── Create authenticated clients ──────────────────────────────────────────

  log('Step 0: Creating authenticated clients');

  const teacherClient = await createAuthenticatedClient({
    keyId: TEACHER_KEY_ID,
    privateKey: loadKey(TEACHER_KEY_PATH),
    walletAddressUrl: TEACHER_WALLET,
    // Disable strict OpenAPI validation — testnet returns responses missing 'updatedAt'
    // which the validator rejects, even though the payment data is valid
    // @ts-ignore — undocumented but supported option
    validateResponses: false,
  });
  console.log('  ✓ Teacher client ready');

  const studentClient = await createAuthenticatedClient({
    keyId: STUDENT_KEY_ID,
    privateKey: loadKey(STUDENT_KEY_PATH),
    walletAddressUrl: STUDENT_WALLET,
    // @ts-ignore
    validateResponses: false,
  });
  console.log('  ✓ Student client ready');

  // ── Step 1: Resolve STUDENT wallet (the receiver) ─────────────────────────

  log('Step 1: Resolve student wallet address');
  const studentWallet = await studentClient.walletAddress.get({ url: STUDENT_WALLET });
  const studentResourceServer = (studentWallet as any).resourceServer ?? new URL(STUDENT_WALLET).origin;
  console.log(`  Auth server:      ${studentWallet.authServer}`);
  console.log(`  Resource server:  ${studentResourceServer}`);
  console.log(`  Asset: ${studentWallet.assetCode} (scale ${studentWallet.assetScale})`);

  // ── Step 2: Student client creates IncomingPayment on student wallet ───────

  log('Step 2: Student client → request grant for IncomingPayment');
  const incomingGrant = await studentClient.grant.request(
    { url: studentWallet.authServer },
    {
      access_token: {
        access: [{ type: 'incoming-payment', actions: ['create', 'read', 'complete'] }],
      },
    }
  );

  if (isPendingGrant(incomingGrant)) {
    throw new Error('❌ Student wallet requires interactive grant for IncomingPayment');
  }
  console.log('  ✓ Grant received');

  // Use the wallet's native asset code and scale
  const walletAssetCode = studentWallet.assetCode;
  const walletAssetScale = studentWallet.assetScale;
  const scaledAmount = BigInt(Math.round(AMOUNT_USD * 10 ** walletAssetScale)).toString();

  log('Step 2b: Create IncomingPayment on student wallet', {
    assetCode: walletAssetCode, assetScale: walletAssetScale, scaledAmount,
  });
  const incomingPayment = await studentClient.incomingPayment.create(
    {
      url: studentResourceServer,
      accessToken: incomingGrant.access_token.value,
    },
    {
      walletAddress: STUDENT_WALLET,
      incomingAmount: {
        value: scaledAmount,
        assetCode: walletAssetCode,
        assetScale: walletAssetScale,
      },
      expiresAt: EXPIRES_AT,
    }
  );
  console.log(`  ✓ IncomingPayment created: ${incomingPayment.id}`);

  // ── Step 3: Resolve TEACHER wallet (the sender) ───────────────────────────

  log('Step 3: Resolve teacher wallet address');
  const teacherWallet = await teacherClient.walletAddress.get({ url: TEACHER_WALLET });
  const teacherResourceServer = (teacherWallet as any).resourceServer ?? new URL(TEACHER_WALLET).origin;
  console.log(`  Auth server:     ${teacherWallet.authServer}`);
  console.log(`  Resource server: ${teacherResourceServer}`);

  // ── Step 4: Teacher client creates Quote ──────────────────────────────────

  log('Step 4: Teacher client → request grant for Quote');
  const quoteGrant = await teacherClient.grant.request(
    { url: teacherWallet.authServer },
    {
      access_token: {
        access: [{ type: 'quote', actions: ['create', 'read'] }],
      },
    }
  );

  if (isPendingGrant(quoteGrant)) {
    throw new Error('❌ Teacher wallet requires interactive grant for Quote');
  }
  console.log('  ✓ Quote grant received');

  log('Step 4b: Create Quote (teacher → student)');
  const quote = await teacherClient.quote.create(
    {
      url: teacherResourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: TEACHER_WALLET,
      receiver: incomingPayment.id,
      method: 'ilp',
    }
  );
  console.log({
    debitAmount: quote.debitAmount,
    receiveAmount: quote.receiveAmount,
  });

  // ── Step 5: Teacher client dispatches OutgoingPayment ─────────────────────

  log('Step 5: Teacher client → request grant for OutgoingPayment (with interact)');
  const nonce = Math.random().toString(36).substring(2, 18);

  const outgoingGrantRequest = await teacherClient.grant.request(
    { url: teacherWallet.authServer },
    {
      access_token: {
        access: [{
          type: 'outgoing-payment',
          actions: ['create', 'read', 'list'],
          identifier: TEACHER_WALLET,
          limits: {
            debitAmount: {
              value:      quote.debitAmount.value,
              assetCode:  quote.debitAmount.assetCode,
              assetScale: quote.debitAmount.assetScale,
            },
          },
        }],
      },
      // The interact field is required by the testnet auth server
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

  let outgoingAccessToken: string;

  if (!isPendingGrant(outgoingGrantRequest)) {
    // Wallet configured for non-interactive grants
    outgoingAccessToken = outgoingGrantRequest.access_token.value;
    console.log('  ✓ Grant auto-approved (non-interactive)');
  } else {
    // Outgoing payment grants require user approval in the browser
    // Print the URL and wait for the user to approve before continuing
    console.log('\n' + '═'.repeat(60));
    console.log('🌐 USER ACTION REQUIRED');
    console.log('═'.repeat(60));
    console.log('Open this URL in your browser to approve the payment:');
    console.log(`\n  ${outgoingGrantRequest.interact.redirect}\n`);
    console.log('After clicking "Approve" in the browser, press ENTER here to continue...');
    console.log('═'.repeat(60) + '\n');

    // Wait for user to press Enter
    await new Promise<void>((resolve) => {
      process.stdin.setRawMode?.(false);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.pause();
        resolve();
      });
    });

    const continuedGrant = await teacherClient.grant.continue(
      {
        url:         outgoingGrantRequest.continue.uri,
        accessToken: outgoingGrantRequest.continue.access_token.value,
      },
      {
        interact_ref: 'dummy_ref' // In a real flow, this comes from the redirect URL
      }
    );

    if (!isFinalizedGrant(continuedGrant)) {
      throw new Error('❌ Grant still pending — did you approve it in the browser?');
    }
    outgoingAccessToken = continuedGrant.access_token.value;
    console.log('  ✓ Grant approved and continued successfully');
  }

  log('Step 5b: Dispatch OutgoingPayment (funds leave teacher wallet)');
  const outgoingPayment = await teacherClient.outgoingPayment.create(
    {
      url:         teacherResourceServer,
      accessToken: outgoingAccessToken,
    },
    {
      walletAddress: TEACHER_WALLET,
      quoteId:       quote.id,
    }
  );

  // ── Result ────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log('✅  TRANSFER COMPLETE');
  console.log('═'.repeat(60));
  console.log({
    outgoingPaymentId: outgoingPayment.id,
    sentAmount:        outgoingPayment.sentAmount,
    receiver:          incomingPayment.id,
  });
}

main().catch((err) => {
  console.error('\n❌ Transfer failed:');
  console.error('  message:     ', err?.message);
  console.error('  status:      ', err?.status ?? err?.statusCode ?? 'unknown');
  console.error('  description: ', err?.description ?? err?.description ?? '');
  console.error('  errorCode:   ', err?.errorCode ?? '');
  console.error('  errors:      ', JSON.stringify(err?.validationErrors ?? err?.errors ?? [], null, 2));
  // Print all enumerable keys for full diagnostics
  const keys = Object.keys(err ?? {});
  if (keys.length) console.error('  all keys:', keys);
  process.exit(1);
});
