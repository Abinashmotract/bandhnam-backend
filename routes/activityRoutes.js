import express from "express";
import {
  getActivityDashboard,
  getOnlineMatches,
  getShortlistedProfiles,
  getInterestsReceived,
  getActivitySummary,
  getInterestsSent,
  acceptInterest,
  declineInterest,
} from "../controllers/activityController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get activity dashboard data
router.get("/dashboard", VerifyToken, getActivityDashboard);

// Get online matches
router.get("/online-matches", VerifyToken, getOnlineMatches);
router.get("/shortlisted", VerifyToken, getShortlistedProfiles);
router.get("/interests/received", VerifyToken, getInterestsReceived);
router.get("/interests/sent", VerifyToken, getInterestsSent);

// Accept/Decline interests (using Interaction model IDs)
router.post("/interests/:interestId/approved", VerifyToken, acceptInterest);
router.post("/interests/:interestId/decline", VerifyToken, declineInterest);

// Get activity summary
router.get("/summary", VerifyToken, getActivitySummary);

export default router;
