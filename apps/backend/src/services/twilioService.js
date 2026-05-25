const twilio = require('twilio');
const { env } = require('../../config/env');

class TwilioService {
  constructor() {
    if (env.twilio?.accountSid && env.twilio?.authToken) {
      this.client = twilio(env.twilio.accountSid, env.twilio.authToken);
    }
  }

  async sendEmergencyAlert(userId, summaryNote) {
    if (!this.client || !env.twilio?.ashaWorkerPhone || !env.twilio?.phoneNumber) {
      console.warn('⚠️ Twilio SMS not configured. Skipping emergency alert.');
      return false;
    }

    try {
      const message = await this.client.messages.create({
        body: `🚨 SWASTHYA ALERT: Patient ID ${userId} has triggered a severe behavioral distress flag.\n\nAI Summary: ${summaryNote}\n\nPlease follow up immediately.`,
        from: env.twilio.phoneNumber,
        to: env.twilio.ashaWorkerPhone
      });

      console.log(`[SMS] Emergency alert sent to ASHA worker (Message SID: ${message.sid})`);
      return true;
    } catch (error) {
      console.error('[SMS] Failed to send emergency alert:', error.message);
      return false;
    }
  }
}

module.exports = new TwilioService();
