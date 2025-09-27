import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20, type, isRead } = req.query;

    let filters = { user: currentUserId };
    if (type) {
      filters.type = type;
    }
    if (isRead !== undefined) {
      filters.isRead = isRead === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Notification.countDocuments(filters);

    const unreadCount = await Notification.countDocuments({
      user: currentUserId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
      error: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: currentUserId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully"
    });

  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const result = await Notification.updateMany(
      { user: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
      data: { updatedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking all notifications as read",
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: currentUserId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
      error: error.message
    });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const result = await Notification.deleteMany({
      user: currentUserId
    });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting all notifications",
      error: error.message
    });
  }
};

// Admin: Send notification to user
export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type = "system", priority = "medium", data = {} } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification
    });

  } catch (error) {
    console.error("Send notification to user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending notification",
      error: error.message
    });
  }
};

// Admin: Send notification to all users
export const sendNotificationToAllUsers = async (req, res) => {
  try {
    const { title, message, type = "system", priority = "medium", data = {} } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    // Get all active users
    const users = await User.find({ role: "user" }).select("_id");

    // Create notifications for all users
    const notifications = users.map(user => ({
      user: user._id,
      type,
      title,
      message,
      data,
      priority
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${users.length} users successfully`,
      data: { sentCount: users.length }
    });

  } catch (error) {
    console.error("Send notification to all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending notification to all users",
      error: error.message
    });
  }
};

// Admin: Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Notification.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ["$isRead", 1, 0] }
          },
          unreadCount: {
            $sum: { $cond: ["$isRead", 0, 1] }
          }
        }
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          readCount: 1,
          unreadCount: 1,
          readRate: {
            $multiply: [
              { $divide: ["$readCount", "$count"] },
              100
            ]
          }
        }
      }
    ]);

    const totalStats = await Notification.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRead: { $sum: { $cond: ["$isRead", 1, 0] } },
          totalUnread: { $sum: { $cond: ["$isRead", 0, 1] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Notification statistics fetched successfully",
      data: {
        byType: stats,
        total: totalStats[0] || {
          totalCount: 0,
          totalRead: 0,
          totalUnread: 0
        }
      }
    });

  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notification statistics",
      error: error.message
    });
  }
};

// Create notification helper function
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};
