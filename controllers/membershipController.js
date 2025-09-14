import MembershipPlan from '../models/MembershipPlan.js';
import User from "../models/User.js";

// Create a new membership plan
// Create a new membership plan
export const createMembershipPlan = async (req, res) => {
  try {
    const { name, price, duration, features, description } = req.body;
    
    // Validate required fields
    if (!name || !price || !features || !Array.isArray(features)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Name, price, and features array are required",
      });
    }

    // Check if plan already exists
    const existingPlan = await MembershipPlan.findOne({ 
      name, 
      duration,
      isActive: true 
    });
    
    if (existingPlan) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: `${name} plan for ${duration} duration already exists`,
      });
    }

    const newPlan = new MembershipPlan({
      name,
      price,
      duration,
      features,
      description,
      createdBy: req.user.id || req.user._id // This should now work with the proper auth middleware
    });

    await newPlan.save();

    return res.status(201).json({
      status: 201,
      success: true,
      message: "Membership plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error creating membership plan:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all membership plans with filtering
export const getAllMembershipPlans = async (req, res) => {
  try {
    const { activeOnly = 'true', duration } = req.query;
    
    const filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }
    if (duration) {
      filter.duration = duration;
    }

    const plans = await MembershipPlan.find(filter)
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Membership plans fetched successfully",
      totalPlans: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Error fetching membership plans:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get a specific membership plan
export const getMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await MembershipPlan.findById(id)
      .populate('createdBy', 'name email');

    if (!plan) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Membership plan not found",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Membership plan fetched successfully",
      plan,
    });
  } catch (error) {
    console.error("Error fetching membership plan:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update a membership plan
export const updateMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, features, description, isActive, order } = req.body;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Membership plan not found",
      });
    }

    // Check for conflicts if activating a plan
    if (isActive === true) {
      const conflictingPlan = await MembershipPlan.findOne({
        _id: { $ne: id },
        name: plan.name,
        duration: plan.duration,
        isActive: true
      });
      
      if (conflictingPlan) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: `Another active ${plan.name} plan for ${plan.duration} duration already exists`,
        });
      }
    }

    if (price !== undefined) plan.price = price;
    if (features !== undefined) plan.features = features;
    if (description !== undefined) plan.description = description;
    if (isActive !== undefined) plan.isActive = isActive;
    if (order !== undefined) plan.order = order;

    await plan.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Membership plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating membership plan:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete a membership plan (soft delete)
export const deleteMembershipPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Membership plan not found",
      });
    }

    // Check if this is a default plan that shouldn't be deleted
    if (plan.isDefault) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Cannot delete default membership plan",
      });
    }

    // Soft delete by setting isActive to false
    plan.isActive = false;
    await plan.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Membership plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting membership plan:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Assign membership to user
export const assignUserMembership = async (req, res) => {
  try {
    const { userId, planName, duration = 'yearly', notes } = req.body;

    // Validate input
    if (!userId || !planName) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "User ID and plan name are required",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    // Find active plan
    const plan = await MembershipPlan.findOne({ 
      name: planName, 
      duration,
      isActive: true 
    });
    
    if (!plan) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `${planName} plan for ${duration} duration not found or inactive`,
      });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    switch (duration) {
      case 'monthly':
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case 'quarterly':
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case 'yearly':
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
    }

    // Update user membership
    user.currentMembership = planName;
    user.membershipExpiry = expiryDate;
    user.membershipStatus = 'active';
    
    // Add to membership history
    user.membershipHistory.push({
      planName,
      price: plan.price,
      duration,
      purchasedAt: new Date(),
      expiresAt: expiryDate,
      assignedBy: req.user.id,
      transactionId: `ADMIN-${Date.now()}-${userId}`,
      notes: notes || `Assigned by admin ${req.user.name}`
    });

    await user.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: `${planName} membership assigned to user successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentMembership: user.currentMembership,
        membershipExpiry: user.membershipExpiry,
        membershipStatus: user.membershipStatus
      }
    });
  } catch (error) {
    console.error("Error assigning membership:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get user membership details
export const getUserMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name email phoneNumber currentMembership membershipExpiry membershipStatus membershipHistory')
      .populate('membershipHistory.assignedBy', 'name email');

    if (!user) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      success: true,
      message: "User membership details fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user membership:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all users with a specific membership
export const getUsersByMembership = async (req, res) => {
  try {
    const { planName, status } = req.query;
    
    const filter = {};
    if (planName) {
      filter.currentMembership = planName;
    }
    if (status) {
      filter.membershipStatus = status;
    }

    const users = await User.find(filter)
      .select('name email phoneNumber currentMembership membershipExpiry membershipStatus')
      .sort({ membershipExpiry: 1 });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users by membership:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};