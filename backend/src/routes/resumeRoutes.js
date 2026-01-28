import express from 'express';
import {
  uploadResume,
  getResume,
  getUserResumes,
  analyzeSkillGap,
  generateRoadmap,
  getRoadmap,
  updateRoadmapProgress,
  deleteResume
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Resume routes
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getUserResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

// Skill gap analysis
router.post('/analyze-skill-gap', analyzeSkillGap);

// Roadmap generation
router.post('/generate-roadmap', generateRoadmap);
router.get('/roadmap/:id', getRoadmap);
router.put('/roadmap/:id/progress', updateRoadmapProgress);

export default router;
