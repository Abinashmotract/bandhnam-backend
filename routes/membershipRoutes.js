import express from 'express';
import {
    getMemberships,
    getUserMembership,
    purchaseMembership,
    cancelMembership,
    createMembership,
    updateMembership
} from '../controllers/membershipController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Public routes
router.get('/plans', getMemberships);

// Protected routes
router.get('/my-membership', VerifyToken, getUserMembership);
router.post('/purchase', VerifyToken, purchaseMembership);
router.post('/cancel', VerifyToken, cancelMembership);

// Admin routes
router.post('/admin/create', VerifyToken, isAdmin, createMembership);
router.put('/admin/update/:id', VerifyToken, isAdmin, updateMembership);

export default router;