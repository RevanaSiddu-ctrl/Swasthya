const mongoose = require('mongoose');
const { env } = require('../config/env');
const User = require('../src/models/User');
const IVRSignal = require('../src/models/IVRSignal');
const CheckIn = require('../src/models/CheckIn');

const MOCK_USERS = [
  { name: 'Aarav Patel', phoneNumber: '+919999999991', email: 'aarav@example.com' },
  { name: 'Priya Sharma', phoneNumber: '+919999999992', email: 'priya@example.com' },
  { name: 'Rohan Gupta', phoneNumber: '+919999999993', email: 'rohan@example.com' },
  { name: 'Ananya Singh', phoneNumber: '+919999999994', email: 'ananya@example.com' },
  { name: 'Vikram Mehta', phoneNumber: '+919999999995', email: 'vikram@example.com' }
];

async function seed() {
  console.log('🌱 Starting Database Seeding...');
  
  try {
    await mongoose.connect(env.mongo.uri);
    console.log('✅ Connected to MongoDB Atlas');

    for (let i = 0; i < MOCK_USERS.length; i++) {
      const userData = MOCK_USERS[i];
      
      // Create or find user
      let user = await User.findOne({ phoneNumber: userData.phoneNumber });
      if (!user) {
        user = await User.create({
          phoneNumber: userData.phoneNumber,
          name: userData.name,
          email: userData.email,
          firebaseUid: `mock_uid_${i}`
        });
        console.log(`👤 Created user: ${user.name}`);
      } else {
        console.log(`👤 Found user: ${user.name}`);
      }

      // Determine if this user is in crisis (2 out of 5 users)
      const isInCrisis = i % 2 === 0;

      // Add Mock IVR Signal
      await IVRSignal.create({
        userId: user._id,
        callDuration: Math.floor(Math.random() * 100) + 20,
        speechMetrics: {
          pauseDensity: Math.random(),
          pace: isInCrisis ? 'slow' : 'normal',
          vocalFatigue: isInCrisis
        },
        transcriptSentiment: isInCrisis ? 0.1 : 0.8,
        distressFlag: isInCrisis,
        behavioralIndicators: isInCrisis ? ['exhaustion', 'hopelessness', 'isolation'] : ['stable', 'positive'],
        crisisPhrases: isInCrisis ? ['I cannot take this anymore'] : [],
        gpSummaryNote: isInCrisis 
          ? `Patient ${user.name} is showing severe signs of burnout and isolation.` 
          : `Patient ${user.name} appears emotionally stable.`,
        timestamp: new Date(Date.now() - Math.random() * 86400000) // within last 24 hrs
      });

      // Add Mock CheckIn
      await CheckIn.create({
        userId: user._id,
        type: 'daily_micro',
        responses: {
          mood: isInCrisis ? 1 : (Math.floor(Math.random() * 2) + 4), // 1 if crisis, 4-5 if normal
          textNotes: isInCrisis ? 'Feeling completely overwhelmed and sad.' : 'Had a pretty good day.'
        },
        timestamp: new Date(Date.now() - Math.random() * 86400000)
      });
    }

    console.log('✅ Seeding Complete! The GP Dashboard is now populated.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
