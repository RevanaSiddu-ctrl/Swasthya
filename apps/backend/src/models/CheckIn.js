const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['micro', 'voice', 'passive'], required: true },
  metrics: {
    sleepQuality: { type: Number, min: 1, max: 5 },
    exhaustionLevel: { type: Number, min: 1, max: 5 },
    stressLevel: { type: Number, min: 1, max: 5 },
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckIn', CheckInSchema);
