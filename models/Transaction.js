import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
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
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMembership",
    required: true
  },
  // Stripe payment details
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeChargeId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "cancelled", "refunded"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    default: "card"
  },
  // Transaction metadata
  description: {
    type: String,
    required: true
  },
  receiptUrl: {
    type: String
  },
  // Email tracking
  invoiceSent: {
    type: Boolean,
    default: false
  },
  invoiceSentAt: {
    type: Date
  },
  // Refund details
  refunded: {
    type: Boolean,
    default: false
  },
  refundedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ paymentIntentId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model("Transaction", transactionSchema);
