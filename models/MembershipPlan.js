import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Basic", "Premium", "Elite"],
      unique: false
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      required: true,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly"
    },
    features: [
      {
        type: String,
        required: true
      }
    ],
    description: {
      type: String,
      default: ""
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

membershipPlanSchema.index({ name: 1, duration: 1, isActive: 1 }, { unique: true });

export default mongoose.model("MembershipPlan", membershipPlanSchema);