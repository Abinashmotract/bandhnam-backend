import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import {
  getCoordinatesFromLocation,
  calculateDistance,
} from "../utils/geocoding.js";

// Get matches for a user
export const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = "",
      verified = false,
      nearby = false,
      justJoined = false,
      ageMin = 18,
      ageMax = 60,
      religion = "",
      caste = "",
      occupation = "",
      location = "",
      sortBy = "recentlyJoined",
      heightMin = "",
      heightMax = "",
      maritalStatus = "",
      motherTongue = "",
      education = "",
      annualIncome = "",
    } = req.query;

    console.log("Request parameters:", { nearby, verified, justJoined });

    // Get current user's preferences and location for matching
    const currentUser = await User.findById(userId).select(
      "preferences location gender city state coordinates dob height maritalStatus religion motherTongue caste occupation annualIncome"
    );
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build match query
    let matchQuery = {
      _id: { $ne: userId }, // Exclude current user
      isActive: true,
      profileCompletion: { $gte: 50 }, // Only show profiles with decent completion
    };

    // Gender preference (opposite gender for heterosexual matches)
    if (currentUser.gender === "male") {
      matchQuery.gender = "female";
    } else if (currentUser.gender === "female") {
      matchQuery.gender = "male";
    }

    // Age filter
    const currentDate = new Date();
    const maxBirthDate = new Date(
      currentDate.getFullYear() - ageMin,
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const minBirthDate = new Date(
      currentDate.getFullYear() - ageMax,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    matchQuery.dob = {
      $gte: minBirthDate,
      $lte: maxBirthDate,
    };

    // Additional filters
    if (justJoined === "true" || justJoined === true) {
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
      matchQuery.occupation = { $regex: occupation, $options: "i" };
    }

    // Location filter
    if (location) {
      if (matchQuery.$or) {
        matchQuery.$or = [
          ...matchQuery.$or,
          { city: { $regex: location, $options: "i" } },
          { state: { $regex: location, $options: "i" } },
          { location: { $regex: location, $options: "i" } },
        ];
      } else {
        matchQuery.$or = [
          { city: { $regex: location, $options: "i" } },
          { state: { $regex: location, $options: "i" } },
          { location: { $regex: location, $options: "i" } },
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
      const statusArray = maritalStatus
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"));
      if (statusArray.length > 0) {
        matchQuery.maritalStatus = { $in: statusArray };
      }
    }

    // Mother Tongue filter
    if (motherTongue) {
      const tongueArray = motherTongue
        .split(",")
        .map((t) => t.trim().toLowerCase());
      if (tongueArray.length > 0) {
        matchQuery.motherTongue = { $in: tongueArray };
      }
    }

    // Education filter
    if (education) {
      matchQuery.education = { $regex: education, $options: "i" };
    }

    // Annual Income filter
    if (annualIncome) {
      matchQuery.annualIncome = { $regex: annualIncome, $options: "i" };
    }

    // Search filter
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { occupation: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];

      if (matchQuery.$or) {
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
      case "name":
        sortObj = { name: 1 };
        break;
      case "recentlyJoined":
        sortObj = { createdAt: -1 };
        break;
      case "verified":
        sortObj = { isEmailVerified: -1, createdAt: -1 };
        break;
      case "matchScore":
        sortObj = { profileCompletion: -1, createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Get matches with pagination
    const matches = await User.find(matchQuery)
      .select(
        "-password -otp -otpExpiry -emailVerificationToken -phoneVerificationOTP"
      )
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    let totalMatches = await User.countDocuments(matchQuery);

    // Get user's interactions to show interest status
    const userInteractions = await Interaction.find({
      fromUser: userId,
      type: { $in: ["interest", "super_interest"] },
    }).select("toUser type");

    // Create a map of interactions for quick lookup
    const interactionsMap = {};
    userInteractions.forEach((interaction) => {
      interactionsMap[interaction.toUser.toString()] = interaction.type;
    });

    // Helper function to calculate age from DOB
    const calculateAge = (dob) => {
      if (!dob) return null;
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    // Helper function to format height
    const formatHeight = (height) => {
      if (!height) return "Not specified";
      // If height is in format like "5ft_4in", convert to "5'4""
      if (height.includes("ft")) {
        return height.replace("ft_", "'").replace("in", '"').replace("_", "");
      }
      return height;
    };

    // Helper function to format text
    const formatText = (text) => {
      if (!text) return "Not specified";
      return text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Helper function to check if value matches preference
    const checkMatch = (userPrefValue, matchValue) => {
      if (!userPrefValue || !matchValue) return null; // Can't determine match

      // Normalize values for comparison
      const normalizeValue = (val) => {
        if (Array.isArray(val))
          return val.map((v) => String(v).toLowerCase().trim());
        return String(val).toLowerCase().trim();
      };

      const prefVal = normalizeValue(userPrefValue);
      const actualVal = normalizeValue(matchValue);

      // For arrays (like mother tongue, occupation)
      if (Array.isArray(prefVal) && Array.isArray(actualVal)) {
        return prefVal.some((pv) => actualVal.includes(pv));
      }
      if (Array.isArray(prefVal)) {
        return prefVal.includes(actualVal);
      }
      if (Array.isArray(actualVal)) {
        return actualVal.includes(prefVal);
      }

      return prefVal === actualVal;
    };

    // Helper function to check height range match
    const checkHeightMatch = (prefHeightRange, actualHeight) => {
      if (!prefHeightRange || !actualHeight) return null;

      const heightToInches = (height) => {
        if (!height) return null;
        const match = height.match(/(\d+)(?:ft|')?[_\s]*(\d+)?(?:in|")?/i);
        if (match) {
          const feet = parseInt(match[1]) || 0;
          const inches = parseInt(match[2]) || 0;
          return feet * 12 + inches;
        }
        return null;
      };

      const actualInches = heightToInches(actualHeight);
      if (!actualInches) return null;

      const minInches = prefHeightRange.min
        ? heightToInches(prefHeightRange.min)
        : null;
      const maxInches = prefHeightRange.max
        ? heightToInches(prefHeightRange.max)
        : null;

      if (minInches && actualInches < minInches) return false;
      if (maxInches && actualInches > maxInches) return false;

      return true;
    };

    // Helper function to check age range match
    const checkAgeMatch = (prefAgeRange, actualAge) => {
      if (!prefAgeRange || actualAge === null) return null;

      const min = prefAgeRange.min || 18;
      const max = prefAgeRange.max || 60;

      return actualAge >= min && actualAge <= max;
    };

    // Calculate current user's age for matching
    const currentUserAge = calculateAge(currentUser.dob);

    // Add interaction status and calculate preference matching
    const enrichedMatches = matches.map((match) => {
      const matchAge = calculateAge(match.dob);

      // Calculate distance using coordinates or city/state
      let distance = null;
      let isNearby = false;

      if (match.coordinates && currentUser.coordinates) {
        distance = calculateDistance(
          currentUser.coordinates.lat,
          currentUser.coordinates.lng,
          match.coordinates.lat,
          match.coordinates.lng
        );
        isNearby = distance <= 10;
      } else if (
        match.city &&
        currentUser.city &&
        match.state &&
        currentUser.state
      ) {
        isNearby =
          match.city.toLowerCase() === currentUser.city.toLowerCase() &&
          match.state.toLowerCase() === currentUser.state.toLowerCase();
        distance = isNearby ? 5 : null;
      }

      // Calculate if user joined recently
      const daysSinceJoined =
        (new Date() - new Date(match.createdAt)) / (1000 * 60 * 60 * 24);
      const isJustJoined = daysSinceJoined <= 7;

      // Build preference matching array
      const preferenceMatching = [];

      // 1. Height matching
      const userPrefHeight = currentUser.preferences?.heightRange || {
        min: currentUser.preferences?.height,
        max: currentUser.preferences?.height,
      };
      const heightMatch = checkHeightMatch(userPrefHeight, match.height);
      preferenceMatching.push({
        label: "Height",
        match: heightMatch,
        userValue: formatHeight(currentUser.height),
        matchValue: formatHeight(match.height),
        userPreference:
          userPrefHeight.min || userPrefHeight.max
            ? `${formatHeight(userPrefHeight.min)} - ${formatHeight(
                userPrefHeight.max
              )}`
            : "Any",
      });

      // 2. Age matching
      const ageMatch = checkAgeMatch(
        currentUser.preferences?.ageRange,
        matchAge
      );
      preferenceMatching.push({
        label: "Age",
        match: ageMatch,
        userValue: currentUserAge ? `${currentUserAge} years` : "Not specified",
        matchValue: matchAge ? `${matchAge} years` : "Not specified",
        userPreference: currentUser.preferences?.ageRange
          ? `${currentUser.preferences.ageRange.min}-${currentUser.preferences.ageRange.max} years`
          : "Any",
      });

      // 3. Marital Status matching
      const maritalMatch = checkMatch(
        currentUser.preferences?.maritalStatusPref ||
          currentUser.preferences?.maritalStatus,
        match.maritalStatus
      );
      preferenceMatching.push({
        label: "Marital Status",
        match: maritalMatch,
        userValue: formatText(currentUser.maritalStatus),
        matchValue: formatText(match.maritalStatus),
        userPreference: formatText(
          currentUser.preferences?.maritalStatusPref ||
            currentUser.preferences?.maritalStatus ||
            "Any"
        ),
      });

      // 4. Religion matching
      const religionMatch = checkMatch(
        currentUser.preferences?.religion,
        match.religion
      );
      preferenceMatching.push({
        label: "Religion",
        match: religionMatch,
        userValue: formatText(currentUser.religion),
        matchValue: formatText(match.religion),
        userPreference: formatText(currentUser.preferences?.religion || "Any"),
      });

      // 5. Mother Tongue matching
      const motherTongueMatch = checkMatch(
        currentUser.motherTongue,
        match.motherTongue
      );
      preferenceMatching.push({
        label: "Mother Tongue",
        match: motherTongueMatch,
        userValue: Array.isArray(currentUser.motherTongue)
          ? currentUser.motherTongue.map(formatText).join(", ")
          : formatText(currentUser.motherTongue),
        matchValue: Array.isArray(match.motherTongue)
          ? match.motherTongue.map(formatText).join(", ")
          : formatText(match.motherTongue),
        userPreference: "Any", // Usually mother tongue is not a hard preference
      });

      // 6. Caste matching
      const casteMatch = checkMatch(
        currentUser.preferences?.religionCastePref,
        match.caste
      );
      preferenceMatching.push({
        label: "Caste",
        match: casteMatch,
        userValue: formatText(currentUser.caste),
        matchValue: formatText(match.caste),
        userPreference: formatText(
          currentUser.preferences?.religionCastePref || "Any"
        ),
      });

      // 7. Occupation matching
      const occupationMatch = checkMatch(
        currentUser.preferences?.occupationPref ||
          currentUser.preferences?.profession,
        match.occupation
      );
      preferenceMatching.push({
        label: "Occupation",
        match: occupationMatch,
        userValue: formatText(currentUser.occupation),
        matchValue: formatText(match.occupation),
        userPreference: Array.isArray(currentUser.preferences?.occupationPref)
          ? currentUser.preferences.occupationPref.map(formatText).join(", ")
          : formatText(currentUser.preferences?.profession || "Any"),
      });

      // 8. Annual Income matching
      const incomeMatch = checkMatch(
        currentUser.preferences?.annualIncomePref,
        match.annualIncome
      );
      preferenceMatching.push({
        label: "Annual Income",
        match: incomeMatch,
        userValue: formatText(currentUser.annualIncome),
        matchValue: formatText(match.annualIncome),
        userPreference: formatText(
          currentUser.preferences?.annualIncomePref || "Any"
        ),
      });

      // Calculate match score based on various factors
      let matchScore = 50; // Base score

      // Add points for verifications
      if (match.isEmailVerified) matchScore += 10;
      if (match.isPhoneVerified) matchScore += 10;
      if (match.isIdVerified) matchScore += 15;
      if (match.profileCompletion >= 80) matchScore += 15;
      if (match.profileCompletion >= 90) matchScore += 10;

      // Add points for preference matches
      const matchedPreferences = preferenceMatching.filter(
        (p) => p.match === true
      ).length;
      const totalPreferences = preferenceMatching.filter(
        (p) => p.match !== null
      ).length;
      if (totalPreferences > 0) {
        matchScore += Math.floor((matchedPreferences / totalPreferences) * 30);
      }

      matchScore = Math.min(matchScore, 100);

      return {
        ...match.toObject(),
        age: matchAge,
        distance: distance ? `${distance} km` : null,
        isNearby,
        isJustJoined,
        matchScore,
        hasShownInterest: interactionsMap[match._id.toString()] === "interest",
        hasShownSuperInterest:
          interactionsMap[match._id.toString()] === "super_interest",
        preferenceMatching, // Add preference matching data
        matchedPreferencesCount: matchedPreferences || 0,
        totalPreferencesCount: totalPreferences || 0,
      };
    });

    // Apply additional filters that require processing
    let filteredMatches = enrichedMatches;

    // Verified filter
    if (verified === "true" || verified === true) {
      filteredMatches = filteredMatches.filter(
        (match) =>
          match.isEmailVerified ||
          match.isPhoneVerified ||
          match.isIdVerified ||
          match.isPhotoVerified
      );
    }

    // Nearby filter
    if (nearby === "true" || nearby === true) {
      console.log(
        "Applying nearby filter. Total matches before filter:",
        filteredMatches.length
      );
      filteredMatches = filteredMatches.filter((match) => match.isNearby);
      console.log("Matches after nearby filter:", filteredMatches.length);
    }

    // Update totalMatches count if post-processing filters were applied
    if (
      nearby === "true" ||
      nearby === true ||
      verified === "true" ||
      verified === true
    ) {
      totalMatches = filteredMatches.length;
    }

    res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      data: filteredMatches,
      currentUserPreferences: {
        ageRange: currentUser.preferences?.ageRange,
        heightRange: currentUser.preferences?.heightRange,
        maritalStatus:
          currentUser.preferences?.maritalStatusPref ||
          currentUser.preferences?.maritalStatus,
        religion: currentUser.preferences?.religion,
        caste: currentUser.preferences?.religionCastePref,
        occupation:
          currentUser.preferences?.occupationPref ||
          currentUser.preferences?.profession,
        annualIncome: currentUser.preferences?.annualIncomePref,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMatches / parseInt(limit)),
        totalMatches,
        hasNext: skip + filteredMatches.length < totalMatches,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching matches",
      error: error.message,
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
        message: "Profile ID is required",
      });
    }

    if (profileId === fromUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot show interest in your own profile",
      });
    }

    // Check if profile exists
    const targetProfile = await User.findById(profileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if interest already exists
    const existingInterest = await Interaction.findOne({
      fromUser: fromUserId,
      toUser: profileId,
      type: "interest",
    });

    if (existingInterest) {
      // Ensure Interest record exists for the Interest model (used by conversations)
      try {
        const Interest = (await import("../models/Interest.js")).default;
        const existingInterestRecord = await Interest.findOne({
          fromUser: fromUserId,
          targetUser: profileId,
          type: "interest",
        });

        // If Interest record doesn't exist, create it (it might only exist in Interaction model)
        if (!existingInterestRecord) {
          await Interest.create({
            fromUser: fromUserId,
            targetUser: profileId,
            type: "interest",
            status:
              existingInterest.status === "accepted" ? "accepted" : "pending",
            message: existingInterest.messageContent || message || null,
          });
        }
      } catch (interestError) {
        console.error("Error ensuring Interest record exists:", interestError);
        // Continue to return error even if Interest record creation fails
      }

      return res.status(400).json({
        success: false,
        message: "Interest already shown",
      });
    }

    // Check user's interest limits
    const user = await User.findById(fromUserId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayInterests = await Interaction.countDocuments({
      fromUser: fromUserId,
      type: "interest",
      createdAt: { $gte: today },
    });

    // Check if user has premium membership for unlimited interests
    const hasUnlimitedInterests =
      user.membership && user.membership.plan && user.membership.isActive;

    if (!hasUnlimitedInterests && todayInterests >= 5) {
      return res.status(400).json({
        success: false,
        message:
          "Daily interest limit reached. Upgrade to premium for unlimited interests.",
        code: "INTEREST_LIMIT_REACHED",
      });
    }

    // Create interest interaction
    const interest = new Interaction({
      fromUser: fromUserId,
      toUser: profileId,
      type: "interest",
      status: "sent",
      messageContent: message || null,
    });

    await interest.save();

    // Also create Interest record for the Interest model used by conversations
    try {
      const Interest = (await import("../models/Interest.js")).default;
      const interestRecord = new Interest({
        fromUser: fromUserId,
        targetUser: profileId,
        type: "interest",
        status: "pending",
        message: message || null,
      });
      await interestRecord.save();
    } catch (interestError) {
      console.error("Error creating Interest record:", interestError);
      // Don't fail the request if Interest model creation fails
    }

    // If message is provided, also create a Message record
    if (message && message.trim()) {
      const Message = (await import("../models/Message.js")).default;
      const ChatRoom = (await import("../models/ChatRoom.js")).default;

      try {
        // Get or create chat room
        let chatRoom = await ChatRoom.findOne({
          participants: { $all: [fromUserId, profileId] },
          isActive: true,
        });

        if (!chatRoom) {
          chatRoom = await ChatRoom.create({
            participants: [fromUserId, profileId],
            isActive: true,
          });
        }

        // Create message
        const messageDoc = await Message.create({
          sender: fromUserId,
          receiver: profileId,
          content: message.trim(),
          messageType: "text",
        });

        // Update chat room
        chatRoom.lastMessage = messageDoc._id;
        chatRoom.lastMessageAt = messageDoc.createdAt;
        await chatRoom.save();
      } catch (msgError) {
        console.error("Error creating message:", msgError);
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
        remainingInterests: hasUnlimitedInterests
          ? "unlimited"
          : Math.max(0, 5 - todayInterests - 1),
      },
    });
  } catch (error) {
    console.error("Show interest error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while showing interest",
      error: error.message,
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
        message: "Profile ID is required",
      });
    }

    if (profileId === fromUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot show super interest in your own profile",
      });
    }

    // Check if profile exists
    const targetProfile = await User.findById(profileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if super interest already exists
    const existingSuperInterest = await Interaction.findOne({
      fromUser: fromUserId,
      toUser: profileId,
      type: "super_interest",
    });

    if (existingSuperInterest) {
      return res.status(400).json({
        success: false,
        message: "Super interest already shown",
      });
    }

    // Check user's super interest limits
    const user = await User.findById(fromUserId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySuperInterests = await Interaction.countDocuments({
      fromUser: fromUserId,
      type: "super_interest",
      createdAt: { $gte: today },
    });

    // Check if user has premium membership for unlimited super interests
    const hasUnlimitedSuperInterests =
      user.membership && user.membership.plan && user.membership.isActive;

    if (!hasUnlimitedSuperInterests && todaySuperInterests >= 1) {
      return res.status(400).json({
        success: false,
        message:
          "Daily super interest limit reached. Upgrade to premium for unlimited super interests.",
        code: "SUPER_INTEREST_LIMIT_REACHED",
      });
    }

    // Create super interest interaction
    const superInterest = new Interaction({
      fromUser: fromUserId,
      toUser: profileId,
      type: "super_interest",
      status: "sent",
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
        remainingSuperInterests: hasUnlimitedSuperInterests
          ? "unlimited"
          : Math.max(0, 1 - todaySuperInterests - 1),
      },
    });
  } catch (error) {
    console.error("Show super interest error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while showing super interest",
      error: error.message,
    });
  }
};

