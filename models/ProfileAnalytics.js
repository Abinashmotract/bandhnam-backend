import mongoose from "mongoose";

const profileAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  
  // Profile views
  totalViews: {
    type: Number,
    default: 0
  },
  
  uniqueViews: {
    type: Number,
    default: 0
  },
  
  viewsByDay: [{
    date: Date,
    count: Number
  }],
  
  viewsByWeek: [{
    week: String,
    count: Number
  }],
  
  viewsByMonth: [{
    month: String,
    count: Number
  }],
  
  // Profile interactions
  totalLikes: {
    type: Number,
    default: 0
  },
  
  totalSuperLikes: {
    type: Number,
    default: 0
  },
  
  totalFavourites: {
    type: Number,
    default: 0
  },
  
  totalVisits: {
    type: Number,
    default: 0
  },
  
  // Search appearances
  searchAppearances: {
    type: Number,
    default: 0
  },
  
  searchAppearancesByFilter: [{
    filterType: String,
    count: Number
  }],
  
  // Match statistics
  totalMatches: {
    type: Number,
    default: 0
  },
  
  mutualLikes: {
    type: Number,
    default: 0
  },
  
  // Profile completion impact
  profileCompletionImpact: {
    beforeCompletion: Number,
    afterCompletion: Number,
    improvement: Number
  },
  
  // Photo analytics
  photoViews: [{
    photoUrl: String,
    views: Number
  }],
  
  mostViewedPhoto: String,
  
  // Interest analytics
  interestsPerformance: [{
    interest: String,
    views: Number,
    likes: Number
  }],
  
  // Location analytics
  viewsByLocation: [{
    location: String,
    count: Number
  }],
  
  // Age group analytics
  viewsByAgeGroup: [{
    ageGroup: String,
    count: Number
  }],
  
  // Gender analytics
  viewsByGender: {
    male: Number,
    female: Number,
    other: Number
  },
  
  // Time-based analytics
  peakViewingHours: [Number],
  peakViewingDays: [String],
  
  // Response rates
  likeResponseRate: Number,
  messageResponseRate: Number,
  
  // Profile quality score
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Recommendations
  recommendationScore: Number,
  
  // Premium features usage
  premiumFeatureUsage: {
    advancedSearch: Number,
    horoscopeMatch: Number,
    priorityListing: Number,
    profileBoost: Number
  },
  
  // Last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Analytics period
  analyticsPeriod: {
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes
profileAnalyticsSchema.index({ user: 1 });
profileAnalyticsSchema.index({ totalViews: -1 });
profileAnalyticsSchema.index({ qualityScore: -1 });
profileAnalyticsSchema.index({ lastUpdated: -1 });

export default mongoose.model("ProfileAnalytics", profileAnalyticsSchema);
