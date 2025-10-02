import express from "express";
import {
  getAllSuccessStories,
  getSuccessStoryDetails,
  approveSuccessStory,
  rejectSuccessStory,
  getSuccessStoryAnalytics
} from "../controllers/successStoriesController.js";
import { VerifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Success Stories routes
router.get("/", VerifyAdmin, getAllSuccessStories);
router.get("/:storyId", VerifyAdmin, getSuccessStoryDetails);
router.patch("/:storyId/approve", VerifyAdmin, approveSuccessStory);
router.patch("/:storyId/reject", VerifyAdmin, rejectSuccessStory);
router.get("/analytics/overview", VerifyAdmin, getSuccessStoryAnalytics);

export default router;
