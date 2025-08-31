import express from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    forgotPassword,
    verifyOtp,
    resetPassword, getUserDetails, resendOtp, updateUser, logout
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
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/logout', logout);
router.get('/user', VerifyToken, getUserDetails);
router.put('/user/update/:id', VerifyToken, upload.single('profileImage'), updateUser);


export default router;
