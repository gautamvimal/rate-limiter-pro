import { Router } from 'express';
import rateLimiter from '../middleware/rateLimiter.js';
import { getPublicStatus, hitTestEndpoint } from '../controllers/testController.js';

const router = Router();

router.get('/status', getPublicStatus);
router.all('/test', rateLimiter, hitTestEndpoint);

export default router;
