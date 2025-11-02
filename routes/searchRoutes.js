import express from 'express';
import { 
  getSearchCriteria, 
  searchByCriteria, 
  searchByProfileId 
} from '../controllers/searchController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get search criteria options
router.get('/criteria', VerifyToken, getSearchCriteria);

// Search profiles by criteria
router.post('/by-criteria', VerifyToken, searchByCriteria);

// Search by profile ID
router.get('/by-profile-id/:profileId', VerifyToken, searchByProfileId);

export default router;