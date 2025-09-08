// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileFor: {
        type: String,
        required: true,
        enum: ['self', 'son', 'daughter', 'brother', 'sister', 'relative', 'friend']
    },
    gender: {
        type: String,
        required: function () {
            return ['self', 'relative', 'friend'].includes(this.profileFor);
        },
        enum: ['male', 'female', 'other']
    },
    dob: Date,
    occupation: String,
    location: String,
    education: String,
    motherTongue: String,
    religion: String,
    caste: String,
    about: String,
    interests: [String],
    photos: [String],
    preferences: {
        ageRange: {
            min: { type: Number, default: 25 },
            max: { type: Number, default: 35 }
        },
        height: String,
        maritalStatus: String,
        religion: String,
        education: String,
        profession: String,
        location: String,
        diet: String
    },
    profileCompletion: { type: Number, default: 0 },
    otp: String,
    otpExpiry: Date,
    isOtpVerified: { type: Boolean, default: false },
    profileImage: String,
    agreeToTerms: { type: Boolean, default: false }
}, { timestamps: true });

// Fields that contribute to profile completion with their weights
const completionFields = [
    { field: "name", weight: 10 },
    { field: "email", weight: 5 },
    { field: "phoneNumber", weight: 5 },
    { field: "profileFor", weight: 5 },
    { field: "gender", weight: 5 },
    { field: "dob", weight: 5 },
    { field: "occupation", weight: 8 },
    { field: "location", weight: 8 },
    { field: "education", weight: 8 },
    { field: "motherTongue", weight: 5 },
    { field: "religion", weight: 5 },
    { field: "caste", weight: 5 },
    { field: "about", weight: 8 },
    { field: "interests", weight: 5, check: (user) => user.interests && user.interests.length > 0 },
    { field: "photos", weight: 8, check: (user) => user.photos && user.photos.length > 0 },
    { field: "profileImage", weight: 10, check: (user) => !!user.profileImage }
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

export default mongoose.model("User", userSchema);