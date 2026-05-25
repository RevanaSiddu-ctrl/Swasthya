const mongoose = require('mongoose');

const HealthAggregateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  aggregatedMetrics: {
    averageSleep: { type: Number },
    averageExhaustion: { type: Number },
    averageStress: { type: Number },
    anomalyScore: { type: Number }, // from Azure Anomaly Detector
  },
  trendDirection: { type: String, enum: ['stable', 'improving', 'deteriorating'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HealthAggregate', HealthAggregateSchema);
