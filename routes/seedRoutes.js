import express from "express";
import { createSampleProfiles, getSampleProfilesCount } from "../controllers/seedController.js";

const router = express.Router();

// Seed data routes
router.post("/profiles", createSampleProfiles);
router.get("/profiles/count", getSampleProfilesCount);

export default router;
