import mongoose from "mongoose";

const successStorySchema = new mongoose.Schema({
  // Couple details
  bride: {
    name: {
      type: String,
      required: true
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    age: Number,
    occupation: String,
    location: String,
    photo: String
  },
  
  groom: {
    name: {
      type: String,
      required: true
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    age: Number,
    occupation: String,
    location: String,
    photo: String
  },
  
  // Story details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  story: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Wedding details
  weddingDate: Date,
  weddingLocation: String,
  weddingPhotos: [String],
  
  // How they met
  howTheyMet: {
    type: String,
    enum: ["Search", "Recommendation", "Horoscope Match", "Premium Feature", "Other"]
  },
  meetingDetails: String,
  
  // Testimonial
  testimonial: {
    bride: String,
    groom: String
  },
  
  // Media
  photos: [String],
  videos: [String],
  
  // Status and verification
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "featured"],
    default: "pending"
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  featuredUntil: Date,
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Admin details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: Date,
  
  rejectionReason: String,
  
  // Privacy
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Tags for categorization
  tags: [String],
  
  // Location details
  city: String,
  state: String,
  country: String
}, {
  timestamps: true
});

// Indexes
successStorySchema.index({ status: 1, isPublic: 1 });
successStorySchema.index({ isFeatured: 1, featuredUntil: 1 });
successStorySchema.index({ views: -1 });
successStorySchema.index({ createdAt: -1 });
successStorySchema.index({ "bride.profileId": 1, "groom.profileId": 1 });

export default mongoose.model("SuccessStory", successStorySchema);
