import express from "express";
import { getAllProfiles } from "../controllers/profileController.js";
import { VerifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/profiles
router.get("/list", VerifyToken, getAllProfiles);

export default router;
