import express from "express";
import {
  getMatches,
  showInterest,
  showSuperInterest,
  getInterestLimits,
  getMutualMatches,
  requestPhoto,
} from "../controllers/matchesController.js";
import {
  addToShortlist,
  removeFromShortlist,
  getShortlistedProfiles,
  checkShortlistStatus,
  clearShortlist,
} from "../controllers/shortlistController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Matches routes
router.get("/", VerifyToken, getMatches);
router.get("/mutual", VerifyToken, getMutualMatches);
router.post("/interest", VerifyToken, showInterest);
router.post("/super-interest", VerifyToken, showSuperInterest);
router.post("/request-photo", VerifyToken, requestPhoto);
router.get("/limits", VerifyToken, getInterestLimits);

// shortlist routes

router.post("/shortlist", VerifyToken, addToShortlist);
router.delete("/shortlist", VerifyToken, removeFromShortlist);
router.get("/shortlist", VerifyToken, getShortlistedProfiles);
router.get("/shortlist/status/:id", VerifyToken, checkShortlistStatus);
router.delete("/shortlist/clear", VerifyToken, clearShortlist);

export default router;
