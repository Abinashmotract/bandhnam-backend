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
            return this.profileFor === 'self' || this.profileFor === 'relative' || this.profileFor === 'friend';
        },
        enum: ['male', 'female', 'other']
    },
    dob: { type: Date },
    occupation: { type: String },
    location: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
    profileImage: { type: String },
    agreeToTerms: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);