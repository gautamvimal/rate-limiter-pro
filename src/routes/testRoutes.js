const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');

router.get('/', rateLimiter, (req, res) => {
  res.json({ message: "Request successful 🚀" });
});

module.exports = router;