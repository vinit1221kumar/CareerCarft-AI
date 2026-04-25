import express from 'express';
import { health, insights, status } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/health', health);
router.get('/status', status);
router.get('/insights', insights);

export default router;
