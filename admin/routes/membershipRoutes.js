import express from "express";
import { 
  createMembershipPlan, 
  getAllMembershipPlans,
  updateMembershipPlan,
  deleteMembershipPlan
} from "../controllers/membershipController.js";
import { VerifyAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add", VerifyAdmin, createMembershipPlan);
router.get("/get", VerifyAdmin, getAllMembershipPlans);
router.put("/update/:id", VerifyAdmin, updateMembershipPlan);
router.delete("/delete/:id", VerifyAdmin, deleteMembershipPlan);

export default router;
