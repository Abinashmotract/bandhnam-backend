import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Get all success stories
export const getAllSuccessStories = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = { type: 'success_story' };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const successStories = await Interaction.find(query)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Interaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: "Success stories retrieved successfully",
      data: {
        successStories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStories: total,
          hasNext: skip + successStories.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all success stories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success stories",
      error: error.message
    });
  }
};

// Get success story details
export const getSuccessStoryDetails = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const story = await Interaction.findById(storyId)
      .populate("fromUser", "name email profileImage phoneNumber")
      .populate("toUser", "name email profileImage phoneNumber");
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Success story details retrieved successfully",
      data: story
    });
  } catch (error) {
    console.error("Get success story details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success story details",
      error: error.message
    });
  }
};

// Approve success story
export const approveSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { notes } = req.body;
    
    const story = await Interaction.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }
    
    story.status = 'approved';
    story.approvalNotes = notes;
    story.approvedAt = new Date();
    story.approvedBy = req.user.id;
    
    await story.save();
    
    res.status(200).json({
      success: true,
      message: "Success story approved successfully",
      data: story
    });
  } catch (error) {
    console.error("Approve success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving success story",
      error: error.message
    });
  }
};

// Reject success story
export const rejectSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { reason, notes } = req.body;
    
    const story = await Interaction.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }
    
    story.status = 'rejected';
    story.rejectionReason = reason;
    story.approvalNotes = notes;
    story.approvedAt = new Date();
    story.approvedBy = req.user.id;
    
    await story.save();
    
    res.status(200).json({
      success: true,
      message: "Success story rejected successfully",
      data: story
    });
  } catch (error) {
    console.error("Reject success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting success story",
      error: error.message
    });
  }
};

// Get success story analytics
export const getSuccessStoryAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Success story statistics
    const storyStats = await Interaction.aggregate([
      { $match: { type: 'success_story', ...dateFilter } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly success stories
    const monthlyStories = await Interaction.aggregate([
      { $match: { type: 'success_story', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Success story analytics retrieved successfully",
      data: {
        storyStats,
        monthlyStories
      }
    });
  } catch (error) {
    console.error("Get success story analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success story analytics",
      error: error.message
    });
  }
};
