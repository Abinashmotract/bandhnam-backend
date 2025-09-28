import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  slug: {
    type: String,
    required: true,
    unique: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  excerpt: {
    type: String,
    maxlength: 500
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Categories and tags
  category: {
    type: String,
    enum: [
      "Marriage Tips",
      "Relationship Advice", 
      "Wedding Planning",
      "Horoscope & Astrology",
      "Success Stories",
      "Cultural Traditions",
      "Lifestyle",
      "Health & Wellness",
      "Career & Finance",
      "Parenting",
      "Other"
    ],
    required: true
  },
  
  tags: [String],
  
  // Media
  featuredImage: String,
  images: [String],
  videos: [String],
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Status
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
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
  comments: {
    type: Number,
    default: 0
  },
  
  // Publishing
  publishedAt: Date,
  scheduledAt: Date,
  
  // Reading time
  readingTime: Number, // in minutes
  
  // Related content
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  }],
  
  // SEO and analytics
  seoScore: Number,
  lastAnalyzed: Date,
  
  // Comments enabled
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  
  // Social sharing
  socialShares: {
    facebook: Number,
    twitter: Number,
    linkedin: Number,
    whatsapp: Number
  }
}, {
  timestamps: true
});

// Indexes
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ isFeatured: 1, isPinned: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ author: 1 });

// Pre-save middleware to generate slug
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model("Blog", blogSchema);

