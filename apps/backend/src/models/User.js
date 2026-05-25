const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'asha_worker', 'gp'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
