const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const openaiService = require('../services/azure/openai');

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_SESSION_MESSAGES = 12;
const voiceSessions = new Map();

const pruneSessions = () => {
  const now = Date.now();
  for (const [callSid, session] of voiceSessions.entries()) {
    if (!session || now - session.updatedAt > SESSION_TTL_MS) {
      voiceSessions.delete(callSid);
    }
  }
};

const getOrCreateSession = (callSid) => {
  if (!callSid) {
    return null;
  }
  const existing = voiceSessions.get(callSid);
  if (existing) {
    return existing;
  }
  const session = { messages: [], updatedAt: Date.now() };
  voiceSessions.set(callSid, session);
  return session;
};

const updateSession = (session, userText, reply) => {
  session.messages.push(
    { role: 'user', content: userText },
    { role: 'assistant', content: reply }
  );

  while (session.messages.length > MAX_SESSION_MESSAGES) {
    session.messages.shift();
  }

  session.updatedAt = Date.now();
};

const getSpeechActionUrl = () => {
  const baseUrl = process.env.PUBLIC_BASE_URL;
  if (!baseUrl) {
    return '/api/voice/speech';
  }
  return `${baseUrl.replace(/\/$/, '')}/api/voice/speech`;
};

const buildSpeechGatherResponse = (messages) => {
  const response = new twilio.twiml.VoiceResponse();
  const gather = response.gather({
    input: 'speech',
    action: getSpeechActionUrl(),
    method: 'POST',
    speechTimeout: 'auto',
    actionOnEmptyResult: true,
  });

  messages.forEach((message) => gather.say(message));
  return response;
};

// Mock data responses for hackathon speed

router.post('/checkin', (req, res) => {
  res.json({ success: true, message: 'Check-in recorded' });
});

router.post('/health-aggregate', (req, res) => {
  res.json({ success: true, message: 'Health aggregate processed' });
});

router.post('/ivr-signal', (req, res) => {
  res.json({ success: true, message: 'IVR signal processed' });
});

const getRequestValue = (req, key) => {
  if (req.body && req.body[key] !== undefined) {
    return req.body[key];
  }
  if (req.query && req.query[key] !== undefined) {
    return req.query[key];
  }
  return undefined;
};

const handleVoiceIncoming = (req, res) => {
  const callSid = getRequestValue(req, 'CallSid');
  const from = getRequestValue(req, 'From');
  console.log('[INCOMING]', req.method, 'CallSid:', callSid, 'From:', from);
  pruneSessions();
  if (callSid) {
    voiceSessions.set(callSid, { messages: [], updatedAt: Date.now() });
  }

  const response = buildSpeechGatherResponse([
    'Hello, you have reached Swasthya support.',
    'Please tell me how you are feeling today.',
  ]);

  res.type('text/xml').send(response.toString());
};

const handleVoiceSpeech = async (req, res) => {
  const callSid = getRequestValue(req, 'CallSid');
  const speechResult = getRequestValue(req, 'SpeechResult') || '';
  console.log('[SPEECH]', req.method, 'CallSid:', callSid, 'SpeechResult:', speechResult);
  pruneSessions();
  const speechText = speechResult.trim();
  const session = getOrCreateSession(callSid);

  if (!speechText) {
    const response = buildSpeechGatherResponse([
      'I did not catch that. Please say that again.',
    ]);
    return res.type('text/xml').send(response.toString());
  }

  try {
    const history = session ? session.messages.slice() : [];
    const reply = await openaiService.generateReply(speechText, history);
    console.log('[SPEECH] Gemini reply:', reply);
    if (session) {
      updateSession(session, speechText, reply);
    } else if (!callSid) {
      console.warn('Voice webhook missing CallSid; continuing without session history.');
    }
    const response = buildSpeechGatherResponse([reply]);

    return res.type('text/xml').send(response.toString());
  } catch (error) {
    console.error('Voice webhook error:', error.message || error);
    // Always return 200 with valid TwiML — Twilio plays "application error" on non-200
    const response = buildSpeechGatherResponse([
      'I had a brief hiccup. Could you please repeat that?',
    ]);
    return res.type('text/xml').send(response.toString());
  }
};

router.post('/voice/incoming', handleVoiceIncoming);
router.get('/voice/incoming', handleVoiceIncoming);

router.post('/voice/speech', handleVoiceSpeech);
router.get('/voice/speech', handleVoiceSpeech);

router.get('/session-flag', (req, res) => {
  res.json({ success: true, flag: 'low', message: 'Session flag retrieved' });
});

router.post('/trigger-referral', (req, res) => {
  res.json({ success: true, message: 'Referral triggered' });
});

router.post('/visit-log', (req, res) => {
  res.json({ success: true, message: 'Visit logged' });
});

router.get('/district-stats', (req, res) => {
  res.json({ success: true, stats: { district: 'Central', activeUsers: 150, riskFlags: 5 } });
});

module.exports = router;
