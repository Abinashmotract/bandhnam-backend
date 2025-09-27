import express from "express";
import {
  sendEmailVerification,
  confirmEmailVerification,
  sendPhoneVerification,
  confirmPhoneVerification,
  uploadIdVerification,
  uploadVerificationPhotos,
  getVerificationStatus,
  getPendingVerifications,
  reviewVerification
} from "../controllers/verificationController.js";
import { VerifyToken, VerifyAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// User routes (require authentication)
router.use(VerifyToken);

// Email verification
router.post("/email", sendEmailVerification);
router.get("/email/confirm", confirmEmailVerification);

// Phone verification
router.post("/phone", sendPhoneVerification);
router.post("/phone/confirm", confirmPhoneVerification);

// ID verification
router.post("/id", upload.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 }
]), uploadIdVerification);

// Photo verification
router.post("/photo", upload.array("photos", 5), uploadVerificationPhotos);

// Get verification status
router.get("/status", getVerificationStatus);

// Admin routes (require admin authentication)
router.get("/admin/pending", VerifyAdmin, getPendingVerifications);
router.put("/admin/:verificationId/review", VerifyAdmin, reviewVerification);

export default router;
