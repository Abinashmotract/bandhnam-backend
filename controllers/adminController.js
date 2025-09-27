import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Notification from "../models/Notification.js";
import MembershipPlan from "../models/MembershipPlan.js";
import UserMembership from "../models/UserMembership.js";
import Verification from "../models/Verification.js";

// Get all users with filters and pagination
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isEmailVerified,
      isPhoneVerified,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    let filters = { role: "user" };

    // Search filter
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ];
    }

    // Role filter
    if (role) {
      filters.role = role;
    }

    // Verification filters
    if (isEmailVerified !== undefined) {
      filters.isEmailVerified = isEmailVerified === "true";
    }

    if (isPhoneVerified !== undefined) {
      filters.isPhoneVerified = isPhoneVerified === "true";
    }

    // Active status filter
    if (isActive !== undefined) {
      filters.isActive = isActive === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const users = await User.find(filters, "-password -otp -otpExpiry")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filters);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const usersList = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileFor: user.profileFor,
      gender: user.gender,
      location: user.location,
      occupation: user.occupation,
      profileCompletion: user.profileCompletion,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isActive: user.isActive !== false,
      profileImage: user.profileImage ? `${baseUrl}/${user.profileImage}` : null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }));

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users: usersList,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
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
      .populate("plan", "name price duration")
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const userDetails = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileFor: user.profileFor,
      gender: user.gender,
      dob: user.dob,
      location: user.location,
      city: user.city,
      state: user.state,
      occupation: user.occupation,
      education: user.education,
      religion: user.religion,
      caste: user.caste,
      about: user.about,
      profileCompletion: user.profileCompletion,
      isEmailVerified: user.isEmailVerified || false,
      isPhoneVerified: user.isPhoneVerified || false,
      isActive: user.isActive !== false,
      profileImage: user.profileImage ? `${baseUrl}/${user.profileImage}` : null,
      photos: user.photos?.map(photo => `${baseUrl}/${photo}`) || [],
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      interactions: interactions.map(interaction => ({
        _id: interaction._id,
        type: interaction.type,
        fromUser: interaction.fromUser ? {
          _id: interaction.fromUser._id,
          name: interaction.fromUser.name,
          email: interaction.fromUser.email
        } : null,
        toUser: interaction.toUser ? {
          _id: interaction.toUser._id,
          name: interaction.toUser.name,
          email: interaction.toUser.email
        } : null,
        status: interaction.status,
        createdAt: interaction.createdAt
      })),
      membership: membership ? {
        _id: membership._id,
        plan: membership.plan,
        status: membership.status,
        startDate: membership.startDate,
        endDate: membership.endDate,
        createdAt: membership.createdAt
      } : null
    };

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: userDetails
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
      notes
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

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully"
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

