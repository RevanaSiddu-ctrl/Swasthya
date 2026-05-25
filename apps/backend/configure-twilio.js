/**
 * One-time script to configure the Twilio phone number webhook
 * to point at our public tunnel URL.
 */
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const baseUrl = process.env.PUBLIC_BASE_URL;

if (!accountSid || !authToken || !phoneNumber || !baseUrl) {
  console.error('Missing env vars. Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, PUBLIC_BASE_URL');
  process.exit(1);
}

const client = twilio(accountSid, authToken);
const webhookUrl = `${baseUrl.replace(/\/$/, '')}/api/voice/incoming`;

async function configure() {
  console.log(`Looking up phone number: ${phoneNumber}`);
  
  const numbers = await client.incomingPhoneNumbers.list({ phoneNumber });
  
  if (numbers.length === 0) {
    console.error(`No phone number found matching ${phoneNumber} on this account.`);
    process.exit(1);
  }

  const number = numbers[0];
  console.log(`Found: ${number.friendlyName} (${number.sid})`);
  console.log(`Setting voice webhook to: ${webhookUrl}`);

  await client.incomingPhoneNumbers(number.sid).update({
    voiceUrl: webhookUrl,
    voiceMethod: 'POST',
  });

  console.log('Done! Twilio phone number configured.');
  console.log(`Call ${phoneNumber} to test the voice assistant.`);
}

configure().catch((err) => {
  console.error('Failed to configure Twilio:', err.message);
  process.exit(1);
});
