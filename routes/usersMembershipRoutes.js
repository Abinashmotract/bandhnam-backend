import express from 'express';
import {
   getAllMembershipPlans
} from '../controllers/membershipController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/getPlans', VerifyToken, getAllMembershipPlans);


export default router;