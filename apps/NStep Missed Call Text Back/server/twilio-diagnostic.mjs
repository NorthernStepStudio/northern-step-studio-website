import twilio from 'twilio';

// ─── Configuration ──────────────────────────────────────────────────────────
// Using the credentials found in update-twilio-webhook.mjs
const accountSid = 'AC39d8e48665b7a3d7b6cb83c48cbf9f0c';
const authToken  = '076c761a6a9e1f6ce00d14726ad53182';
const targetNumber = '+18777550689';

const client = twilio(accountSid, authToken);

async function runDiagnostic() {
  console.log('🚀 Starting Twilio Toll-Free Diagnostic...\n');

  try {
    // 1. Check Account
    const account = await client.api.v2010.accounts(accountSid).fetch();
    console.log('✅ Account SID Verified');
    console.log(`   Friendly Name: ${account.friendlyName}`);
    console.log(`   Status: ${account.status}\n`);

    // 2. Fetch Incoming Phone Number status
    const numbers = await client.incomingPhoneNumbers.list({ phoneNumber: targetNumber });
    
    if (numbers.length === 0) {
      console.error(`❌ Number Not Found: ${targetNumber} is not in this Twilio account.`);
      process.exit(1);
    }

    const number = numbers[0];
    console.log('✅ Phone Number Resource Found');
    console.log(`   SID: ${number.sid}`);
    console.log(`   Voice Capability: ${number.capabilities.voice ? '✅' : '❌'}`);
    console.log(`   SMS Capability: ${number.capabilities.sms ? '✅' : '❌'}`);
    console.log(`   Current Voice URL: ${number.voiceUrl || 'NONE'}`);
    console.log(`   Current SMS URL: ${number.smsUrl || 'NONE'}\n`);

    // 3. Check A2P / Toll-Free Verification Status (via fetch)
    // Note: This often requires the Messaging Service context or specific TFV resources
    console.log('🔍 Checking Toll-Free Verification Status...');
    const verifications = await client.messaging.v1.tollfreeVerifications.list({
      tollfreePhoneNumber: targetNumber
    });

    if (verifications.length > 0) {
      const v = verifications[0];
      console.log(`   Verification Status: ${v.status?.toUpperCase() || 'UNKNOWN'}`);
      console.log(`   Use Case: ${v.useCaseCategory || 'NOT SET'}`);
    } else {
      console.log('   ⚠️  No active Toll-Free verification found for this specific number on this account.');
    }

    console.log('\n✅ Diagnostic Complete. The number is ready for configuration.');

  } catch (err) {
    console.error('\n❌ Diagnostic Failed:');
    console.error(err.message || err);
    process.exit(1);
  }
}

runDiagnostic();
