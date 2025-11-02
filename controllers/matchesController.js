import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import mongoose from "mongoose";
import { getCoordinatesFromLocation, calculateDistance } from '../utils/geocoding.js';

// Get matches for a user
export const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = '',
      verified = false,
      nearby = false,
      justJoined = false,
      ageMin = 18,
      ageMax = 60,
      religion = '',
      caste = '',
      occupation = '',
      location = '',
      sortBy = 'recentlyJoined',
      heightMin = '',
      heightMax = '',
      maritalStatus = '',
      motherTongue = '',
      education = '',
      annualIncome = ''
    } = req.query;

    console.log('Request parameters:', { nearby, verified, justJoined });

    // Get current user's preferences and location for matching
    const currentUser = await User.findById(userId).select('preferences location gender city state coordinates');
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Build match query
    let matchQuery = {
      _id: { $ne: userId }, // Exclude current user
      isActive: true,
      profileCompletion: { $gte: 50 } // Only show profiles with decent completion
    };

    // Gender preference (opposite gender for heterosexual matches)
    if (currentUser.gender === 'male') {
      matchQuery.gender = 'female';
    } else if (currentUser.gender === 'female') {
      matchQuery.gender = 'male';
    }

    // Age filter
    const currentDate = new Date();
    const maxBirthDate = new Date(currentDate.getFullYear() - ageMin, currentDate.getMonth(), currentDate.getDate());
    const minBirthDate = new Date(currentDate.getFullYear() - ageMax, currentDate.getMonth(), currentDate.getDate());
    
    matchQuery.dob = {
      $gte: minBirthDate,
      $lte: maxBirthDate
    };

    // Additional filters
    // Note: Verified filter is applied in post-processing to check multiple verification types
    
    if (justJoined === 'true' || justJoined === true) {
      // Filter for users who joined within the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchQuery.createdAt = { $gte: sevenDaysAgo };
    }

    if (religion) {
      matchQuery.religion = religion;
    }

    if (caste) {
      matchQuery.caste = caste;
    }

    if (occupation) {
      matchQuery.occupation = { $regex: occupation, $options: 'i' };
    }

    // Location filter
    if (location) {
      if (matchQuery.$or) {
        // Merge with existing $or conditions if search is also present
        matchQuery.$or = [
          ...matchQuery.$or,
          { city: { $regex: location, $options: 'i' } },
          { state: { $regex: location, $options: 'i' } },
          { location: { $regex: location, $options: 'i' } }
        ];
      } else {
        matchQuery.$or = [
          { city: { $regex: location, $options: 'i' } },
          { state: { $regex: location, $options: 'i' } },
          { location: { $regex: location, $options: 'i' } }
        ];
      }
    }

    // Height filter
    if (heightMin || heightMax) {
      matchQuery.height = {};
      if (heightMin) matchQuery.height.$gte = heightMin;
      if (heightMax) matchQuery.height.$lte = heightMax;
    }

    // Marital Status filter
    if (maritalStatus) {
      const statusArray = maritalStatus.split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_'));
      if (statusArray.length > 0) {
        matchQuery.maritalStatus = { $in: statusArray };
      }
    }

    // Mother Tongue filter
    if (motherTongue) {
      const tongueArray = motherTongue.split(',').map(t => t.trim().toLowerCase());
      if (tongueArray.length > 0) {
        matchQuery.motherTongue = { $in: tongueArray };
      }
    }

    // Education filter
    if (education) {
      matchQuery.education = { $regex: education, $options: 'i' };
    }

    // Annual Income filter
    if (annualIncome) {
      matchQuery.annualIncome = { $regex: annualIncome, $options: 'i' };
    }

    // Search filter
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
      
      if (matchQuery.$or) {
        // Merge with existing $or conditions from location filter
        matchQuery.$or = [...matchQuery.$or, ...searchConditions];
      } else {
        matchQuery.$or = searchConditions;
      }
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case 'name':
        sortObj = { name: 1 };
        break;
      case 'recentlyJoined':
        sortObj = { createdAt: -1 };
        break;
      case 'verified':
        sortObj = { isEmailVerified: -1, createdAt: -1 };
        break;
      case 'matchScore':
        // For now, sort by profile completion
        sortObj = { profileCompletion: -1, createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Get matches with pagination
    const matches = await User.find(matchQuery)
      .select('-password -otp -otpExpiry -emailVerificationToken -phoneVerificationOTP')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination (before applying nearby filter)
    let totalMatches = await User.countDocuments(matchQuery);

    // Get user's interactions to show interest status
    const userInteractions = await Interaction.find({
      fromUser: userId,
      type: { $in: ['interest', 'super_interest'] }
    }).select('toUser type');

    // Create a map of interactions for quick lookup
    const interactionsMap = {};
    userInteractions.forEach(interaction => {
      interactionsMap[interaction.toUser.toString()] = interaction.type;
    });

    // Add interaction status and calculate match score
    const enrichedMatches = matches.map(match => {
      const age = match.dob ? 
        new Date().getFullYear() - new Date(match.dob).getFullYear() : null;
      
      // Calculate distance using coordinates or city/state
      let distance = null;
      let isNearby = false;
      
      if (match.coordinates && currentUser.coordinates) {
        // Use coordinates for precise distance calculation
        distance = calculateDistance(
          currentUser.coordinates.lat, 
          currentUser.coordinates.lng,
          match.coordinates.lat, 
          match.coordinates.lng
        );
        isNearby = distance <= 10; // Within 10km
      } else if (match.city && currentUser.city && match.state && currentUser.state) {
        // Fallback: if same city, consider nearby
        isNearby = match.city.toLowerCase() === currentUser.city.toLowerCase() && 
                   match.state.toLowerCase() === currentUser.state.toLowerCase();
        distance = isNearby ? 5 : null;
      }

      // Calculate if user joined recently (within last 7 days)
      const daysSinceJoined = (new Date() - new Date(match.createdAt)) / (1000 * 60 * 60 * 24);
      const isJustJoined = daysSinceJoined <= 7;

      // Calculate match score based on various factors
      let matchScore = 50; // Base score
      
      if (match.isEmailVerified) matchScore += 10;
      if (match.isPhoneVerified) matchScore += 10;
      if (match.isIdVerified) matchScore += 15;
      if (match.profileCompletion >= 80) matchScore += 15;
      if (match.profileCompletion >= 90) matchScore += 10;
      
      // Add some randomness for variety
      matchScore += Math.floor(Math.random() * 20);
      matchScore = Math.min(matchScore, 100);

      return {
        ...match.toObject(),
        age,
        distance: distance ? `${distance} km` : null,
        isNearby,
        isJustJoined,
        matchScore,
        hasShownInterest: interactionsMap[match._id.toString()] === 'interest',
        hasShownSuperInterest: interactionsMap[match._id.toString()] === 'super_interest'
      };
    });

    // Apply additional filters that require processing
    let filteredMatches = enrichedMatches;

    // Verified filter - check if profile has any verification
    if (verified === 'true' || verified === true) {
      filteredMatches = filteredMatches.filter(match => 
        match.isEmailVerified || 
        match.isPhoneVerified || 
        match.isIdVerified || 
        match.isPhotoVerified
      );
    }

    // Nearby filter
    if (nearby === 'true' || nearby === true) {
      console.log('Applying nearby filter. Total matches before filter:', filteredMatches.length);
      console.log('Matches with isNearby=true:', filteredMatches.filter(m => m.isNearby).length);
      filteredMatches = filteredMatches.filter(match => match.isNearby);
      console.log('Matches after nearby filter:', filteredMatches.length);
    }

    // Note: justJoined filter is now applied at database level, so no need to filter here

    // Update totalMatches count if post-processing filters were applied
    if ((nearby === 'true' || nearby === true) || (verified === 'true' || verified === true)) {
      totalMatches = filteredMatches.length;
    }

    res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      data: filteredMatches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMatches / parseInt(limit)),
        totalMatches,
        hasNext: skip + filteredMatches.length < totalMatches,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching matches",
      error: error.message
    });
  }
};

