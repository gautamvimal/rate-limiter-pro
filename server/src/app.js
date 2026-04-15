import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/apiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'API Rate Limiter Service',
    features: [
      'Sliding window limiting using Redis sorted sets',
      'MongoDB policy storage and usage logs',
      'Adaptive SLA tuning',
      'Jitter and gradual backoff to reduce thundering herd'
    ]
  });
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;
