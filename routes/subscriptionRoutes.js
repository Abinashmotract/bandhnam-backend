import express from "express";
import {
  getSubscriptionStatus,
  createCheckoutSession,
  confirmPayment,
  cancelSubscription,
  getSubscriptionHistory,
  updateUsage,
  handleWebhook,
  getSubscriptionPlans,
  getAllTransactions,
  getTransactionById,
  getCheckoutSessionDetails,
  processPaymentManually,
  testRazorpayConfig
} from "../controllers/subscriptionController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/plans", getSubscriptionPlans);
// Test endpoint for debugging Razorpay config
router.get("/test-razorpay-config", testRazorpayConfig);

// Protected routes
router.get("/status", VerifyToken, getSubscriptionStatus);
router.post("/create-checkout-session", VerifyToken, createCheckoutSession);
router.get("/checkout-session/:sessionId", VerifyToken, getCheckoutSessionDetails);
router.post("/process-payment", VerifyToken, processPaymentManually);
router.post("/confirm-payment", VerifyToken, confirmPayment);
router.post("/cancel", VerifyToken, cancelSubscription);
router.get("/history", VerifyToken, getSubscriptionHistory);
router.post("/update-usage", VerifyToken, updateUsage);

// Webhook route (no auth required)
router.post("/webhook", handleWebhook);

// Admin routes for transactions
router.get("/admin/transactions", VerifyToken, getAllTransactions);
router.get("/admin/transactions/:transactionId", VerifyToken, getTransactionById);

export default router;
