import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Get all verification requests
export const getAllVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    let query = { type: 'verification' };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.verificationType = type;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const verifications = await Interaction.find(query)
      .populate("fromUser", "name email profileImage phoneNumber")
      .populate("toUser", "name email profileImage phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Interaction.countDocuments(query);
    
    // Get verification statistics
    const stats = await Interaction.aggregate([
      { $match: { type: 'verification' } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Verifications retrieved successfully",
      data: {
        verifications,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalVerifications: total,
          hasNext: skip + verifications.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error("Get all verifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verifications",
      error: error.message
    });
  }
};

// Approve verification
export const approveVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { verificationType, notes } = req.body;
    
    const verification = await Interaction.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }
    
    verification.status = 'approved';
    verification.verificationNotes = notes;
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user.id;
    
    await verification.save();
    
    // Update user verification status
    const user = await User.findById(verification.fromUser);
    if (user) {
      if (verificationType === 'email') {
        user.isEmailVerified = true;
      } else if (verificationType === 'phone') {
        user.isPhoneVerified = true;
      } else if (verificationType === 'id') {
        user.isIdVerified = true;
      } else if (verificationType === 'photo') {
        user.isPhotoVerified = true;
      }
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Verification approved successfully",
      data: verification
    });
  } catch (error) {
    console.error("Approve verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving verification",
      error: error.message
    });
  }
};

// Reject verification
export const rejectVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reason, notes } = req.body;
    
    const verification = await Interaction.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }
    
    verification.status = 'rejected';
    verification.rejectionReason = reason;
    verification.verificationNotes = notes;
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user.id;
    
    await verification.save();
    
    res.status(200).json({
      success: true,
      message: "Verification rejected successfully",
      data: verification
    });
  } catch (error) {
    console.error("Reject verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting verification",
      error: error.message
    });
  }
};

// Get verification analytics
export const getVerificationAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Verification statistics
    const verificationStats = await Interaction.aggregate([
      { $match: { type: 'verification', ...dateFilter } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Verification type statistics
    const typeStats = await Interaction.aggregate([
      { $match: { type: 'verification', ...dateFilter } },
      {
        $group: {
          _id: "$verificationType",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: "Verification analytics retrieved successfully",
      data: {
        verificationStats,
        typeStats
      }
    });
  } catch (error) {
    console.error("Get verification analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verification analytics",
      error: error.message
    });
  }
};