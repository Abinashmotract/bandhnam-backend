import express from "express";
import { getAllUsers, getAllContacts, getUserDetails, updateUser, deleteUser, getReports, resolveReport, getAnalytics, sendSystemNotification, getDashboardStats } from "../../controllers/adminController.js";
import { adminLogin } from "../controllers/adminLogin.js";
import { VerifyAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Auth
router.post("/login", adminLogin);

// Admin routes
router.get("/users", VerifyAdmin, getAllUsers);
router.get("/users/:userId", VerifyAdmin, getUserDetails);
router.patch("/users/:userId", VerifyAdmin, updateUser);
router.delete("/users/:userId", VerifyAdmin, deleteUser);
router.get("/contacts", VerifyAdmin, getAllContacts);
router.get("/reports", VerifyAdmin, getReports);
router.patch("/reports/:reportId", VerifyAdmin, resolveReport);
router.get("/analytics", VerifyAdmin, getAnalytics);
router.post("/notifications", VerifyAdmin, sendSystemNotification);
router.get("/dashboard", VerifyAdmin, getDashboardStats);

export default router;