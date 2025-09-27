import express from "express";
import {
  searchProfiles,
  getRecommendations,
  saveSearchFilter,
  getSavedFilters,
  deleteSavedFilter
} from "../controllers/searchController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(VerifyToken);

// Search and filtering routes
router.get("/", searchProfiles);
router.get("/recommendations", getRecommendations);
router.post("/save", saveSearchFilter);
router.get("/saved", getSavedFilters);
router.delete("/saved/:filterId", deleteSavedFilter);

export default router;
