import express from "express";
import {
  getComprehensiveAnalytics,
  getDashboardStats,
  generateReport
} from "../controllers/analyticsController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Reports & Analytics routes
router.get("/comprehensive", VerifyAdmin, getComprehensiveAnalytics);
router.get("/dashboard", VerifyAdmin, getDashboardStats);
router.post("/reports/generate", VerifyAdmin, generateReport);

export default router;