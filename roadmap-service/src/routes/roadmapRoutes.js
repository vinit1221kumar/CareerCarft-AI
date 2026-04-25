import express from 'express';
import { generateRoadmap, getLatestRoadmap, getRoadmap, health, status } from '../controllers/roadmapController.js';

const router = express.Router();

router.get('/health', health);
router.get('/status', status);
router.post('/generate-roadmap', generateRoadmap);
router.get('/latest/:userId', getLatestRoadmap);
router.get('/:id', getRoadmap);

export default router;
