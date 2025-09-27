import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  // Basic horoscope details
  dateOfBirth: {
    type: Date,
    required: true
  },
  timeOfBirth: {
    type: String,
    required: true
  },
  placeOfBirth: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Astrological details
  sunSign: {
    type: String,
    enum: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
  },
  moonSign: String,
  risingSign: String,
  
  // Nakshatra details
  nakshatra: String,
  nakshatraLord: String,
  nakshatraPada: Number,
  
  // Planetary positions
  planetaryPositions: {
    sun: String,
    moon: String,
    mars: String,
    mercury: String,
    jupiter: String,
    venus: String,
    saturn: String,
    rahu: String,
    ketu: String
  },
  
  // Compatibility factors
  compatibilityFactors: {
    manglik: {
      type: Boolean,
      default: false
    },
    mangalDosha: {
      type: String,
      enum: ["None", "Mild", "Moderate", "Strong"]
    },
    nadi: String,
    gana: String,
    yoni: String,
    varna: String,
    vashya: String,
    tara: String,
    yoniCompatibility: Number,
    ganaCompatibility: Number,
    nadiCompatibility: Number
  },
  
  // Overall compatibility score
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Horoscope file
  horoscopeFile: String,
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  verifiedAt: Date,
  
  // Privacy settings
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Additional details
  remarks: String,
  astrologerNotes: String
}, {
  timestamps: true
});

// Indexes for efficient queries
horoscopeSchema.index({ user: 1 });
horoscopeSchema.index({ sunSign: 1 });
horoscopeSchema.index({ nakshatra: 1 });
horoscopeSchema.index({ "compatibilityFactors.manglik": 1 });
horoscopeSchema.index({ overallScore: -1 });

export default mongoose.model("Horoscope", horoscopeSchema);
