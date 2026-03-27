const mongoose = require('mongoose');

const RatePolicySchema = new mongoose.Schema({
  tier: {
    type: String,
    required: true,
    enum: ['FREE', 'PRO', 'ADMIN']
  },
  endpoint: {
    type: String,
    required: true
  },
  maxRequests: {
    type: Number,
    required: true
  },
  windowSize: {
    type: Number, // in seconds
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('RatePolicy', RatePolicySchema);