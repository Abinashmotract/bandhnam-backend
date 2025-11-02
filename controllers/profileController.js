import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Helper function to construct image URL with uploads/ path
const getImageUrl = (baseUrl, imagePath) => {
  if (!imagePath) return null;
  // If already includes uploads/, use as is
  if (imagePath.includes('uploads/') || imagePath.startsWith('uploads/')) {
    return `${baseUrl}/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
  }
  // Otherwise, assume it's just a filename and add uploads/ prefix
  return `${baseUrl}/uploads/${imagePath}`;
};

export const getAllProfiles = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const users = await User.find(
      { _id: { $ne: currentUserId } }, 
      "-password -otp -otpExpiry -isOtpVerified" 
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profiles = users.map(u => ({
      _id: u._id,
      name: u.name,
      gender: u.gender,
      dob: u.dob,
      occupation: u.occupation,
      location: u.location,
      profileFor: u.profileFor,
      education: u.education,
      religion: u.religion,
      caste: u.caste,
      about: u.about,
      profileImage: getImageUrl(baseUrl, u.profileImage),
      photos: u.photos?.map(photo => getImageUrl(baseUrl, photo)) || []
    }));

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Profiles fetched successfully",
      data: profiles,
    });
  } catch (err) {
    console.error("Get all profiles error:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error while fetching profiles",
      error: err.message,
    });
  }
};

export const getMatchedProfiles = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser || !currentUser.preferences) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Set your partner preferences first",
      });
    }

    const users = await User.find(
      { _id: { $ne: currentUserId } },
      "-password -otp -otpExpiry -isOtpVerified"
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const matchedProfiles = users.map((u) => {
      let score = 0;
      let total = 0;

      // ✅ Match age
      if (currentUser.preferences.ageRange) {
        total++;
        if (u.dob) {
          const age =
            new Date().getFullYear() - new Date(u.dob).getFullYear();
          if (
            age >= currentUser.preferences.ageRange.min &&
            age <= currentUser.preferences.ageRange.max
          ) {
            score++;
          }
        }
      }

      // ✅ Match religion
      if (currentUser.preferences.religion) {
        total++;
        if (
          u.religion &&
          u.religion === currentUser.preferences.religion
        ) {
          score++;
        }
      }

      // ✅ Match caste
      if (currentUser.preferences.caste) {
        total++;
        if (u.caste && u.caste === currentUser.preferences.caste) {
          score++;
        }
      }

      // ✅ Match education
      if (currentUser.preferences.education) {
        total++;
        if (
          u.education &&
          u.education === currentUser.preferences.education
        ) {
          score++;
        }
      }

      // ✅ Match location
      if (currentUser.preferences.location) {
        total++;
        if (
          u.location &&
          u.location === currentUser.preferences.location
        ) {
          score++;
        }
      }

      const matchScore = total > 0 ? Math.round((score / total) * 100) : 0;

      return {
        _id: u._id,
        name: u.name,
        gender: u.gender,
        dob: u.dob,
        occupation: u.occupation,
        location: u.location,
        profileFor: u.profileFor,
        education: u.education,
        religion: u.religion,
        caste: u.caste,
        about: u.about,
        matchScore,
        profileImage: getImageUrl(baseUrl, u.profileImage),
        photos: u.photos?.map((photo) => getImageUrl(baseUrl, photo)) || [],
      };
    });

    // ✅ Sort profiles by highest match score
    matchedProfiles.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Matched profiles fetched successfully",
      data: matchedProfiles,
    });
  } catch (err) {
    console.error("Get matched profiles error:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error while fetching matched profiles",
      error: err.message,
    });
  }
};

export const filterProfiles = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const {
      ageMin,
      ageMax,
      gender,
      religion,
      caste,
      education,
      location,
      occupation
    } = req.query; // filters frontend se query params ke roop me aayenge

    let filters = { _id: { $ne: currentUserId } };

    // ✅ Age filter
    if (ageMin || ageMax) {
      const currentYear = new Date().getFullYear();
      filters.dob = {};
      if (ageMin) {
        filters.dob.$lte = new Date(`${currentYear - ageMin}-12-31`);
      }
      if (ageMax) {
        filters.dob.$gte = new Date(`${currentYear - ageMax}-01-01`);
      }
    }

    if (gender) filters.gender = gender;
    if (religion) filters.religion = religion;
    if (caste) filters.caste = caste;
    if (education) filters.education = education;
    if (location) filters.location = location;
    if (occupation) filters.occupation = occupation;

    const users = await User.find(filters, "-password -otp -otpExpiry -isOtpVerified");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profiles = users.map(u => ({
      _id: u._id,
      name: u.name,
      gender: u.gender,
      dob: u.dob,
      occupation: u.occupation,
      location: u.location,
      profileFor: u.profileFor,
      education: u.education,
      religion: u.religion,
      caste: u.caste,
      about: u.about,
      profileImage: getImageUrl(baseUrl, u.profileImage),
      photos: u.photos?.map(photo => getImageUrl(baseUrl, photo)) || []
    }));

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Profiles filtered successfully",
      data: profiles,
    });
  } catch (err) {
    console.error("Filter profiles error:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error while filtering profiles",
      error: err.message,
    });
  }
};

// Get interest limits for a user
export const getInterestLimits = async (req, res) => {
  try {
    const userId = req.user._id;
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

    return res.status(200).json({
      success: true,
      status: 200,
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

  } catch (err) {
    console.error("Get interest limits error:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error while fetching interest limits",
      error: err.message,
    });
  }
};
