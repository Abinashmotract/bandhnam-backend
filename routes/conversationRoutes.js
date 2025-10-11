import express from 'express';
import { 
  getConversations, 
  getUpMatchHour, 
  getMessengerOnlineMatches 
} from '../controllers/conversationController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get conversations for different tabs
router.get('/', VerifyToken, getConversations);

// Get UP Match Hour data
router.get('/up-match-hour', VerifyToken, getUpMatchHour);

// Get online matches for messenger
router.get('/online-matches', VerifyToken, getMessengerOnlineMatches);

export default router;
