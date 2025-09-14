// models/MembershipPlan.js
import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Basic", "Premium", "Elite"],
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      default: "yearly",
      enum: ["monthly", "quarterly", "yearly"],
    },
    features: [{
      type: String,
      required: true
    }],
    description: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    //   required: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Prevent duplicate active plans with same name and duration
membershipPlanSchema.index({ name: 1, duration: 1, isActive: 1 }, { unique: true });

export default mongoose.model("MembershipPlan", membershipPlanSchema);