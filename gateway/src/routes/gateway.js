import express from 'express';
import { getGatewayHealth, getAllServicesStatus, getGatewayInfo } from '../controllers/gateway.js';

const router = express.Router();

// Gateway health check
router.get('/health', getGatewayHealth);

// All services status
router.get('/status', getAllServicesStatus);

// Gateway information
router.get('/info', getGatewayInfo);

export default router;
