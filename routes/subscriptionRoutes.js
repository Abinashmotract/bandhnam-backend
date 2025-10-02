import express from "express";
import {
  getSubscriptionStatus,
  createPaymentIntent,
  confirmPayment,
  cancelSubscription,
  getSubscriptionHistory,
  updateUsage,
  handleWebhook,
  getSubscriptionPlans
} from "../controllers/subscriptionController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/plans", getSubscriptionPlans);

// Protected routes
router.get("/status", VerifyToken, getSubscriptionStatus);
router.post("/create-payment-intent", VerifyToken, createPaymentIntent);
router.post("/confirm-payment", VerifyToken, confirmPayment);
router.post("/cancel", VerifyToken, cancelSubscription);
router.get("/history", VerifyToken, getSubscriptionHistory);
router.post("/update-usage", VerifyToken, updateUsage);

// Webhook route (no auth required)
router.post("/webhook", handleWebhook);

export default router;
