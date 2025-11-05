import mongoose from "mongoose";
import { generateUserIdMiddleware } from "../middlewares/generateCustomId.js";

const userSchema = new mongoose.Schema(
  {
    // Step 1: Basic Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    customId: { type: String, unique: true, sparse: true }, // Jeevansathi-style ID like TYXX0117
    profileFor: {
      type: String,
      required: true,
      enum: [
        "self",
        "son",
        "daughter",
        "brother",
        "sister",
        "relative",
        "friend",
      ],
    },
    gender: {
      type: String,
      required: function () {
        return ["self", "relative", "friend"].includes(this.profileFor);
      },
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    dob: Date,
    state: String,
    city: String,
    location: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },

    // Step 2: Religious & Cultural Background
    religion: String,
    caste: String,
    subCaste: String,
    motherTongue: [String],
    maritalStatus: {
      type: String,
      enum: ["never_married", "divorced", "widow", "widower"],
    },

    // Step 3: Professional Information
    highestQualification: String,
    fieldOfStudy: String,
    occupation: String,
    industry: String,
    annualIncome: String,
    education: String, // keeping old field

    // Step 4: Personal Details
    height: String,
    weight: String,
    bodyType: String,
    complexion: String,
    diet: String,
    drinkingHabits: String,
    smokingHabits: String,
    fitnessLevel: String,
    hobbies: [String],
    interests: [String], // keeping old field
    languagesKnown: [String],
    petPreferences: String,

    // Step 5: Partner Expectations
    preferences: {
      ageRange: {
        min: { type: Number, default: 25 },
        max: { type: Number, default: 35 },
      },
      height: String, // old
      heightRange: {
        type: {
          min: String,
          max: String,
        },
        required: false,
        default: undefined,
      }, // new
      maritalStatus: String, // old
      religion: String, // old
      education: String, // old
      profession: String, // old
      location: String, // old
      diet: String, // old
      qualities: [String],
      dealBreakers: [String],
      educationPref: String,
      occupationPref: [String],
      annualIncomePref: String,
      lifestyleExpectations: {
        type: {
          diet: String,
          drinking: String,
          smoking: String,
        },
        required: false,
        default: undefined,
      },
      religionCastePref: String,
      locationPref: String,
      relocation: String,
      familyOrientation: String,
      maritalStatusPref: String,
    },

    // Step 6: Family Background
    fatherOccupation: String,
    motherOccupation: String,
    brothers: Number,
    brothersMarried: Number,
    sisters: Number,
    sistersMarried: Number,
    familyType: String,
    familyIncome: String,
    nativePlace: String,
    familyStatus: String,

    // Common fields (already in schema)
    about: String,
    photos: [String],
    profileImage: String,
    agreeToTerms: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    otp: String,
    otpExpiry: Date,
    isOtpVerified: { type: Boolean, default: false },
    // Verification flags
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isIdVerified: { type: Boolean, default: false },
    isPhotoVerified: { type: Boolean, default: false },

    // Online status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Phone verification
    phoneVerificationOTP: String,
    phoneVerificationExpires: Date,

    // ID verification
    idVerification: {
      documentType: String,
      documentNumber: String,
      frontImage: String,
      backImage: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectionReason: String,
    },

    // Photo verification
    photoVerification: {
      photos: [String],
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectionReason: String,
    },

    profileCompletion: { type: Number, default: 0 },

    // Account status
    isActive: { type: Boolean, default: true },
    banReason: String,
    banExpiry: Date,
    adminNotes: String,

    // Membership information
    membership: {
      plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MembershipPlan",
      },
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: false },
    },

    // Interaction data
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shortlists: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        shortlistedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Profile Completion Weights
const completionFields = [
  { field: "name", weight: 10 },
  { field: "email", weight: 5 },
  { field: "phoneNumber", weight: 5 },
  { field: "profileFor", weight: 5 },
  { field: "gender", weight: 5 },
  { field: "dob", weight: 5 },
  { field: "occupation", weight: 8 },
  { field: "location", weight: 8 },
  { field: "state", weight: 3 },
  { field: "city", weight: 3 },
  { field: "education", weight: 5 },
  { field: "highestQualification", weight: 5 },
  { field: "fieldOfStudy", weight: 5 },
  { field: "industry", weight: 5 },
  { field: "annualIncome", weight: 5 },
  { field: "motherTongue", weight: 5 },
  { field: "religion", weight: 5 },
  { field: "caste", weight: 5 },
  { field: "about", weight: 8 },
  { field: "maritalStatus", weight: 5 },
  { field: "height", weight: 5 },
  { field: "weight", weight: 3 },
  { field: "bodyType", weight: 3 },
  { field: "complexion", weight: 3 },
  { field: "diet", weight: 3 },
  { field: "drinkingHabits", weight: 3 },
  { field: "smokingHabits", weight: 3 },
  { field: "fitnessLevel", weight: 3 },
  { field: "languagesKnown", weight: 3 },
  { field: "petPreferences", weight: 2 },
  { field: "familyType", weight: 3 },
  { field: "familyIncome", weight: 3 },
  { field: "nativePlace", weight: 3 },
  { field: "familyStatus", weight: 3 },
  { field: "fatherOccupation", weight: 3 },
  { field: "motherOccupation", weight: 3 },
  {
    field: "interests",
    weight: 5,
    check: (user) => user.interests && user.interests.length > 0,
  },
  {
    field: "hobbies",
    weight: 5,
    check: (user) => user.hobbies && user.hobbies.length > 0,
  },
  {
    field: "photos",
    weight: 8,
    check: (user) => user.photos && user.photos.length > 0,
  },
  {
    field: "profileImage",
    weight: 10,
    check: (user) => !!user.profileImage,
  },
];

/**
 * Calculate profile completion percentage
 */
userSchema.methods.calculateProfileCompletion = function () {
  let totalWeight = 0;
  let completedWeight = 0;

  completionFields.forEach(({ field, weight, check }) => {
    totalWeight += weight;

    if (check) {
      if (check(this)) {
        completedWeight += weight;
      }
    } else if (this[field]) {
      completedWeight += weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};

// Pre-save hook to update profile completion
userSchema.pre("save", function (next) {
  this.profileCompletion = this.calculateProfileCompletion();
  next();
});

// Add middleware to generate custom ID before saving
userSchema.pre("save", generateUserIdMiddleware);

export default mongoose.model("User", userSchema);
