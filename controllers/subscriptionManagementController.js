import MembershipPlan from '../models/MembershipPlan.js';

// Get all subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const { search, duration, isActive, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add duration filter
    if (duration && duration !== 'all') {
      query.duration = duration;
    }
    
    // Add status filter
    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'active' || isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const plans = await MembershipPlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MembershipPlan.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: "Subscription plans retrieved successfully",
      data: plans,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPlans: total,
        hasNext: skip + plans.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all plans error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plans",
      error: error.message
    });
  }
};

// Get single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Plan retrieved successfully",
      data: plan
    });
  } catch (error) {
    console.error('Get plan by ID error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plan",
      error: error.message
    });
  }
};

// Create new subscription plan
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      price,
      duration,
      features,
      description,
      isPopular,
      isActive,
      planType,
      profileViews,
      interests,
      shortlists,
      contactViews
    } = req.body;
    
    // Validate required fields
    if (!name || !duration) {
      return res.status(400).json({
        success: false,
        message: "Name and duration are required"
      });
    }
    
    // Check if plan with same name and duration already exists
    const existingPlan = await MembershipPlan.findOne({ 
      name, 
      duration,
      isActive: true 
    });
    
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "A plan with this name and duration already exists"
      });
    }
    
    const planData = {
      name,
      price: planType === 'free' ? 0 : price,
      duration,
      features: features || [],
      description: description || '',
      isPopular: isPopular || false,
      isActive: isActive !== undefined ? isActive : true,
      planType: planType || 'paid',
      profileViews: profileViews || 0,
      interests: interests || 0,
      shortlists: shortlists || 0,
      contactViews: contactViews || 0
    };
    
    const newPlan = new MembershipPlan(planData);
    await newPlan.save();
    
    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: newPlan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while creating plan",
      error: error.message
    });
  }
};

// Update subscription plan
export const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;
    
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }
    
    // Check if updating name and duration would create a duplicate
    if (updateData.name && updateData.duration) {
      const existingPlan = await MembershipPlan.findOne({
        _id: { $ne: planId },
        name: updateData.name,
        duration: updateData.duration,
        isActive: true
      });
      
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: "A plan with this name and duration already exists"
        });
      }
    }
    
    // Update plan
    const updatedPlan = await MembershipPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: updatedPlan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while updating plan",
      error: error.message
    });
  }
};

// Delete subscription plan
export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }
    
    // Soft delete - just deactivate the plan
    plan.isActive = false;
    await plan.save();
    
    res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully"
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting plan",
      error: error.message
    });
  }
};

// Toggle plan status
export const togglePlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    const { isActive } = req.body;
    
    const plan = await MembershipPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }
    
    plan.isActive = isActive;
    await plan.save();
    
    res.status(200).json({
      success: true,
      message: `Plan ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: plan
    });
  } catch (error) {
    console.error('Toggle plan status error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while updating plan status",
      error: error.message
    });
  }
};

// Get plan statistics
export const getPlanStatistics = async (req, res) => {
  try {
    const totalPlans = await MembershipPlan.countDocuments();
    const activePlans = await MembershipPlan.countDocuments({ isActive: true });
    const freePlans = await MembershipPlan.countDocuments({ planType: 'free' });
    const paidPlans = await MembershipPlan.countDocuments({ planType: 'paid' });
    const popularPlans = await MembershipPlan.countDocuments({ isPopular: true });
    
    const plansByDuration = await MembershipPlan.aggregate([
      {
        $group: {
          _id: '$duration',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Plan statistics retrieved successfully",
      data: {
        totalPlans,
        activePlans,
        inactivePlans: totalPlans - activePlans,
        freePlans,
        paidPlans,
        popularPlans,
        plansByDuration
      }
    });
  } catch (error) {
    console.error('Get plan statistics error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plan statistics",
      error: error.message
    });
  }
};