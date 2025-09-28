import express from "express";
import {
  createSuccessStory,
  getSuccessStories,
  getSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  likeSuccessStory,
  shareSuccessStory,
  getFeaturedStories,
  getSuccessStoryStats
} from "../controllers/successStoryController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getSuccessStories);
router.get("/featured", getFeaturedStories);
router.get("/stats", getSuccessStoryStats);
router.get("/:storyId", getSuccessStory);
router.post("/:storyId/like", likeSuccessStory);
router.post("/:storyId/share", shareSuccessStory);

// Protected routes (authentication required)
router.use(VerifyToken);
router.post("/", createSuccessStory);
router.put("/:storyId", updateSuccessStory);
router.delete("/:storyId", deleteSuccessStory);

export default router;

