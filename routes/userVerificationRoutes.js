import express from "express";
import {
  sendEmailVerification,
  confirmEmailVerification,
  sendPhoneVerification,
  confirmPhoneVerification,
  uploadIdVerification,
  uploadVerificationPhotos,
  getVerificationStatus,
  uploadMiddleware
} from "../controllers/userVerificationController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User verification routes
router.post("/email", VerifyToken, sendEmailVerification);
router.get("/email/confirm", confirmEmailVerification);
router.post("/phone", VerifyToken, sendPhoneVerification);
router.post("/phone/confirm", VerifyToken, confirmPhoneVerification);
router.post("/id", VerifyToken, uploadMiddleware.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]), uploadIdVerification);
router.post("/photo", VerifyToken, uploadMiddleware.array('photos', 5), uploadVerificationPhotos);
router.get("/status", VerifyToken, getVerificationStatus);

export default router;
