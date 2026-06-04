/**
 * test-rafiki-service.ts
 *
 * Tests the RafikiService directly to ensure the new Master Token flow works.
 * This simulates exactly what the chunky ticker does every 5 seconds.
 *
 * Run: node node_modules/.bin/ts-node --transpile-only src/scripts/test-rafiki-service.ts
 */

import 'dotenv/config';
import { RafikiService } from '../services/rafiki.service';

async function main() {
  console.log('🚀 Testing RafikiService.executeTickPayment()...');
  
  try {
    const result = await RafikiService.executeTickPayment(0.01);
    console.log('\n✅ Tick payment succeeded! Master token works perfectly.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Tick payment failed:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

main();
