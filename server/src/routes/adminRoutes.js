import { Router } from 'express';
import { getAnalytics, getPolicies, triggerSlaAdjustment, upsertPolicy } from '../controllers/adminController.js';

const router = Router();

router.get('/policies', getPolicies);
router.post('/policies', upsertPolicy);
router.get('/analytics', getAnalytics);
router.post('/policies/sync-sla', triggerSlaAdjustment);

export default router;
