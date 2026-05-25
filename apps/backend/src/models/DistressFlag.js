const mongoose = require('mongoose');

const DistressFlagSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  reason: { type: String }, // e.g. "Consecutive high exhaustion check-ins"
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

module.exports = mongoose.model('DistressFlag', DistressFlagSchema);
