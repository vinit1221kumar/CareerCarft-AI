import express from 'express';
import { proxyRequest } from '../controllers/proxy.js';
import { requireToken } from '../middleware/auth.js';

const router = express.Router();

// All roadmap routes require authentication (to be enforced in Phase 3)
// router.use(requireToken);

// Proxy all roadmap requests
router.use((req, res, next) => proxyRequest('roadmap', req, res));

export default router;
