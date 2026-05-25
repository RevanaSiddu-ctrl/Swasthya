const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const openaiService = require('../services/azure/openai');
const User = require('../models/User');
const IVRSignal = require('../models/IVRSignal');
const CheckIn = require('../models/CheckIn');
const HealthAggregate = require('../models/HealthAggregate');

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

const handleVoiceIncoming = async (req, res) => {
  const callSid = getRequestValue(req, 'CallSid');
  const from = getRequestValue(req, 'From') || 'unknown';
  console.log('[INCOMING]', req.method, 'CallSid:', callSid, 'From:', from);
  pruneSessions();
  
  let userId = null;
  try {
    // Find or create User based on phone number
    let user = await User.findOne({ phoneNumber: from });
    if (!user) {
      user = await User.create({
        firebaseUid: `phone_${from}`,
        phoneNumber: from,
      });
      console.log(`[DB] Created new user for ${from}`);
    }
    userId = user._id;
  } catch (dbError) {
    console.error('Failed to resolve user in DB:', dbError.message);
  }

  if (callSid) {
    voiceSessions.set(callSid, { messages: [], updatedAt: Date.now(), userId });
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
    
    // Process Gemini reply and Sentiment Analysis concurrently
    const [reply, sentimentResult] = await Promise.all([
      openaiService.generateReply(speechText, history),
      openaiService.analyzeSentiment(speechText).catch(err => {
        console.error('Sentiment analysis failed:', err.message);
        return { score: 0.5 }; // fallback
      })
    ]);

    console.log('[SPEECH] Gemini reply:', reply);
    
    if (session) {
      updateSession(session, speechText, reply);
      
      // Asynchronously save IVRSignal to MongoDB (don't block the twilio response)
      if (session.userId) {
        IVRSignal.create({
          userId: session.userId,
          callDuration: Math.floor(Math.random() * 120) + 30, // mock duration
          speechMetrics: {
            pauseDensity: Math.random() * 0.5,
            pace: 'normal',
            vocalFatigue: false,
          },
          transcriptSentiment: sentimentResult.score,
        }).then(() => console.log('[DB] Saved IVRSignal'))
          .catch(err => console.error('[DB] Failed to save IVRSignal:', err.message));
      }
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
  res.json({ success: true, message: 'Referral triggered (mock)' });
});

// --- REST API ENDPOINTS FOR MOBILE APP ---

// 1. User Login / Registration
router.post('/users', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({
        firebaseUid: `mock_${phoneNumber}`,
        phoneNumber,
        name: 'Guest User',
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Submit a Check-In
router.post('/checkins', async (req, res) => {
  try {
    const { userId, type, responses } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const checkIn = await CheckIn.create({
      userId,
      type: type || 'daily_micro',
      responses,
    });
    
    // Simple sentiment analysis for the check-in text if provided
    if (responses && responses.textNotes) {
      // Async background task to analyze sentiment and update health aggregate
      openaiService.analyzeSentiment(responses.textNotes).then(async (sentiment) => {
        await HealthAggregate.create({
          userId,
          checkInId: checkIn._id,
          anomalyScore: sentiment.score < 0.3 ? 0.8 : 0.1, // Mock anomaly logic
          distressFlag: sentiment.score < 0.2,
        });
      }).catch(err => console.error('Sentiment failed:', err));
    }

    res.json({ success: true, checkIn });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get Dashboard Summary
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch latest check-ins and IVR signals
    const [checkIns, signals, health] = await Promise.all([
      CheckIn.find({ userId }).sort({ timestamp: -1 }).limit(5),
      IVRSignal.find({ userId }).sort({ timestamp: -1 }).limit(5),
      HealthAggregate.findOne({ userId }).sort({ timestamp: -1 })
    ]);

    res.json({
      success: true,
      data: {
        recentCheckIns: checkIns,
        recentVoiceCalls: signals,
        healthStatus: health || { anomalyScore: 0, distressFlag: false }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/visit-log', (req, res) => {
  res.json({ success: true, message: 'Visit logged' });
});

router.get('/district-stats', (req, res) => {
  res.json({ success: true, stats: { district: 'Central', activeUsers: 150, riskFlags: 5 } });
});

module.exports = router;
