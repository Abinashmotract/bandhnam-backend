import express from "express";
import {
  getAllMatches,
  getMatchDetails,
  updateMatchStatus,
  getMatchAnalytics
} from "../controllers/matchesController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Matches & Connections routes
router.get("/", VerifyAdmin, getAllMatches);
router.get("/:matchId", VerifyAdmin, getMatchDetails);
router.patch("/:matchId/status", VerifyAdmin, updateMatchStatus);
router.get("/analytics/overview", VerifyAdmin, getMatchAnalytics);

export default router;
