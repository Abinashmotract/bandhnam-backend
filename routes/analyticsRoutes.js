import express from "express";
import {
  getProfileAnalytics,
  getDetailedAnalytics,
  getAnalyticsInsights,
  updateAnalytics
} from "../controllers/analyticsController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(VerifyToken);

// Analytics routes
router.get("/", getProfileAnalytics);
router.get("/detailed", getDetailedAnalytics);
router.get("/insights", getAnalyticsInsights);
router.post("/update", updateAnalytics);

export default router;

