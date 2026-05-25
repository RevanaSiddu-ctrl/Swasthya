const express = require('express');
const router = express.Router();
const IVRSignal = require('../models/IVRSignal');

// 1. Get Dashboard Alerts for GP / ASHA Workers
router.get('/alerts', async (req, res) => {
  try {
    // Find all users who have triggered a distress flag recently
    // In a real app we'd filter by assigned region or GP ID, but for the MVP we fetch all.
    const alerts = await IVRSignal.find({ distressFlag: true })
      .sort({ timestamp: -1 })
      .populate('userId', 'name phoneNumber firebaseUid')
      .limit(20);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('GP Dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching GP alerts' });
  }
});

module.exports = router;
