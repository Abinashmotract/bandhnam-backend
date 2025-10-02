import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Basic", "Entry", "Advanced", "Premium", "Elite"],
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
    },
    planType: {
      type: String,
      enum: ["free", "paid"],
      default: "paid"
    },
    profileViews: {
      type: Number,
      default: 0
    },
    interests: {
      type: Number,
      default: 0
    },
    shortlists: {
      type: Number,
      default: 0
    },
    contactViews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

membershipPlanSchema.index({ name: 1, duration: 1, isActive: 1 }, { unique: true });

export default mongoose.model("MembershipPlan", membershipPlanSchema);