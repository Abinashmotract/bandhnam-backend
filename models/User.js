import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
    profileImage: { type: String }
}, { timestamps: true });
export default mongoose.model('User', userSchema);