import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import UserMembership from "../models/UserMembership.js";

// Get comprehensive analytics
export const getComprehensiveAnalytics = async (req, res) => {
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
          phoneVerifiedUsers: { $sum: { $cond: ["$isPhoneVerified", 1, 0] } },
          idVerifiedUsers: { $sum: { $cond: ["$isIdVerified", 1, 0] } },
          photoVerifiedUsers: { $sum: { $cond: ["$isPhotoVerified", 1, 0] } }
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
      { $match: { ...dateFilter } },
      {
        $lookup: {
          from: "membershipplans",
          localField: "plan",
          foreignField: "_id",
          as: "planDetails"
        }
      },
      {
        $unwind: "$planDetails"
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$planDetails.price" },
          activeSubscriptions: { $sum: 1 }
        }
      }
    ]);
    
    // Gender distribution
    const genderDistribution = await User.aggregate([
      { $match: { role: "user", ...dateFilter } },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Age distribution
    const ageDistribution = await User.aggregate([
      { $match: { role: "user", dob: { $exists: true }, ...dateFilter } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$dob"] },
                31557600000 // milliseconds in a year
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 25, 30, 35, 40, 45, 50, 100],
          default: "50+",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        userStats: userStats[0] || {},
        userGrowth,
        interactionStats,
        revenueStats: revenueStats[0] || {},
        genderDistribution,
        ageDistribution
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

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", isActive: true });
    const thisMonthUsers = await User.countDocuments({
      role: "user",
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    const totalLikes = await Interaction.countDocuments({ type: "like" });
    const totalInterests = await Interaction.countDocuments({ type: "interest" });
    const totalMessages = await Interaction.countDocuments({ type: "message" });
    
    // Get premium users
    const premiumUsers = await UserMembership.countDocuments({ isActive: true });
    
    res.status(200).json({
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: {
        total: {
          totalUsers,
          totalLikes,
          totalInterests,
          totalMessages,
          premiumUsers
        },
        thisMonth: {
          newUsers: thisMonthUsers
        },
        activeUsers
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

// Generate reports
export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    let reportData = {};
    
    switch (reportType) {
      case 'user_activity':
        reportData = await generateUserActivityReport(dateFilter);
        break;
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter);
        break;
      case 'matches':
        reportData = await generateMatchesReport(dateFilter);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type"
        });
    }
    
    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: reportData
    });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating report",
      error: error.message
    });
  }
};

// Helper function to generate user activity report
const generateUserActivityReport = async (dateFilter) => {
  const userActivity = await User.aggregate([
    { $match: { role: "user", ...dateFilter } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        newUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  return { userActivity };
};

// Helper function to generate revenue report
const generateRevenueReport = async (dateFilter) => {
  const revenue = await UserMembership.aggregate([
    { $match: { ...dateFilter } },
    {
      $lookup: {
        from: "membershipplans",
        localField: "plan",
        foreignField: "_id",
        as: "planDetails"
      }
    },
    {
      $unwind: "$planDetails"
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalRevenue: { $sum: "$planDetails.price" },
        subscriptions: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  return { revenue };
};

// Helper function to generate matches report
const generateMatchesReport = async (dateFilter) => {
  const matches = await Interaction.aggregate([
    { $match: { type: { $in: ["like", "interest", "shortlist"] }, ...dateFilter } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalMatches: { $sum: 1 },
        likes: { $sum: { $cond: [{ $eq: ["$type", "like"] }, 1, 0] } },
        interests: { $sum: { $cond: [{ $eq: ["$type", "interest"] }, 1, 0] } },
        shortlists: { $sum: { $cond: [{ $eq: ["$type", "shortlist"] }, 1, 0] } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  
  return { matches };
};