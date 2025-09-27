import express from "express";
import {
  sendMessage,
  getChatHistory,
  getChatRooms,
  markMessagesAsRead,
  deleteMessage,
  addMessageReaction,
  getTypingStatus
} from "../controllers/messagingController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(VerifyToken);

// Messaging routes
router.post("/:userId", sendMessage);
router.get("/:userId", getChatHistory);
router.get("/", getChatRooms);
router.post("/:userId/read", markMessagesAsRead);
router.delete("/message/:messageId", deleteMessage);
router.post("/message/:messageId/reaction", addMessageReaction);
router.get("/:userId/typing", getTypingStatus);

export default router;
