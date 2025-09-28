import express from 'express';
import {
   getAllMembershipPlans
} from '../controllers/membershipController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: list plans
router.get('/plans', getAllMembershipPlans);

// Protected: placeholder routes to match frontend
router.post('/subscribe', VerifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Subscription initiated (stub).', data: { redirectUrl: '/payment-success' } });
});

router.get('/status', VerifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Subscription status', data: null });
});

router.post('/cancel', VerifyToken, (req, res) => {
  res.status(200).json({ success: true, message: 'Subscription cancelled (stub).' });
});

export default router;