// Get reported users/content
export const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    let filters = { type: "report" };
    if (status) {
      filters.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reports = await Interaction.find(filters)
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("resolvedBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Interaction.countDocuments(filters);

    const reportsList = reports.map(report => ({
      _id: report._id,
      reporter: {
        _id: report.fromUser._id,
        name: report.fromUser.name,
        email: report.fromUser.email
      },
      reportedUser: {
        _id: report.toUser._id,
        name: report.toUser.name,
        email: report.toUser.email
      },
      reportReason: report.reportReason,
      reportDescription: report.reportDescription,
      status: report.status,
      resolvedBy: report.resolvedBy ? {
        _id: report.resolvedBy._id,
        name: report.resolvedBy.name,
        email: report.resolvedBy.email
      } : null,
      resolvedAt: report.resolvedAt,
      resolutionNotes: report.resolutionNotes,
      createdAt: report.createdAt
    }));

    res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      data: {
        reports: reportsList,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
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

// Resolve a report
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, resolutionNotes } = req.body;

    if (!status || !["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'resolved' or 'dismissed'"
      });
    }

    const report = await Interaction.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    report.status = status;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    report.resolutionNotes = resolutionNotes;

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report ${status} successfully`
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

// Get platform analytics
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // User analytics
    const userStats = await User.aggregate([
      { $match: { role: "user", ...dateFilter } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
          verifiedUsers: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
          phoneVerifiedUsers: { $sum: { $cond: ["$isPhoneVerified", 1, 0] } }
        }
      }
    ]);

    // User growth over time
    const userGrowth = await User.aggregate([
      { $match: { role: "user", ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Interaction analytics
    const interactionStats = await Interaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue analytics (from memberships)
    const revenueStats = await UserMembership.aggregate([
      { $match: { ...dateFilter, status: "active" } },
      {
        $lookup: {
          from: "membershipplans",
          localField: "plan",
          foreignField: "_id",
          as: "planDetails"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $arrayElemAt: ["$planDetails.price", 0] } },
          activeSubscriptions: { $sum: 1 }
        }
      }
    ]);

    // Profile completion analytics
    const profileCompletionStats = await User.aggregate([
      { $match: { role: "user" } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$profileCompletion", 25] }, then: "0-25%" },
                { case: { $lt: ["$profileCompletion", 50] }, then: "25-50%" },
                { case: { $lt: ["$profileCompletion", 75] }, then: "50-75%" },
                { case: { $lt: ["$profileCompletion", 100] }, then: "75-99%" },
                { case: { $eq: ["$profileCompletion", 100] }, then: "100%" }
              ],
              default: "Unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      data: {
        users: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          phoneVerifiedUsers: 0
        },
        userGrowth,
        interactions: interactionStats,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          activeSubscriptions: 0
        },
        profileCompletion: profileCompletionStats
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

// Send system-wide notification
export const sendSystemNotification = async (req, res) => {
  try {
    const { title, message, type = "system", priority = "medium", targetUsers = "all" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    let userIds = [];
    if (targetUsers === "all") {
      const users = await User.find({ role: "user" }).select("_id");
      userIds = users.map(user => user._id);
    } else if (Array.isArray(targetUsers)) {
      userIds = targetUsers;
    }

    // Create notifications
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      title,
      message,
      priority,
      data: { isSystemNotification: true }
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `System notification sent to ${userIds.length} users successfully`,
      data: { sentCount: userIds.length }
    });

  } catch (error) {
    console.error("Send system notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending system notification",
      error: error.message
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const todayStats = await Promise.all([
      User.countDocuments({ role: "user", createdAt: { $gte: startOfDay } }),
      Interaction.countDocuments({ type: "like", createdAt: { $gte: startOfDay } }),
      Interaction.countDocuments({ type: "report", createdAt: { $gte: startOfDay } }),
      Notification.countDocuments({ createdAt: { $gte: startOfDay } })
    ]);

    // This week's stats
    const weekStats = await Promise.all([
      User.countDocuments({ role: "user", createdAt: { $gte: startOfWeek } }),
      Interaction.countDocuments({ type: "like", createdAt: { $gte: startOfWeek } }),
      Interaction.countDocuments({ type: "report", createdAt: { $gte: startOfWeek } })
    ]);

    // This month's stats
    const monthStats = await Promise.all([
      User.countDocuments({ role: "user", createdAt: { $gte: startOfMonth } }),
      Interaction.countDocuments({ type: "like", createdAt: { $gte: startOfMonth } }),
      Interaction.countDocuments({ type: "report", createdAt: { $gte: startOfMonth } })
    ]);

    // Total stats
    const totalStats = await Promise.all([
      User.countDocuments({ role: "user" }),
      Interaction.countDocuments({ type: "like" }),
      Interaction.countDocuments({ type: "report" }),
      UserMembership.countDocuments({ status: "active" })
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        today: {
          newUsers: todayStats[0],
          newLikes: todayStats[1],
          newReports: todayStats[2],
          newNotifications: todayStats[3]
        },
        thisWeek: {
          newUsers: weekStats[0],
          newLikes: weekStats[1],
          newReports: weekStats[2]
        },
        thisMonth: {
          newUsers: monthStats[0],
          newLikes: monthStats[1],
          newReports: monthStats[2]
        },
        total: {
          totalUsers: totalStats[0],
          totalLikes: totalStats[1],
          totalReports: totalStats[2],
          activeSubscriptions: totalStats[3]
        }
      }
    });

  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
      error: error.message
    });
  }
};
