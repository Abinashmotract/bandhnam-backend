import express from "express";
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  getPlanStatistics
} from "../controllers/subscriptionManagementController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(VerifyAdmin);

// Get all subscription plans with filters and pagination
router.get("/plans", getAllPlans);

// Get single plan by ID
router.get("/plans/:planId", getPlanById);

// Create new subscription plan
router.post("/plans", createPlan);

// Update subscription plan
router.put("/plans/:planId", updatePlan);

// Delete subscription plan (soft delete)
router.delete("/plans/:planId", deletePlan);

// Toggle plan status (activate/deactivate)
router.patch("/plans/:planId", togglePlanStatus);

// Get plan statistics
router.get("/statistics", getPlanStatistics);

export default router;