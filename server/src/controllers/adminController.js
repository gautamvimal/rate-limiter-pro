import Policy from '../models/Policy.js';
import UsageLog from '../models/UsageLog.js';
import policyService from '../services/policyService.js';
import { runSlaAdjusterOnce } from '../workers/slaAdjuster.js';

export const getPolicies = async (_req, res, next) => {
  try {
    const policies = await policyService.listPolicies();
    res.json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

export const upsertPolicy = async (req, res, next) => {
  try {
    const policy = await policyService.upsertPolicy(req.body);
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (_req, res, next) => {
  try {
    const [policyCount, usageCount, recentLogs, topRoutes] = await Promise.all([
      Policy.countDocuments(),
      UsageLog.countDocuments(),
      UsageLog.find().sort({ createdAt: -1 }).limit(20).lean(),
      UsageLog.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } } },
        {
          $group: {
            _id: { routeKey: '$routeKey', decision: '$decision' },
            total: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        policyCount,
        usageCount,
        recentLogs,
        topRoutes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const triggerSlaAdjustment = async (_req, res, next) => {
  try {
    const result = await runSlaAdjusterOnce();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
