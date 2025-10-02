import express from "express";
import {
  getAllMessages,
  getConversation,
  sendSystemMessage,
  getMessageAnalytics
} from "../controllers/messagesController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Messages & Chats routes
router.get("/", VerifyAdmin, getAllMessages);
router.get("/conversation/:userId1/:userId2", VerifyAdmin, getConversation);
router.post("/system", VerifyAdmin, sendSystemMessage);
router.get("/analytics/overview", VerifyAdmin, getMessageAnalytics);

export default router;
