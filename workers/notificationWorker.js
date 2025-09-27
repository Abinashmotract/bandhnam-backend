import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Process push notifications
export const processPushNotifications = async () => {
  try {
    console.log("Processing push notifications...");

    // Get pending push notifications
    const notifications = await Notification.find({
      pushSent: false,
      type: { $in: ["like", "superlike", "match", "message", "visit"] }
    }).populate("user", "name fcmToken");

    for (const notification of notifications) {
      try {
        if (notification.user && notification.user.fcmToken) {
          await sendPushNotification(notification);
          
          // Mark as sent
          notification.pushSent = true;
          notification.pushSentAt = new Date();
          await notification.save();

          console.log(`Push notification sent for notification ${notification._id}`);
        }
      } catch (error) {
        console.error(`Error sending push notification for notification ${notification._id}:`, error);
      }
    }

    console.log(`Processed ${notifications.length} push notifications`);
  } catch (error) {
    console.error("Error processing push notifications:", error);
  }
};

// Send push notification (mock implementation - integrate with FCM)
const sendPushNotification = async (notification) => {
  const { user, type, title, message, data } = notification;

  // Mock FCM payload
  const payload = {
    to: user.fcmToken,
    notification: {
      title,
      body: message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      sound: "default"
    },
    data: {
      type,
      ...data
    }
  };

  // In a real implementation, you would send this to FCM
  console.log("Sending push notification:", payload);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Process SMS notifications
export const processSmsNotifications = async () => {
  try {
    console.log("Processing SMS notifications...");

    // Get pending SMS notifications
    const notifications = await Notification.find({
      smsSent: false,
      type: { $in: ["verification", "urgent"] },
      priority: { $in: ["high", "urgent"] }
    }).populate("user", "name phoneNumber");

    for (const notification of notifications) {
      try {
        if (notification.user && notification.user.phoneNumber) {
          await sendSmsNotification(notification);
          
          // Mark as sent
          notification.smsSent = true;
          notification.smsSentAt = new Date();
          await notification.save();

          console.log(`SMS sent for notification ${notification._id}`);
        }
      } catch (error) {
        console.error(`Error sending SMS for notification ${notification._id}:`, error);
      }
    }

    console.log(`Processed ${notifications.length} SMS notifications`);
  } catch (error) {
    console.error("Error processing SMS notifications:", error);
  }
};

// Send SMS notification (mock implementation - integrate with SMS provider)
const sendSmsNotification = async (notification) => {
  const { user, title, message } = notification;

  // Mock SMS payload
  const smsPayload = {
    to: user.phoneNumber,
    message: `${title}: ${message}`,
    from: "BANDHNAM"
  };

  // In a real implementation, you would send this to SMS provider (Twilio, etc.)
  console.log("Sending SMS:", smsPayload);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
};

// Process match suggestions
export const processMatchSuggestions = async () => {
  try {
    console.log("Processing match suggestions...");

    // Get users who haven't received match suggestions recently
    const users = await User.find({
      role: "user",
      lastMatchSuggestionSent: {
        $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      }
    }).limit(100); // Process in batches

    for (const user of users) {
      try {
        const suggestions = await generateMatchSuggestions(user);
        
        if (suggestions.length > 0) {
          // Create notification for match suggestions
          await Notification.create({
            user: user._id,
            type: "match_suggestion",
            title: "New Match Suggestions",
            message: `We found ${suggestions.length} new profiles that might interest you!`,
            data: { suggestionsCount: suggestions.length }
          });

          // Update last match suggestion sent time
          user.lastMatchSuggestionSent = new Date();
          await user.save();

          console.log(`Match suggestions sent to ${user.email}`);
        }
      } catch (error) {
        console.error(`Error generating match suggestions for ${user.email}:`, error);
      }
    }

    console.log(`Processed match suggestions for ${users.length} users`);
  } catch (error) {
    console.error("Error processing match suggestions:", error);
  }
};

// Generate match suggestions for a user
const generateMatchSuggestions = async (user) => {
  if (!user.preferences) {
    return [];
  }

  // Build match criteria based on user preferences
  let filters = { _id: { $ne: user._id }, role: "user" };

  // Age filter
  if (user.preferences.ageRange) {
    const currentYear = new Date().getFullYear();
    filters.dob = {};
    if (user.preferences.ageRange.min) {
      filters.dob.$lte = new Date(`${currentYear - user.preferences.ageRange.min}-12-31`);
    }
    if (user.preferences.ageRange.max) {
      filters.dob.$gte = new Date(`${currentYear - user.preferences.ageRange.max}-01-01`);
    }
  }

  // Other preference filters
  if (user.preferences.religion) {
    filters.religion = user.preferences.religion;
  }
  if (user.preferences.caste) {
    filters.caste = user.preferences.caste;
  }
  if (user.preferences.education) {
    filters.education = user.preferences.education;
  }
  if (user.preferences.location) {
    filters.location = user.preferences.location;
  }

  // Exclude already interacted users
  const interactions = await require("../models/Interaction.js").default.find({
    fromUser: user._id,
    type: { $in: ["like", "superlike", "block"] }
  }).select("toUser");

  const excludedUserIds = interactions.map(interaction => interaction.toUser);
  if (excludedUserIds.length > 0) {
    filters._id = { $nin: excludedUserIds };
  }

  // Get potential matches
  const suggestions = await User.find(filters, "name profileImage location occupation")
    .limit(5)
    .sort({ profileCompletion: -1, createdAt: -1 });

  return suggestions;
};

// Clean up old notifications
export const cleanupOldNotifications = async () => {
  try {
    console.log("Cleaning up old notifications...");

    // Delete notifications older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      type: { $in: ["like", "visit", "profile_view"] }
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
  }
};

// Process notification preferences
export const processNotificationPreferences = async () => {
  try {
    console.log("Processing notification preferences...");

    // Get users who have notification preferences set
    const users = await User.find({
      role: "user",
      notificationPreferences: { $exists: true }
    });

    for (const user of users) {
      try {
        const preferences = user.notificationPreferences;
        
        // Update notification sending based on preferences
        if (preferences.email === false) {
          await Notification.updateMany(
            { user: user._id, emailSent: false },
            { $set: { emailSent: true, emailSentAt: new Date() } }
          );
        }

        if (preferences.push === false) {
          await Notification.updateMany(
            { user: user._id, pushSent: false },
            { $set: { pushSent: true, pushSentAt: new Date() } }
          );
        }

        if (preferences.sms === false) {
          await Notification.updateMany(
            { user: user._id, smsSent: false },
            { $set: { smsSent: true, smsSentAt: new Date() } }
          );
        }

      } catch (error) {
        console.error(`Error processing notification preferences for ${user.email}:`, error);
      }
    }

    console.log(`Processed notification preferences for ${users.length} users`);
  } catch (error) {
    console.error("Error processing notification preferences:", error);
  }
};
