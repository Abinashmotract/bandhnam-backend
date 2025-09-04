import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     phoneNumber: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     profileFor: {
//         type: String,
//         required: true,
//         enum: ['self', 'son', 'daughter', 'brother', 'sister', 'relative', 'friend']
//     },
//     gender: {
//         type: String,
//         required: function () {
//             return this.profileFor === 'self' || this.profileFor === 'relative' || this.profileFor === 'friend';
//         },
//         enum: ['male', 'female', 'other']
//     },
//     dob: { type: Date },
//     occupation: { type: String },
//     location: { type: String },
//     otp: { type: String },
//     otpExpiry: { type: Date },
//     isOtpVerified: { type: Boolean, default: false },
//     profileImage: { type: String },
//     agreeToTerms: { type: Boolean, default: false }
// }, { timestamps: true });
// export default mongoose.model('User', userSchema);

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
        height: {
            min: { type: Number },
            max: { type: Number }
        },
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

/**
 * Fields that contribute to profile completion
 */
const completionFields = [
    "name", "email", "phoneNumber", "profileFor", "gender", "dob",
    "occupation", "location", "education", "motherTongue", "religion",
    "caste", "about", "photos"
];

/**
 * Calculate profile completion
 */
function calculateProfileCompletion(user) {
    let completion = 0;

    completionFields.forEach((field) => {
        if (field === "photos") {
            if (user.photos && user.photos.length > 0) completion++;
        } else if (user[field]) {
            completion++;
        }
    });

    return Math.round((completion / completionFields.length) * 100);
}

// Pre-save hook
userSchema.pre("save", function (next) {
    this.profileCompletion = calculateProfileCompletion(this);
    next();
});

// Expose helper (can be used in controllers too)
userSchema.methods.calculateProfileCompletion = function () {
    return calculateProfileCompletion(this);
};

export default mongoose.model("User", userSchema);
