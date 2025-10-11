import express from 'express';
import { getActivityDashboard, getOnlineMatches } from '../controllers/activityController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get activity dashboard data
router.get('/dashboard', VerifyToken, getActivityDashboard);

// Get online matches
router.get('/online-matches', VerifyToken, getOnlineMatches);

export default router;
