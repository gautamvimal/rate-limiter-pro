import Policy from '../models/Policy.js';
import env from '../config/env.js';
import { redisClient } from '../config/redis.js';

const defaultPolicy = () => ({
  _id: null,
  name: 'Default Policy',
  scope: 'global',
  identifier: 'default',
  limit: env.defaultLimit,
  windowMs: env.defaultWindowMs,
  burstMultiplier: env.defaultBurstMultiplier,
  queueLimit: env.defaultQueueLimit,
  slaTier: 'bronze',
  active: true
});

const getAdaptiveLimit = async (policyId) => {
  if (!policyId) return null;
  const adaptive = await redisClient.get(`policy:adaptive:${policyId}`);
  return adaptive ? Number(adaptive) : null;
};

const getEffectivePolicy = async ({ userId, organizationId, plan }) => {
  const candidates = [
    userId ? { scope: 'user', identifier: userId } : null,
    organizationId ? { scope: 'organization', identifier: organizationId } : null,
    plan ? { scope: 'plan', identifier: plan } : null,
    { scope: 'global', identifier: 'default' }
  ].filter(Boolean);

  for (const candidate of candidates) {
    const policy = await Policy.findOne({ ...candidate, active: true }).sort({ updatedAt: -1 }).lean();
    if (policy) {
      const adaptiveLimit = await getAdaptiveLimit(policy._id);
      return {
        ...policy,
        limit: adaptiveLimit || policy.currentAdaptiveLimit || policy.limit
      };
    }
  }

  return defaultPolicy();
};

const listPolicies = async () => Policy.find().sort({ scope: 1, identifier: 1, createdAt: -1 });

const upsertPolicy = async (payload) => {
  const filter = { scope: payload.scope, identifier: payload.identifier };
  return Policy.findOneAndUpdate(filter, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  });
};

export default {
  defaultPolicy,
  getEffectivePolicy,
  listPolicies,
  upsertPolicy
};
