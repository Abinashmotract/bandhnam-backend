import express from "express";
import { getAllUsers, getAllContacts } from "../controllers/adminController.js";
import { 
  createMembershipPlan, 
  getAllMembershipPlans,
  getMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  assignUserMembership, 
  getUserMembership,
  getUsersByMembership
} from "../../controllers/membershipController.js";
import { adminLogin } from "../controllers/adminLogin.js";
import { VerifyAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Auth
router.post("/login", adminLogin);

// Admin routes
router.get("/users", VerifyAdmin, getAllUsers);
router.get("/contacts", VerifyAdmin, getAllContacts);

// Membership routes
router.post("/membership/plans", VerifyAdmin, createMembershipPlan);
router.get("/membership/plans", VerifyAdmin, getAllMembershipPlans);
router.get("/membership/plans/:id", VerifyAdmin, getMembershipPlan);
router.put("/membership/plans/:id", VerifyAdmin, updateMembershipPlan);
router.delete("/membership/plans/:id", VerifyAdmin, deleteMembershipPlan);

router.post("/membership/assign", VerifyAdmin, assignUserMembership);
router.get("/membership/user/:userId", VerifyAdmin, getUserMembership);
router.get("/membership/users", VerifyAdmin, getUsersByMembership);

export default router;