const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tier: String,
  endpoint: String,
  timestamp: Date,
  reason: String
});

module.exports = mongoose.model('RateLog', schema);