// Show interest in a profile
export const showInterest = async (req, res) => {
  try {
    const { profileId, message } = req.body;
    const fromUserId = req.user.id;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required"
      });
    }

    if (profileId === fromUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot show interest in your own profile"
      });
    }

    // Check if profile exists
    const targetProfile = await User.findById(profileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Check if interest already exists
    const existingInterest = await Interaction.findOne({
      fromUser: fromUserId,
      toUser: profileId,
      type: 'interest'
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: "Interest already shown"
      });
    }

    // Check user's interest limits
    const user = await User.findById(fromUserId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInterests = await Interaction.countDocuments({
      fromUser: fromUserId,
      type: 'interest',
      createdAt: { $gte: today }
    });

    // Check if user has premium membership for unlimited interests
    const hasUnlimitedInterests = user.membership && 
      user.membership.plan && 
      user.membership.isActive;

    if (!hasUnlimitedInterests && todayInterests >= 5) {
      return res.status(400).json({
        success: false,
        message: "Daily interest limit reached. Upgrade to premium for unlimited interests.",
        code: 'INTEREST_LIMIT_REACHED'
      });
    }

    // Create interest interaction
    const interest = new Interaction({
      fromUser: fromUserId,
      toUser: profileId,
      type: 'interest',
      status: 'sent',
      messageContent: message || null
    });

    await interest.save();

    // Also create Interest record for the Interest model used by conversations
    try {
      const Interest = (await import('../models/Interest.js')).default;
      const interestRecord = new Interest({
        fromUser: fromUserId,
        targetUser: profileId,
        type: 'interest',
        status: 'pending',
        message: message || null
      });
      await interestRecord.save();
    } catch (interestError) {
      console.error('Error creating Interest record:', interestError);
      // Don't fail the request if Interest model creation fails
    }

    // If message is provided, also create a Message record
    if (message && message.trim()) {
      const Message = (await import('../models/Message.js')).default;
      const ChatRoom = (await import('../models/ChatRoom.js')).default;
      
      try {
        // Get or create chat room
        let chatRoom = await ChatRoom.findOne({
          participants: { $all: [fromUserId, profileId] },
          isActive: true
        });

        if (!chatRoom) {
          chatRoom = await ChatRoom.create({
            participants: [fromUserId, profileId],
            isActive: true
          });
        }

        // Create message
        const messageDoc = await Message.create({
          sender: fromUserId,
          receiver: profileId,
          content: message.trim(),
          messageType: 'text'
        });

        // Update chat room
        chatRoom.lastMessage = messageDoc._id;
        chatRoom.lastMessageAt = messageDoc.createdAt;
        await chatRoom.save();
      } catch (msgError) {
        console.error('Error creating message:', msgError);
        // Don't fail the interest request if message creation fails
      }
    }

    // Update user's daily interest count
    user.dailyInterests = (user.dailyInterests || 0) + 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Interest shown successfully",
      data: {
        profileId,
        remainingInterests: hasUnlimitedInterests ? 'unlimited' : Math.max(0, 5 - todayInterests - 1)
      }
    });

  } catch (error) {
    console.error("Show interest error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while showing interest",
      error: error.message
    });
  }
};

