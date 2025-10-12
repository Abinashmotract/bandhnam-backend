import express from "express";
import { getAllProfiles, getMatchedProfiles, filterProfiles, getInterestLimits } from "../controllers/profileController.js";
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/profiles
router.get("/list", VerifyToken, getAllProfiles);
router.get("/matches", VerifyToken, getMatchedProfiles);
router.get("/filter", VerifyToken, filterProfiles);
router.get("/limits", VerifyToken, getInterestLimits);

export default router;
