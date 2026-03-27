const express = require('express');
const router = express.Router();
const RateLog = require('../models/RateLog');
const RatePolicy = require('../models/RatePolicy');

router.get('/', async (req, res) => {

  const totalBlocks = await RateLog.countDocuments();
  const policies = await RatePolicy.countDocuments();
  const recentLogs = await RateLog.find().sort({ timestamp: -1 }).limit(5);

  res.json({
    blockedRequests: totalBlocks,
    activePolicies: policies,
    recentLogs
  });
});

module.exports = router;