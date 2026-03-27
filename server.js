require('dotenv').config();
const express = require('express');
const path = require('path');

const connectDB = require('./config/db');
const { connectRedis, getRedisClient } = require('./config/redis');

const RequestLog = require('./models/RequestLog');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

/* ===============================
   MIDDLEWARE
================================*/
app.use(express.json());

/* ===============================
   GLOBAL REQUEST LOGGER
================================*/
app.use(async (req, res, next) => {
  try {
    const redis = getRedisClient();

    if (redis) {
      await redis.incr('total_requests');
    }

    await RequestLog.create({
      ip: req.ip,
      endpoint: req.originalUrl,
      method: req.method,
      blocked: false
    });

    console.log(`${req.method} ${req.originalUrl} from ${req.ip}`);
    next();

  } catch (err) {
    console.error("Logger error:", err.message);
    next();
  }
});

/* ===============================
   ✅ RATE LIMITER (APPLIED GLOBALLY)
================================*/
app.use(rateLimiter);

/* ===============================
   VIEW ENGINE (EJS)
================================*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ===============================
   ROUTES
================================*/
app.get('/health', (req, res) => res.json({ status: "OK" }));

app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/metrics', require('./routes/metricsRoutes'));

/* ===============================
   DASHBOARD ROUTE
================================*/
app.get('/dashboard', async (req, res) => {
  try {
    const totalRequests = await RequestLog.countDocuments();
    const blockedRequests = await RequestLog.countDocuments({ blocked: true });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const activeIps = await RequestLog.distinct('ip', {
      createdAt: { $gte: oneHourAgo }
    });

    res.render('dashboard', {
      totalRequests,
      blockedRequests,
      activeIps: activeIps.length
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Dashboard error");
  }
});

/* ===============================
   CONNECT SERVICES + START SERVER
================================*/
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();