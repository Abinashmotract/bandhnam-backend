import express from "express";
import {
  likeProfile,
  superLikeProfile,
  addToFavourites,
  removeFromFavourites,
  blockUser,
  unblockUser,
  reportUser,
  getInteractionHistory,
  getProfileViews,
  getFavourites
} from "../controllers/interactionController.js";
import { RequireFullVerification } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require full verification
router.use(RequireFullVerification);

// Interaction routes
router.post("/like/:userId", likeProfile);
router.post("/superlike/:userId", superLikeProfile);
router.post("/favourite/:userId", addToFavourites);
router.delete("/favourite/:userId", removeFromFavourites);
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);
router.post("/report/:userId", reportUser);

// History and lists
router.get("/history", getInteractionHistory);
router.get("/views", getProfileViews);
router.get("/favourites", getFavourites);

export default router;
