import policyService from '../services/policyService.js';
import rateLimitService from '../services/rateLimitService.js';
import jitterService from '../services/jitterService.js';
import backoffService from '../services/backoffService.js';
import UsageLog from '../models/UsageLog.js';
import hash from '../utils/hash.js';
import env from '../config/env.js';
import { sleep } from '../utils/time.js';

const resolveIdentity = (req) => ({
  userId: req.headers['x-user-id'] || req.query.userId || null,
  organizationId: req.headers['x-org-id'] || req.query.orgId || null,
  plan: req.headers['x-plan'] || req.query.plan || 'free'
});

const persistLog = async ({ req, identity, policy, result, backoff }) => {
  await UsageLog.create({
    userId: identity.userId,
    organizationId: identity.organizationId,
    plan: identity.plan,
    routeKey: req.route?.path || req.path,
    method: req.method,
    policyId: policy._id,
    requestHash: hash(`${identity.userId || 'anon'}:${req.method}:${req.originalUrl}:${Date.now()}`),
    decision: result.decision,
    usageCount: result.currentCount,
    retryAfterSeconds: result.retryAfterSeconds,
    metadata: {
      queueDepth: result.queueDepth,
      remaining: result.remaining,
      backoffMode: backoff.mode,
      backoffDelayMs: backoff.delayMs,
      slaTier: policy.slaTier
    }
  });
};

const rateLimiter = async (req, res, next) => {
  try {
    const identity = resolveIdentity(req);
    const policy = await policyService.getEffectivePolicy(identity);
    const routeKey = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
    const result = await rateLimitService.evaluateRateLimit({
      identity,
      policy,
      method: req.method,
      routeKey
    });

    const backoff = backoffService.calculateBackoff({
      currentCount: result.currentCount,
      limit: policy.limit,
      windowMs: policy.windowMs,
      queueDepth: result.queueDepth,
      queueLimit: policy.queueLimit || env.defaultQueueLimit
    });

    res.setHeader('X-RateLimit-Limit', policy.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);
    res.setHeader('X-RateLimit-Policy', `${policy.limit};w=${Math.round(policy.windowMs / 1000)}`);

    if (result.decision === 'delay' && backoff.mode === 'delay') {
      const delayMs = backoff.delayMs + jitterService.getJitterDelay(env.baseJitterMs, env.maxJitterMs);
      await sleep(delayMs);
      res.setHeader('X-RateLimit-Delayed', delayMs);
      await persistLog({ req, identity, policy, result, backoff });
      req.rateLimit = { identity, policy, result, delayedByMs: delayMs };
      return next();
    }

    if (result.decision === 'reject') {
      res.setHeader('Retry-After', result.retryAfterSeconds);
      await persistLog({ req, identity, policy, result, backoff });
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please retry later.',
        details: {
          limit: policy.limit,
          windowMs: policy.windowMs,
          retryAfterSeconds: result.retryAfterSeconds,
          queueDepth: result.queueDepth,
          slaTier: policy.slaTier
        }
      });
    }

    await persistLog({ req, identity, policy, result, backoff });
    req.rateLimit = { identity, policy, result, delayedByMs: 0 };
    next();
  } catch (error) {
    next(error);
  }
};

export default rateLimiter;
