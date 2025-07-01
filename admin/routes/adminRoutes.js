import express from 'express';
import { authMiddleware, checkRole } from '../../middlewares/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Admin routes
router.get('/users', authMiddleware, checkRole(['admin']), adminController.getAllUsers);
router.get('/vendors', authMiddleware, checkRole(['admin']), adminController.getAllVendors);
router.post('/users/:id/role', authMiddleware, checkRole(['admin']), adminController.updateUserRole);

// Vendor routes
router.get('/vendor/users', authMiddleware, checkRole(['vendor']), adminController.getVendorUsers);
router.get('/vendor/profile', authMiddleware, checkRole(['vendor']), adminController.getVendorProfile);

export default router; 