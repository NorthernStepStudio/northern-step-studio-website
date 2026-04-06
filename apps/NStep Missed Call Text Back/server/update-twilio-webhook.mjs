import twilio from 'twilio';

// ─── Configuration ──────────────────────────────────────────────────────────
// Replace these values before running.

const accountSid = 'AC39d8e48665b7a3d7b6cb83c48cbf9f0c';
const authToken  = '076c761a6a9e1f6ce00d14726ad53182';

// The Twilio number to configure (must support Voice + SMS)
const twilioNumber = '+18777550689';

// The ResponseOS public webhook URL
const publicUrl  = 'https://responseos-demo.vercel.app';
const webhookUrl = `${publicUrl}/v1/revenue/webhooks/twilio?app_id=responseos-app&api_key=preview-key`;

// ─── Script ─────────────────────────────────────────────────────────────────
const client = twilio(accountSid, authToken);

async function updateWebhook() {
  try {
    // 1. Find the phone number resource
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({
      phoneNumber: twilioNumber,
    });

    if (incomingPhoneNumbers.length === 0) {
      console.error(`[BLOCKER] Could not find incoming phone number: ${twilioNumber}`);
      console.error('Make sure this number is in your Twilio account.');
      process.exit(1);
    }

    const resource = incomingPhoneNumbers[0];
    const sid = resource.sid;

    // 2. Check capabilities
    const caps = resource.capabilities || {};
    console.log('\n── Capabilities Check ──');
    console.log(`  Voice: ${caps.voice ? '✅ Yes' : '❌ No'}`);
    console.log(`  SMS:   ${caps.sms   ? '✅ Yes' : '❌ No'}`);
    console.log(`  MMS:   ${caps.mms   ? '✅ Yes' : '❌ No'}`);

    if (!caps.voice || !caps.sms) {
      console.error('\n[BLOCKER] This number does NOT support both Voice and SMS.');
      console.error('You need a number with both capabilities for the missed-call text-back flow.');
      process.exit(1);
    }

    // 3. Update all webhook configurations in one call
    await client.incomingPhoneNumbers(sid).update({
      // Voice: "A call comes in" → webhook URL, HTTP POST
      voiceUrl:    webhookUrl,
      voiceMethod: 'POST',

      // Voice: fallback (optional safety net)
      voiceFallbackUrl:    '',
      voiceFallbackMethod: 'POST',

      // Voice: status callback → same webhook URL, HTTP POST
      // This fires on: initiated, ringing, answered, completed (which covers
      // no-answer, busy, failed, canceled via CallStatus parameter)
      statusCallback:       webhookUrl,
      statusCallbackMethod: 'POST',

      // SMS: "A message comes in" → webhook URL, HTTP POST
      smsUrl:    webhookUrl,
      smsMethod: 'POST',

      // SMS: fallback (optional safety net)
      smsFallbackUrl:    '',
      smsFallbackMethod: 'POST',
    });

    // 4. Print final checklist
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  Twilio Configuration Checklist');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Phone number configured:    ${twilioNumber}`);
    console.log(`  Phone number SID:           ${sid}`);
    console.log('──────────────────────────────────────────────────────');
    console.log(`  Messaging webhook URL:      ${webhookUrl}`);
    console.log(`  Messaging HTTP method:      POST`);
    console.log('──────────────────────────────────────────────────────');
    console.log(`  Voice webhook URL:          ${webhookUrl}`);
    console.log(`  Voice HTTP method:          POST`);
    console.log('──────────────────────────────────────────────────────');
    console.log(`  Call status callback URL:   ${webhookUrl}`);
    console.log(`  Status callback method:     POST`);
    console.log('══════════════════════════════════════════════════════');
    console.log('\n✅ All webhooks configured successfully.');
    console.log('\nExpected flow:');
    console.log('  1. You call the Twilio number from your cell');
    console.log('  2. Nobody answers → Twilio sends status callback (no-answer/busy/failed/canceled)');
    console.log('  3. ResponseOS detects the missed call via the status callback');
    console.log('  4. ResponseOS tells Twilio to send an SMS from this number to your cell');
    console.log('  5. You reply by text → SMS webhook fires → plumbing intake continues');
    console.log('\n⚠️  Warnings:');
    console.log('  - Make sure the public tunnel URL is still active before testing');
    console.log('  - Public tunnel URLs can change; update this script if the URL changes');
    console.log('  - Ensure your gateway is running: npm run dev:all');

  } catch (error) {
    console.error('\n[ERROR] Failed to update Twilio webhooks:', error.message || error);
    if (error.code === 20003) {
      console.error('  → Authentication failed. Check your Account SID and Auth Token.');
    }
    process.exit(1);
  }
}

updateWebhook();
