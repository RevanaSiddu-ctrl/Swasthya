const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  responses: {
    mood: { type: Number },
    textNotes: { type: String }
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckIn', CheckInSchema);
