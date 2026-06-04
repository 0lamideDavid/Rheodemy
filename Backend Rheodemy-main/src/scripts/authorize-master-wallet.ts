/**
 * authorize-master-wallet.ts
 *
 * Generates a persistent, high-limit access token for the Student Master Wallet.
 * This token allows the backend to send funds continuously without prompting
 * for approval on every tick.
 *
 * Run: node node_modules/.bin/ts-node --transpile-only src/scripts/authorize-master-wallet.ts
 */

import 'dotenv/config';
import { createAuthenticatedClient, isPendingGrant, isFinalizedGrant } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const STUDENT_WALLET   = process.env.STUDENT_WALLET_ADDRESS  ?? 'https://ilp.interledger-test.dev/rheodemy';
const STUDENT_KEY_ID   = process.env.STUDENT_KEY_ID          ?? 'rheodemy-student-key-1';
const STUDENT_KEY_PATH = process.env.STUDENT_PRIVATE_KEY_PATH ?? './keys/student.private.pem';

// The limit we want to authorize (e.g. $100.00)
// At scale 2, $100.00 = 10000
const LIMIT_AMOUNT = '10000'; 

function loadKey(path: string): Buffer {
  return readFileSync(resolve(process.cwd(), path));
}

async function main() {
  console.log('🚀 Rheodemy — Master Wallet Authorization');
  console.log(`   WALLET: ${STUDENT_WALLET}`);

  const studentClient = await createAuthenticatedClient({
    keyId:            STUDENT_KEY_ID,
    privateKey:       loadKey(STUDENT_KEY_PATH),
    walletAddressUrl: STUDENT_WALLET,
    // @ts-ignore
    validateResponses: false,
  });

  const studentWallet = await studentClient.walletAddress.get({ url: STUDENT_WALLET });
  const assetCode  = studentWallet.assetCode;
  const assetScale = studentWallet.assetScale;

  console.log(`\n▶ Requesting high-limit grant (${LIMIT_AMOUNT} ${assetCode} @ scale ${assetScale})`);

  const nonce = Math.random().toString(36).substring(2, 18);
  const outgoingGrantRequest = await studentClient.grant.request(
    { url: studentWallet.authServer },
    {
      access_token: {
        access: [{
          type: 'outgoing-payment',
          actions: ['create', 'read', 'list'],
          identifier: STUDENT_WALLET,
          limits: {
            debitAmount: {
              value:      LIMIT_AMOUNT,
              assetCode:  assetCode,
              assetScale: assetScale,
            },
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

  if (!isPendingGrant(outgoingGrantRequest)) {
    console.log('\n✅ Token automatically issued (no interaction required):');
    console.log(`\nMASTER_STUDENT_TOKEN=${outgoingGrantRequest.access_token.value}\n`);
    return;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🌐 USER ACTION REQUIRED');
  console.log('═'.repeat(60));
  console.log('Open this URL in your browser to approve the master limit:');
  console.log(`\n  ${outgoingGrantRequest.interact.redirect}\n`);
  console.log('After clicking "Approve", your browser will redirect to a broken page (https://rheodemy.app...).');
  console.log('Look at the URL in your browser and copy the ENTIRE URL, then paste it here and press ENTER:');
  console.log('═'.repeat(60) + '\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
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

  console.log('\n✅ SUCCESS! Add this line to your .env file:\n');
  console.log(`MASTER_STUDENT_TOKEN=${continuedGrant.access_token.value}\n`);
}

main().catch((err) => {
  console.error('\n❌ Authorization failed:');
  console.error('  message:     ', err?.message);
  console.error('  status:      ', err?.status       ?? err?.statusCode  ?? 'unknown');
  console.error('  description: ', err?.description  ?? err?.description ?? '');
  console.error('  errorCode:   ', err?.errorCode    ?? '');
  console.error('  errors:      ', JSON.stringify(err?.validationErrors ?? err?.errors ?? [], null, 2));
  process.exit(1);
});