// Show super interest in a profile
export const showSuperInterest = async (req, res) => {
  try {
    const { profileId } = req.body;
    const fromUserId = req.user.id;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required"
      });
    }

    if (profileId === fromUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot show super interest in your own profile"
      });
    }

    // Check if profile exists
    const targetProfile = await User.findById(profileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Check if super interest already exists
    const existingSuperInterest = await Interaction.findOne({
      fromUser: fromUserId,
      toUser: profileId,
      type: 'super_interest'
    });

    if (existingSuperInterest) {
      return res.status(400).json({
        success: false,
        message: "Super interest already shown"
      });
    }

    // Check user's super interest limits
    const user = await User.findById(fromUserId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySuperInterests = await Interaction.countDocuments({
      fromUser: fromUserId,
      type: 'super_interest',
      createdAt: { $gte: today }
    });

    // Check if user has premium membership for unlimited super interests
    const hasUnlimitedSuperInterests = user.membership && 
      user.membership.plan && 
      user.membership.isActive;

    if (!hasUnlimitedSuperInterests && todaySuperInterests >= 1) {
      return res.status(400).json({
        success: false,
        message: "Daily super interest limit reached. Upgrade to premium for unlimited super interests.",
        code: 'SUPER_INTEREST_LIMIT_REACHED'
      });
    }

    // Create super interest interaction
    const superInterest = new Interaction({
      fromUser: fromUserId,
      toUser: profileId,
      type: 'super_interest',
      status: 'sent'
    });

    await superInterest.save();

    // Update user's daily super interest count
    user.dailySuperInterests = (user.dailySuperInterests || 0) + 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Super interest shown successfully",
      data: {
        profileId,
        remainingSuperInterests: hasUnlimitedSuperInterests ? 'unlimited' : Math.max(0, 1 - todaySuperInterests - 1)
      }
    });

  } catch (error) {
    console.error("Show super interest error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while showing super interest",
      error: error.message
    });
  }
};

