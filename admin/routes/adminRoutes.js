import express from "express";
import { getAllUsers, getAllContacts } from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminLogin.js";
import { VerifyAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Auth
router.post("/login", adminLogin);

// Admin routes
router.get("/users", VerifyAdmin, getAllUsers);
router.get("/contacts", VerifyAdmin, getAllContacts);


export default router;