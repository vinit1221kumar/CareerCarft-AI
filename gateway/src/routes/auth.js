import express from 'express';
import { proxyRequest } from '../controllers/proxy.js';
import { requireToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/signup', (req, res, next) => proxyRequest('auth', req, res));
router.post('/login', (req, res, next) => proxyRequest('auth', req, res));

// Protected routes (auth required)
// router.use(requireToken); // Uncomment in Phase 3 when JWT is fully implemented

// All other auth routes
router.use((req, res, next) => proxyRequest('auth', req, res));

export default router;
