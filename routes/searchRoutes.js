import express from 'express';
import { 
  getSearchCriteria, 
  searchByCriteria, 
  searchByProfileId,
  saveSearchFilterHandler,
  getSavedSearches,
  getSavedSearch,
  deleteSavedSearch 
} from '../controllers/searchController.js';
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get search criteria options
router.get('/criteria', VerifyToken, getSearchCriteria);

// Search profiles by criteria
router.post('/by-criteria', VerifyToken, searchByCriteria);

// Search by profile ID
router.get('/by-profile-id/:profileId', VerifyToken, searchByProfileId);

// Save search filter
router.post('/save-filter', VerifyToken, saveSearchFilterHandler);

// Get saved searches
router.get('/saved-searches', VerifyToken, getSavedSearches);

// Get saved search
router.get('/saved-search/:id', VerifyToken, getSavedSearch);

// Delete saved search
router.delete('/saved-search/:id', VerifyToken, deleteSavedSearch);

export default router;