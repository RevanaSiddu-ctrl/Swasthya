const mongoose = require('mongoose');

const IVRSignalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callDuration: { type: Number },
  speechMetrics: {
    pauseDensity: { type: Number },
    pace: { type: String, enum: ['normal', 'slow', 'fast'] },
    vocalFatigue: { type: Boolean },
  },
  transcriptSentiment: { type: Number }, // from Azure OpenAI
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('IVRSignal', IVRSignalSchema);
