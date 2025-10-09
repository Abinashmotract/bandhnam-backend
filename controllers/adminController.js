import User from "../models/User.js";
import Contact from "../models/Contact.js";
import Interaction from "../models/Interaction.js";
import UserMembership from "../models/UserMembership.js";

// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Contact.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: "Contacts retrieved successfully",
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalContacts: total,
          hasNext: skip + contacts.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
      error: error.message
    });
  }
};

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isActive, 
      plan,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }
    
    // Add plan filter
    if (plan) {
      query['membership.plan.name'] = plan;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    
    const users = await User.find(query, "-password -otp -otpExpiry")
      .populate({
        path: "membership.plan",
        select: "name price duration planType"
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNext: skip + users.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message
    });
  }
};

// Get specific user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId, "-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user's interactions
    const interactions = await Interaction.find({
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    })
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's membership status
    const membership = await UserMembership.findOne({ user: userId })
      .populate("plan", "name price duration");

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: {
        user,
        interactions,
        membership
      }
    });

  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user details",
      error: error.message
    });
  }
};

// Update user (ban, suspend, verify, etc.)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      isActive,
      isEmailVerified,
      isPhoneVerified,
      role,
      banReason,
      banExpiry,
      notes,
      profileImage
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user fields
    if (isActive !== undefined) user.isActive = isActive;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) user.isPhoneVerified = isPhoneVerified;
    if (role) user.role = role;
    if (banReason) user.banReason = banReason;
    if (banExpiry) user.banExpiry = new Date(banExpiry);
    if (notes) user.adminNotes = notes;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Soft delete - mark as inactive instead of actually deleting
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message
    });
  }
};

// Get reports
export const getReports = async (req, res) => {
  try {
    // Mock reports data for now
    const reports = [
      {
        id: 1,
        reporter: "User A",
        reported: "User B",
        reason: "Inappropriate behavior",
        status: "pending",
        createdAt: new Date()
      }
    ];
    
    res.status(200).json({
      success: true,
      message: "Reports retrieved successfully",
      data: reports
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
      error: error.message
    });
  }
};

// Resolve report
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    
    // Mock report resolution
    res.status(200).json({
      success: true,
      message: "Report resolved successfully"
    });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resolving report",
      error: error.message
    });
  }
};

// Get analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ 
      isEmailVerified: true, 
      isPhoneVerified: true 
    });
    
    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        inactiveUsers: totalUsers - activeUsers
      }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
      error: error.message
    });
  }
};

// Send system notification
export const sendSystemNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    // Mock notification sending
    res.status(200).json({
      success: true,
      message: "Notification sent successfully"
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending notification",
      error: error.message
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    // Mock additional stats
    const totalLikes = await User.aggregate([
      { $unwind: "$likes" },
      { $count: "total" }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: {
        total: {
          totalUsers,
          totalLikes: totalLikes[0]?.total || 0
        },
        thisMonth: {
          newUsers: thisMonthUsers
        }
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
      error: error.message
    });
  }
};