import express from 'express';
import { proxyRequest } from '../controllers/proxy.js';
import { requireToken } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication (to be enforced in Phase 3)
// router.use(requireToken);

// Proxy all analytics requests
router.use((req, res, next) => proxyRequest('analytics', req, res));

export default router;
