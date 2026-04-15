import { redisClient } from '../config/redis.js';
import env from '../config/env.js';

const buildSubjectKey = ({ userId, organizationId, plan }) => {
  if (userId) return `user:${userId}`;
  if (organizationId) return `org:${organizationId}`;
  if (plan) return `plan:${plan}`;
  return 'global:anonymous';
};

const buildLimiterKey = ({ subjectKey, method, routeKey }) =>
  `rl:${subjectKey}:${method.toUpperCase()}:${routeKey.replace(/\//g, ':')}`;

const getCurrentUsage = async ({ subjectKey, method, routeKey, windowMs }) => {
  const key = buildLimiterKey({ subjectKey, method, routeKey });
  const now = Date.now();
  const lowerBound = now - windowMs;
  await redisClient.zremrangebyscore(key, 0, lowerBound);
  const count = await redisClient.zcard(key);
  return { key, count, now };
};

const evaluateRateLimit = async ({ identity, policy, method, routeKey }) => {
  const subjectKey = buildSubjectKey(identity);
  const key = buildLimiterKey({ subjectKey, method, routeKey });
  const now = Date.now();
  const lowerBound = now - policy.windowMs;

  await redisClient.zremrangebyscore(key, 0, lowerBound);
  const currentCount = await redisClient.zcard(key);
  const burstLimit = Math.max(policy.limit, Math.ceil(policy.limit * (policy.burstMultiplier || env.defaultBurstMultiplier)));
  const queueDepth = Math.max(0, currentCount - policy.limit + 1);

  let decision = 'allow';
  if (currentCount >= burstLimit) {
    decision = 'reject';
  } else if (currentCount >= policy.limit) {
    decision = 'delay';
  }

  if (decision !== 'reject') {
    const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;
    await redisClient.zadd(key, now, member);
    await redisClient.expire(key, Math.max(2, Math.ceil(policy.windowMs / 1000) * 2));
  }

  const requestCount = decision === 'reject' ? currentCount : currentCount + 1;
  const remaining = Math.max(0, policy.limit - requestCount);
  const resetAt = now + policy.windowMs;

  return {
    key,
    subjectKey,
    decision,
    currentCount: requestCount,
    rawCount: currentCount,
    remaining,
    burstLimit,
    queueDepth,
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil(policy.windowMs / 1000))
  };
};

export default {
  buildSubjectKey,
  buildLimiterKey,
  getCurrentUsage,
  evaluateRateLimit
};
