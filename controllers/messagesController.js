import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Get all messages and chats
export const getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    let query = { type: 'message' };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await Interaction.find(query)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Interaction.countDocuments(query);
    
    // Get message statistics
    const stats = await Interaction.aggregate([
      { $match: { type: 'message' } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalMessages: total,
          hasNext: skip + messages.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
      error: error.message
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    const conversation = await Interaction.find({
      type: 'message',
      $or: [
        { fromUser: userId1, toUser: userId2 },
        { fromUser: userId2, toUser: userId1 }
      ]
    })
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      data: conversation
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching conversation",
      error: error.message
    });
  }
};

// Send system message
export const sendSystemMessage = async (req, res) => {
  try {
    const { toUser, message, type = 'system' } = req.body;
    
    const systemMessage = new Interaction({
      fromUser: null, // System message
      toUser,
      type: 'message',
      messageContent: message,
      messageType: type,
      status: 'sent'
    });
    
    await systemMessage.save();
    
    res.status(200).json({
      success: true,
      message: "System message sent successfully",
      data: systemMessage
    });
  } catch (error) {
    console.error("Send system message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending system message",
      error: error.message
    });
  }
};

// Get message analytics
export const getMessageAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Message statistics
    const messageStats = await Interaction.aggregate([
      { $match: { type: 'message', ...dateFilter } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Daily message trends
    const dailyTrends = await Interaction.aggregate([
      { $match: { type: 'message', ...dateFilter } },
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
      message: "Message analytics retrieved successfully",
      data: {
        messageStats,
        dailyTrends
      }
    });
  } catch (error) {
    console.error("Get message analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching message analytics",
      error: error.message
    });
  }
};
