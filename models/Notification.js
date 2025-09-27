import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: [
      "like", "superlike", "favourite", "match", "message", "visit",
      "profile_view", "verification", "subscription", "system", "admin"
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // For push notifications
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: Date,
  // For email notifications
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  // For SMS notifications
  smsSent: {
    type: Boolean,
    default: false
  },
  smsSentAt: Date,
  // Notification priority
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  // Expiry for notifications
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Notification", notificationSchema);
