import express from "express";
import {
  sendMessage,
  getChatHistory,
  getChatRooms,
  getInterestsList,
  markMessagesAsRead,
  deleteMessage,
  addMessageReaction,
  getTypingStatus,
} from "../controllers/messagingController.js";
import { RequireFullVerification } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require full verification
router.use(RequireFullVerification);

// Messaging routes
// router.post("/:userId", sendMessage);
// router.get("/interests", getInterestsList);
// router.get("/:userId", getChatHistory);
// router.get("/", getChatRooms);
// router.post("/:userId/read", markMessagesAsRead);
// router.delete("/message/:messageId", deleteMessage);
// router.post("/message/:messageId/reaction", addMessageReaction);

// Get list of users with mutual interest (for Interests tab)
// GET /api/messages/interests?page=1&limit=20&withMessages=true
router.get("/interests", getInterestsList);

// Get all chat rooms for current user
// GET /api/messages/rooms?page=1&limit=20&onlyWithMessages=true
router.get("/rooms", getChatRooms);

// Get chat history with a specific user
// GET /api/messages/chat/:userId?page=1&limit=50
router.get("/chat/:userId", getChatHistory);

// Send message to a user
// POST /api/messages/send/:userId
// Body: { content: "Hello", messageType: "text" }
router.post("/send/:userId", sendMessage);

// Mark messages as read
// PUT /api/messages/read/:userId
router.put("/read/:userId", markMessagesAsRead);

// Delete a message
// DELETE /api/messages/:messageId
router.delete("/:messageId", deleteMessage);

// Add reaction to message
// POST /api/messages/:messageId/reaction
// Body: { emoji: "❤️" }
router.post("/:messageId/reaction", addMessageReaction);
router.get("/:userId/typing", getTypingStatus);

export default router;
