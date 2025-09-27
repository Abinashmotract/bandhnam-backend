import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For group chats (future feature)
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupDescription: String,
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // Typing indicators
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message counts for each user
  messageCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  }]
}, {
  timestamps: true
});

// Ensure only 2 participants for direct messages
chatRoomSchema.pre('save', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    return next(new Error('Direct chat rooms must have exactly 2 participants'));
  }
  next();
});

// Indexes
chatRoomSchema.index({ participants: 1, isActive: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });
chatRoomSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model("ChatRoom", chatRoomSchema);
