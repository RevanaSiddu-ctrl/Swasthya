const mongoose = require('mongoose');
const { env } = require('../../config/env');

const connectDB = async () => {
  try {
    if (!env.mongo.uri) {
      console.warn('⚠️  Warning: MONGODB_URI is not set. Skipping DB connection.');
      return;
    }
    
    await mongoose.connect(env.mongo.uri);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
