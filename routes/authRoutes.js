import express from 'express';
import {
    signup,
    login,
    refreshAccessToken,
    forgotPassword,
    verifyOtp,
    resetPassword, getUserDetailsById
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
// router.get('/users', protect, getUserDetailsById);
router.get('/user', protect, getUserDetailsById);

export default router;
