import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * @desc    Add a profile to user's shortlist
 * @route   POST /api/users/shortlist/:userId
 * @access  Private
 */
export const addToShortlist = async (req, res) => {
  try {
    const { profileId } = req.body; // ID of the user to be shortlisted
    const currentUserId = req.user._id; // ID of the current user (from auth middleware)

    // Check if user exists
    const userToShortlist = await User.findById(profileId);
    if (!userToShortlist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent users from shortlisting themselves
    if (profileId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot shortlist your own profile",
      });
    }

    // Find current user with shortlists
    const currentUser = await User.findById(currentUserId);

    // Check if already shortlisted
    if (currentUser.shortlists.some(shortlist => shortlist.userId?.toString() === profileId)) {
      return res.status(400).json({
        success: false,
        message: "Profile is already in your shortlist",
      });
    }

    // Add to shortlist with timestamp
    await User.findByIdAndUpdate(
      currentUserId,
      {
        $push: {
          shortlists: {
            userId: profileId,
            shortlistedAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile added to shortlist successfully",
      data: {
        shortlistedUser: {
          _id: userToShortlist._id,
          name: userToShortlist.name,
          profileImage: userToShortlist.profileImage,
          age: userToShortlist.dob ? calculateAge(userToShortlist.dob) : null,
          occupation: userToShortlist.occupation,
          location: userToShortlist.location
        }
      }
    });

  } catch (error) {
    console.error("Add to shortlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a profile from user's shortlist
 * @route   DELETE /api/users/shortlist/:userId
 * @access  Private
 */
export const removeFromShortlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Remove from shortlist
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: {
          shortlists: { userId: userId }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile removed from shortlist successfully",
    });

  } catch (error) {
    console.error("Remove from shortlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's shortlisted profiles with details
 * @route   GET /api/users/shortlist
 * @access  Private
 */
export const getShortlistedProfiles = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get user with populated shortlists
    const user = await User.findById(currentUserId)
      .populate({
        path: 'shortlists.userId',
        select: 'name profileImage dob occupation location education religion caste maritalStatus photos isOnline lastSeen profileCompletion customId',
        match: { isActive: true } // Only include active users
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out any null users (deleted accounts) and format response
    const shortlistedProfiles = user.shortlists
      .filter(shortlist => shortlist.userId) // Remove deleted users
      .map(shortlist => ({
        _id: shortlist.userId._id,
        customId: shortlist.userId.customId,
        name: shortlist.userId.name,
        profileImage: shortlist.userId.profileImage,
        age: shortlist.userId.dob ? calculateAge(shortlist.userId.dob) : null,
        occupation: shortlist.userId.occupation,
        education: shortlist.userId.education,
        location: shortlist.userId.location,
        religion: shortlist.userId.religion,
        caste: shortlist.userId.caste,
        maritalStatus: shortlist.userId.maritalStatus,
        isOnline: shortlist.userId.isOnline,
        lastSeen: shortlist.userId.lastSeen,
        profileCompletion: shortlist.userId.profileCompletion,
        photos: shortlist.userId.photos,
        shortlistedAt: shortlist.shortlistedAt
      }))
      .sort((a, b) => new Date(b.shortlistedAt) - new Date(a.shortlistedAt)); // Sort by most recent

    res.status(200).json({
      success: true,
      data: {
        shortlistedProfiles,
        count: shortlistedProfiles.length
      }
    });

  } catch (error) {
    console.error("Get shortlisted profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Check if a profile is in user's shortlist
 * @route   GET /api/users/shortlist/check/:userId
 * @access  Private
 */
export const checkShortlistStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId);
    
    const isShortlisted = user.shortlists.some(
      shortlist => shortlist.userId?.toString() === userId
    );

    res.status(200).json({
      success: true,
      data: {
        isShortlisted,
        shortlistedAt: isShortlisted 
          ? user.shortlists.find(s => s.userId?.toString() === userId).shortlistedAt 
          : null
      }
    });

  } catch (error) {
    console.error("Check shortlist status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Clear all shortlisted profiles
 * @route   DELETE /api/users/shortlist
 * @access  Private
 */
export const clearShortlist = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    await User.findByIdAndUpdate(
      currentUserId,
      {
        $set: { shortlists: [] }
      }
    );

    res.status(200).json({
      success: true,
      message: "All shortlisted profiles cleared successfully",
    });

  } catch (error) {
    console.error("Clear shortlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to calculate age from date of birth
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}