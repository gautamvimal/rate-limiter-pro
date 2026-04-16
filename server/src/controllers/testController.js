import rateLimitService from '../services/rateLimitService.js';

export const hitTestEndpoint = async (req, res, next) => {
  try {
    const identity = req.rateLimit?.identity || {
      userId: req.headers['x-user-id'] || 'anonymous',
      organizationId: req.headers['x-org-id'] || 'personal',
      plan: req.headers['x-plan'] || 'free'
    };

    const routeKey = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
    const usage = await rateLimitService.getCurrentUsage({
      subjectKey: rateLimitService.buildSubjectKey(identity),
      method: req.method,
      routeKey,
      windowMs: req.rateLimit?.policy?.windowMs || 60000
    });

    res.json({
      success: true,
      message: 'Request accepted by rate limiter.',
      data: {
        identity,
        policy: req.rateLimit?.policy,
        usage,
        delayedByMs: req.rateLimit?.delayedByMs || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicStatus = async (_req, res, next) => {
  try {
    res.json({
      success: true,
      service: 'rate-limiter',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
