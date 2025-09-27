import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["like", "superlike", "favourite", "block", "report", "visit"],
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "resolved"],
    default: "active"
  },
  // For reports
  reportReason: {
    type: String,
    enum: ["inappropriate_content", "fake_profile", "harassment", "spam", "other"],
    required: function() {
      return this.type === "report";
    }
  },
  reportDescription: {
    type: String,
    required: function() {
      return this.type === "report";
    }
  },
  // For admin resolution
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  resolvedAt: Date,
  resolutionNotes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate interactions
interactionSchema.index({ fromUser: 1, toUser: 1, type: 1 }, { unique: true });

// Index for efficient queries
interactionSchema.index({ toUser: 1, type: 1, status: 1 });
interactionSchema.index({ fromUser: 1, type: 1 });

export default mongoose.model("Interaction", interactionSchema);
