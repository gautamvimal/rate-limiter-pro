import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDB } from '../config/db.js';
import { redisClient } from '../config/redis.js';
import Policy from '../models/Policy.js';
import UsageLog from '../models/UsageLog.js';
import logger from '../utils/logger.js';

const adjustLimit = ({ slaTier, baseLimit, utilization }) => {
  if (utilization > 0.95 && ['bronze', 'silver'].includes(slaTier)) {
    return Math.max(1, Math.floor(baseLimit * 0.9));
  }

  if (utilization < 0.35) {
    return Math.ceil(baseLimit * 1.05);
  }

  return baseLimit;
};

export const runSlaAdjusterOnce = async () => {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const activePolicies = await Policy.find({ active: true });
  const updates = [];

  for (const policy of activePolicies) {
    const count = await UsageLog.countDocuments({
      policyId: policy._id,
      createdAt: { $gte: since }
    });

    const projectedLimit = Math.max(1, Math.round((policy.limit * (15 * 60 * 1000)) / policy.windowMs));
    const utilization = projectedLimit === 0 ? 0 : count / projectedLimit;
    const nextLimit = adjustLimit({
      slaTier: policy.slaTier,
      baseLimit: policy.limit,
      utilization
    });

    policy.currentAdaptiveLimit = nextLimit;
    await policy.save();
    await redisClient.set(`policy:adaptive:${policy._id}`, nextLimit, 'EX', Math.ceil(env.slaAdjustIntervalMs / 1000) * 2);

    updates.push({
      policyId: String(policy._id),
      name: policy.name,
      previousLimit: policy.limit,
      adaptiveLimit: nextLimit,
      utilization: Number(utilization.toFixed(2))
    });
  }

  return { executedAt: new Date().toISOString(), updates };
};

export const startSlaAdjuster = () => {
  const interval = setInterval(async () => {
    try {
      const result = await runSlaAdjusterOnce();
      logger.info('SLA adjuster executed', result);
    } catch (error) {
      logger.error('SLA adjuster failed', error.message);
    }
  }, env.slaAdjustIntervalMs);

  return interval;
};

if (process.argv[1] && process.argv[1].endsWith('slaAdjuster.js')) {
  (async () => {
    try {
      await connectDB();
      await runSlaAdjusterOnce();
      await mongoose.disconnect();
      redisClient.disconnect();
      process.exit(0);
    } catch (error) {
      logger.error('Standalone SLA adjuster failed', error.message);
      process.exit(1);
    }
  })();
}
