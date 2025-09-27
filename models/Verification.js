import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["email", "phone", "id", "photo"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected", "expired"],
    default: "pending"
  },
  // For email verification
  emailToken: String,
  emailTokenExpiry: Date,
  
  // For phone verification
  phoneOtp: String,
  phoneOtpExpiry: Date,
  
  // For ID verification
  idDocument: {
    frontImage: String,
    backImage: String,
    documentType: {
      type: String,
      enum: ["aadhar", "passport", "driving_license", "pan_card"]
    },
    documentNumber: String
  },
  
  // For photo verification
  verificationPhotos: [String],
  
  // Admin review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: Date,
  rejectionReason: String,
  adminNotes: String,
  
  // Verification metadata
  verificationData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
verificationSchema.index({ user: 1, type: 1 });
verificationSchema.index({ emailToken: 1 });
verificationSchema.index({ phoneOtp: 1 });
verificationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Verification", verificationSchema);
