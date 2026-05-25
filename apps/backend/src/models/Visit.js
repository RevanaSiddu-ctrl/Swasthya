const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gpId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assumes GP is also a User role
  notes: { type: String },
  somaticSymptoms: [{ type: String }],
  behavioralObservations: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', VisitSchema);
