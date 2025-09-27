import express from "express";
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getReports,
  resolveReport,
  getAnalytics,
  sendSystemNotification,
  getDashboardStats
} from "../controllers/adminController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(VerifyAdmin);

// User management
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Reports management
router.get("/reports", getReports);
router.put("/reports/:reportId/resolve", resolveReport);

// Analytics and statistics
router.get("/analytics", getAnalytics);
router.get("/dashboard", getDashboardStats);

// System notifications
router.post("/notifications", sendSystemNotification);

export default router;
