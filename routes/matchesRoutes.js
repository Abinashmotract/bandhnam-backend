import express from "express";
import {
  getMatches,
  showInterest,
  showSuperInterest,
  getInterestLimits,
  getMutualMatches
} from "../controllers/matchesController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Matches routes
router.get("/", VerifyToken, getMatches);
router.get("/mutual", VerifyToken, getMutualMatches);
router.post("/interest", VerifyToken, showInterest);
router.post("/super-interest", VerifyToken, showSuperInterest);
router.get("/limits", VerifyToken, getInterestLimits);

export default router;