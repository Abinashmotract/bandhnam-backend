import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendNotificationToUser,
  sendNotificationToAllUsers,
  getNotificationStats
} from "../controllers/notificationController.js";
import { VerifyToken, VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes (require authentication)
router.use(VerifyToken);

// Notification routes
router.get("/", getNotifications);
router.post("/read/:notificationId", markNotificationAsRead);
router.post("/read-all", markAllNotificationsAsRead);
router.delete("/:notificationId", deleteNotification);
router.delete("/", deleteAllNotifications);

// Admin routes (require admin authentication)
router.post("/admin/send/:userId", VerifyAdmin, sendNotificationToUser);
router.post("/admin/send-all", VerifyAdmin, sendNotificationToAllUsers);
router.get("/admin/stats", VerifyAdmin, getNotificationStats);

export default router;
