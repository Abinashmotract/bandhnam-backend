import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Get all matches and connections
export const getAllMatches = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    let query = { type: { $in: ['like', 'interest', 'shortlist'] } };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const matches = await Interaction.find(query)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Interaction.countDocuments(query);
    
    // Get match statistics
    const stats = await Interaction.aggregate([
      { $match: { type: { $in: ['like', 'interest', 'shortlist'] } } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      data: {
        matches,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMatches: total,
          hasNext: skip + matches.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching matches",
      error: error.message
    });
  }
};

// Get match details
export const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await Interaction.findById(matchId)
      .populate("fromUser", "name email profileImage phoneNumber dob location")
      .populate("toUser", "name email profileImage phoneNumber dob location");
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Match details retrieved successfully",
      data: match
    });
  } catch (error) {
    console.error("Get match details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching match details",
      error: error.message
    });
  }
};

// Update match status
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;
    
    const match = await Interaction.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found"
      });
    }
    
    match.status = status;
    await match.save();
    
    res.status(200).json({
      success: true,
      message: "Match status updated successfully",
      data: match
    });
  } catch (error) {
    console.error("Update match status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating match status",
      error: error.message
    });
  }
};

// Get match analytics
export const getMatchAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Match statistics
    const matchStats = await Interaction.aggregate([
      { $match: { type: { $in: ['like', 'interest', 'shortlist'] }, ...dateFilter } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Daily match trends
    const dailyTrends = await Interaction.aggregate([
      { $match: { type: { $in: ['like', 'interest', 'shortlist'] }, ...dateFilter } },
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
    
    res.status(200).json({
      success: true,
      message: "Match analytics retrieved successfully",
      data: {
        matchStats,
        dailyTrends
      }
    });
  } catch (error) {
    console.error("Get match analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching match analytics",
      error: error.message
    });
  }
};
