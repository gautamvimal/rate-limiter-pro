import mongoose from 'mongoose';
import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import { pingRedis, redisClient } from './config/redis.js';
import { startCacheSocket } from './sockets/cacheSocket.js';
import { startSlaAdjuster } from './workers/slaAdjuster.js';
import Policy from './models/Policy.js';
import logger from './utils/logger.js';

const seedDefaultPolicies = async () => {
  const defaults = [
    {
      name: 'Global Free Tier',
      scope: 'plan',
      identifier: 'free',
      limit: 30,
      windowMs: 60000,
      burstMultiplier: 1.15,
      queueLimit: 10,
      slaTier: 'bronze',
      notes: 'Entry tier for public APIs'
    },
    {
      name: 'Pro Tier',
      scope: 'plan',
      identifier: 'pro',
      limit: 120,
      windowMs: 60000,
      burstMultiplier: 1.4,
      queueLimit: 25,
      slaTier: 'gold',
      notes: 'Ideal for Stripe/Twilio-like paid integrations'
    },
    {
      name: 'Fallback Global',
      scope: 'global',
      identifier: 'default',
      limit: env.defaultLimit,
      windowMs: env.defaultWindowMs,
      burstMultiplier: env.defaultBurstMultiplier,
      queueLimit: env.defaultQueueLimit,
      slaTier: 'bronze',
      notes: 'Default policy when no user, org, or plan match exists'
    }
  ];

  for (const policy of defaults) {
    await Policy.findOneAndUpdate(
      { scope: policy.scope, identifier: policy.identifier },
      policy,
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
};

const bootstrap = async () => {
  try {
    await connectDB();
    await pingRedis();
    await seedDefaultPolicies();
    startCacheSocket({ redisClient });
    startSlaAdjuster();

    app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Server bootstrap failed', error.message);
    await mongoose.disconnect().catch(() => null);
    redisClient.disconnect();
    process.exit(1);
  }
};

bootstrap();
