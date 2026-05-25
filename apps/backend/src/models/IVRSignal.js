const mongoose = require('mongoose');

const IVRSignalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callDuration: { type: Number },
  speechMetrics: {
    pauseDensity: { type: Number },
    pace: { type: String, enum: ['normal', 'slow', 'fast'] },
    vocalFatigue: { type: Boolean },
  },
  transcriptSentiment: { type: Number }, // 0 to 1
  distressFlag: { type: Boolean, default: false },
  behavioralIndicators: [{ type: String }],
  crisisPhrases: [{ type: String }],
  gpSummaryNote: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('IVRSignal', IVRSignalSchema);
