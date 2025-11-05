import express from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    forgotPassword,
    verifyOtp,
    verifyEmailOtp,
    resendVerificationOtp,
    resetPassword, getUserDetails, resendOtp, updateUser, logout,
    updateProfilePicture,
    uploadProfileImage,
    removeProfileImage
} from '../controllers/authController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/logout', logout);
router.get('/user', VerifyToken, getUserDetails);
router.put('/user/update', VerifyToken, upload.fields([{ name: 'photos', maxCount: 10 }]), updateUser);
router.put('/user/profile-picture', VerifyToken, upload.single('profileImage'), updateProfilePicture);
router.post('/user/upload-profile-image', VerifyToken, upload.single('profileImage'), uploadProfileImage);
router.delete('/user/remove-profile-image', VerifyToken, removeProfileImage);

export default router;
