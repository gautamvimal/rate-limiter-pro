const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  ip: String,
  endpoint: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RequestLog', requestLogSchema);