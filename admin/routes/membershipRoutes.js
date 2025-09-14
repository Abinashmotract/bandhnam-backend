import express from "express";
import { 
  createMembershipPlan, 
  getAllMembershipPlans,
  updateMembershipPlan,
  deleteMembershipPlan
} from "../controllers/membershipController.js";

const router = express.Router();

router.post("/add", createMembershipPlan);
router.get("/get", getAllMembershipPlans);
router.put("/update/:id", updateMembershipPlan);
router.delete("/delete/:id", deleteMembershipPlan);

export default router;