// Get user's interest limits
export const getInterestLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('membership dailyInterests dailySuperInterests');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's usage
    const todayInterests = await Interaction.countDocuments({
      fromUser: userId,
      type: 'interest',
      createdAt: { $gte: today }
    });

    const todaySuperInterests = await Interaction.countDocuments({
      fromUser: userId,
      type: 'super_interest',
      createdAt: { $gte: today }
    });

    // Check if user has premium membership
    const hasUnlimitedInterests = user.membership && 
      user.membership.plan && 
      user.membership.isActive;

    const hasUnlimitedSuperInterests = user.membership && 
      user.membership.plan && 
      user.membership.isActive;

    res.status(200).json({
      success: true,
      message: "Interest limits retrieved successfully",
      data: {
        freeInterests: hasUnlimitedInterests ? 'unlimited' : Math.max(0, 5 - todayInterests),
        freeSuperInterests: hasUnlimitedSuperInterests ? 'unlimited' : Math.max(0, 1 - todaySuperInterests),
        usedInterests: todayInterests,
        usedSuperInterests: todaySuperInterests,
        hasUnlimitedInterests,
        hasUnlimitedSuperInterests
      }
    });

  } catch (error) {
    console.error("Get interest limits error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interest limits",
      error: error.message
    });
  }
};

// Get mutual matches (profiles who also showed interest)
export const getMutualMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Get profiles that the user has shown interest in
    const userInterests = await Interaction.find({
      fromUser: userId,
      type: 'interest'
    }).select('toUser');

    const interestedProfileIds = userInterests.map(interest => interest.toUser);

    // Get profiles that have shown interest in the user
    const mutualInterests = await Interaction.find({
      toUser: userId,
      fromUser: { $in: interestedProfileIds },
      type: 'interest'
    }).populate('fromUser', '-password -otp -otpExpiry');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMatches = mutualInterests.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Mutual matches retrieved successfully",
      data: paginatedMatches.map(match => ({
        ...match.fromUser.toObject(),
        matchedAt: match.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(mutualInterests.length / parseInt(limit)),
        totalMatches: mutualInterests.length,
        hasNext: skip + paginatedMatches.length < mutualInterests.length,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get mutual matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching mutual matches",
      error: error.message
    });
  }
};

