import express from "express";
import {
  createBlogPost,
  getBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  likeBlogPost,
  shareBlogPost,
  getFeaturedPosts,
  getBlogCategories,
  getPopularPosts,
  getBlogStats
} from "../controllers/blogController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getBlogPosts);
router.get("/featured", getFeaturedPosts);
router.get("/popular", getPopularPosts);
router.get("/categories", getBlogCategories);
router.get("/stats", getBlogStats);
router.get("/:slug", getBlogPost);
router.post("/:postId/like", likeBlogPost);
router.post("/:postId/share", shareBlogPost);

// Protected routes (authentication required)
router.use(VerifyToken);
router.post("/", createBlogPost);
router.put("/:postId", updateBlogPost);
router.delete("/:postId", deleteBlogPost);

export default router;

