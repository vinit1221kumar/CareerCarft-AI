import express from 'express';
import { proxyRequest } from '../controllers/proxy.js';
import { requireToken } from '../middleware/auth.js';

const router = express.Router();

// All resume routes require authentication (to be enforced in Phase 3)
// router.use(requireToken);

// Proxy all resume requests
router.use((req, res, next) => proxyRequest('resume', req, res));

export default router;
