// routes/contactRoutes.js
import express from "express";
import { createContact, getAllContacts, updateContactStatus } from "../controllers/contactController.js";
import { VerifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.post("/create", createContact);
// Alias to support frontend posting to /api/contact
router.post("/", createContact);

// Admin-only routes (you can add isAdmin middleware later)
router.get("/", VerifyToken, getAllContacts);
router.put("/:id", VerifyToken, updateContactStatus);

export default router;
