import express from "express";
import {
  getAllVerifications,
  approveVerification,
  rejectVerification,
  getVerificationAnalytics
} from "../controllers/verificationController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Verification Center routes
router.get("/", VerifyAdmin, getAllVerifications);
router.patch("/:verificationId/approve", VerifyAdmin, approveVerification);
router.patch("/:verificationId/reject", VerifyAdmin, rejectVerification);
router.get("/analytics/overview", VerifyAdmin, getVerificationAnalytics);

export default router;