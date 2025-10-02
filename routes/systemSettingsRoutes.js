import express from "express";
import {
  getAllSystemSettings,
  updateSystemSetting,
  createSystemSetting,
  deleteSystemSetting,
  getSystemHealth,
  initializeDefaultSettings
} from "../controllers/systemSettingsController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// System Settings routes
router.get("/", VerifyAdmin, getAllSystemSettings);
router.put("/:key", VerifyAdmin, updateSystemSetting);
router.post("/", VerifyAdmin, createSystemSetting);
router.delete("/:key", VerifyAdmin, deleteSystemSetting);
router.get("/health", VerifyAdmin, getSystemHealth);
router.post("/initialize", VerifyAdmin, initializeDefaultSettings);

export default router;
