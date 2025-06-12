import express from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    forgotPassword,
    verifyOtp,
    resetPassword, getUserDetailsById, resendOtp, updateUser
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.put('/user/update/:id', upload.single('profileImage'), updateUser);
// router.get('/users', protect, getUserDetailsById);
router.get('/user', protect, getUserDetailsById);

export default router;
