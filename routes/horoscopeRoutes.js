import express from "express";
import {
  addHoroscope,
  getHoroscope,
  updateHoroscope,
  calculateCompatibility,
  getHoroscopeMatches
} from "../controllers/horoscopeController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(VerifyToken);

// Horoscope routes
router.post("/", addHoroscope);
router.get("/", getHoroscope);
router.put("/", updateHoroscope);
router.get("/matches", getHoroscopeMatches);
router.get("/compatibility/:userId1/:userId2", calculateCompatibility);

export default router;
