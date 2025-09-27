import mongoose from "mongoose";

const searchFilterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  filters: {
    ageRange: {
      min: Number,
      max: Number
    },
    heightRange: {
      min: String,
      max: String
    },
    gender: [String],
    religion: [String],
    caste: [String],
    education: [String],
    occupation: [String],
    location: [String],
    maritalStatus: [String],
    incomeRange: {
      min: String,
      max: String
    },
    // Geolocation filters
    locationRadius: Number, // in kilometers
    latitude: Number,
    longitude: Number,
    // Additional filters
    diet: [String],
    drinkingHabits: [String],
    smokingHabits: [String],
    fitnessLevel: [String],
    bodyType: [String],
    complexion: [String],
    languages: [String],
    // Family filters
    familyType: [String],
    familyIncome: [String],
    // Professional filters
    industry: [String],
    fieldOfStudy: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
searchFilterSchema.index({ user: 1, isActive: 1 });
searchFilterSchema.index({ lastUsed: -1 });

export default mongoose.model("SearchFilter", searchFilterSchema);
