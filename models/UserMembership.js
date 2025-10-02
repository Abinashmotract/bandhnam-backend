import mongoose from "mongoose";

const userMembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipPlan",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentIntentId: {
    type: String,
    required: function() {
      return this.plan && this.plan.planType === 'paid';
    }
  },
  // Usage tracking
  profileViewsUsed: {
    type: Number,
    default: 0
  },
  interestsUsed: {
    type: Number,
    default: 0
  },
  shortlistsUsed: {
    type: Number,
    default: 0
  },
  contactViewsUsed: {
    type: Number,
    default: 0
  },
  // Cancellation
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
userMembershipSchema.index({ user: 1, isActive: 1 });
userMembershipSchema.index({ plan: 1 });
userMembershipSchema.index({ endDate: 1 });

// Ensure only one active subscription per user
userMembershipSchema.index({ user: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model("UserMembership", userMembershipSchema);