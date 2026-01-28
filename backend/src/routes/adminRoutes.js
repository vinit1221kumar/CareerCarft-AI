import express from 'express';
import {
  getDashboardStats,
  getTopSkillGaps,
  getRoleAnalytics,
  getCommonFeedback,
  generateReport,
  getAllUsers,
  getAllResumes
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/skill-gaps', getTopSkillGaps);
router.get('/dashboard/role-analytics', getRoleAnalytics);
router.get('/dashboard/feedback', getCommonFeedback);

// Report generation
router.get('/reports/generate', generateReport);

// User management
router.get('/users', getAllUsers);

// Resume management
router.get('/resumes', getAllResumes);

export default router;