// Get user's interest limits
export const getInterestLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "membership dailyInterests dailySuperInterests"
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's usage
    const todayInterests = await Interaction.countDocuments({
      fromUser: userId,
      type: "interest",
      createdAt: { $gte: today },
    });

    const todaySuperInterests = await Interaction.countDocuments({
      fromUser: userId,
      type: "super_interest",
      createdAt: { $gte: today },
    });

    // Check if user has premium membership
    const hasUnlimitedInterests =
      user.membership && user.membership.plan && user.membership.isActive;

    const hasUnlimitedSuperInterests =
      user.membership && user.membership.plan && user.membership.isActive;

    res.status(200).json({
      success: true,
      message: "Interest limits retrieved successfully",
      data: {
        freeInterests: hasUnlimitedInterests
          ? "unlimited"
          : Math.max(0, 5 - todayInterests),
        freeSuperInterests: hasUnlimitedSuperInterests
          ? "unlimited"
          : Math.max(0, 1 - todaySuperInterests),
        usedInterests: todayInterests,
        usedSuperInterests: todaySuperInterests,
        hasUnlimitedInterests,
        hasUnlimitedSuperInterests,
      },
    });
  } catch (error) {
    console.error("Get interest limits error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interest limits",
      error: error.message,
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
      type: "interest",
    }).select("toUser");

    const interestedProfileIds = userInterests.map(
      (interest) => interest.toUser
    );

    // Get profiles that have shown interest in the user
    const mutualInterests = await Interaction.find({
      toUser: userId,
      fromUser: { $in: interestedProfileIds },
      type: "interest",
    }).populate("fromUser", "-password -otp -otpExpiry");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMatches = mutualInterests.slice(
      skip,
      skip + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Mutual matches retrieved successfully",
      data: paginatedMatches.map((match) => ({
        ...match.fromUser.toObject(),
        matchedAt: match.createdAt,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(mutualInterests.length / parseInt(limit)),
        totalMatches: mutualInterests.length,
        hasNext: skip + paginatedMatches.length < mutualInterests.length,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get mutual matches error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching mutual matches",
      error: error.message,
    });
  }
};

