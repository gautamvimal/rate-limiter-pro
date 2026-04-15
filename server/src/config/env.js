import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rate_limiter',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  unixSocketPath: process.env.UNIX_SOCKET_PATH || '/tmp/rate-limiter-cache.sock',
  slaAdjustIntervalMs: Number(process.env.SLA_ADJUST_INTERVAL_MS || 300000),
  defaultWindowMs: Number(process.env.DEFAULT_WINDOW_MS || 60000),
  defaultLimit: Number(process.env.DEFAULT_LIMIT || 60),
  defaultBurstMultiplier: Number(process.env.DEFAULT_BURST_MULTIPLIER || 1.3),
  defaultQueueLimit: Number(process.env.DEFAULT_QUEUE_LIMIT || 20),
  baseJitterMs: Number(process.env.BASE_JITTER_MS || 30),
  maxJitterMs: Number(process.env.MAX_JITTER_MS || 180)
};

export default env;