// Request photo from a profile
export const requestPhoto = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required",
      });
    }

    if (fromUserId === profileId) {
      return res.status(400).json({
        success: false,
        message: "Cannot request photo from yourself",
      });
    }

    // Check if target profile exists
    const targetProfile = await User.findById(profileId);
    if (!targetProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if photo request already exists (to prevent spam)
    const existingRequest = await Interaction.findOne({
      fromUser: fromUserId,
      toUser: profileId,
      type: "message",
      messageContent: { $regex: /photo.*request|request.*photo/i },
    });

    if (existingRequest) {
      // Check if it was sent recently (within last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      if (existingRequest.createdAt > oneDayAgo) {
        return res.status(400).json({
          success: false,
          message:
            "You have already requested photos from this profile recently. Please wait 24 hours before requesting again.",
        });
      }
    }

    // Get current user info
    const currentUser = await User.findById(fromUserId).select(
      "name profileImage"
    );

    // Create interaction record
    const interaction = await Interaction.create({
      fromUser: fromUserId,
      toUser: profileId,
      type: "message",
      messageContent: "Photo request",
      messageType: "system",
      status: "sent",
    });

    // Create notification for the target user
    try {
      await Notification.create({
        userId: profileId,
        type: "message_received",
        title: "Photo Request",
        message: `${currentUser.name} has requested to see more photos from you`,
        relatedUserId: fromUserId,
        metadata: {
          interactionId: interaction._id,
          requestType: "photo_request",
        },
        actionUrl: `/profile/${fromUserId}`,
        actionText: "View Profile",
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the request if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: "Photo request sent successfully",
      data: {
        interactionId: interaction._id,
        requestedAt: interaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Request photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while requesting photo",
      error: error.message,
    });
  }
};
