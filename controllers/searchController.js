import User from "../models/User.js";
import SearchFilter from "../models/SearchFilter.js";
import Interaction from "../models/Interaction.js";

// Advanced search with geolocation support
export const searchProfiles = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const {
      ageMin, ageMax, gender, religion, caste, education, occupation, location,
      maritalStatus, incomeMin, incomeMax, diet, drinkingHabits, smokingHabits,
      fitnessLevel, bodyType, complexion, languages, familyType, familyIncome,
      industry, fieldOfStudy, heightMin, heightMax,
      // Geolocation parameters
      latitude, longitude, radius = 50, // radius in kilometers
      // Pagination
      page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc"
    } = req.query;

    // Build search filters
    let filters = { _id: { $ne: currentUserId } };

    // Age filter
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

    // Basic filters
    if (gender) filters.gender = { $in: Array.isArray(gender) ? gender : [gender] };
    if (religion) filters.religion = { $in: Array.isArray(religion) ? religion : [religion] };
    if (caste) filters.caste = { $in: Array.isArray(caste) ? caste : [caste] };
    if (education) filters.education = { $in: Array.isArray(education) ? education : [education] };
    if (occupation) filters.occupation = { $in: Array.isArray(occupation) ? occupation : [occupation] };
    if (maritalStatus) filters.maritalStatus = { $in: Array.isArray(maritalStatus) ? maritalStatus : [maritalStatus] };
    if (diet) filters.diet = { $in: Array.isArray(diet) ? diet : [diet] };
    if (drinkingHabits) filters.drinkingHabits = { $in: Array.isArray(drinkingHabits) ? drinkingHabits : [drinkingHabits] };
    if (smokingHabits) filters.smokingHabits = { $in: Array.isArray(smokingHabits) ? smokingHabits : [smokingHabits] };
    if (fitnessLevel) filters.fitnessLevel = { $in: Array.isArray(fitnessLevel) ? fitnessLevel : [fitnessLevel] };
    if (bodyType) filters.bodyType = { $in: Array.isArray(bodyType) ? bodyType : [bodyType] };
    if (complexion) filters.complexion = { $in: Array.isArray(complexion) ? complexion : [complexion] };
    if (familyType) filters.familyType = { $in: Array.isArray(familyType) ? familyType : [familyType] };
    if (familyIncome) filters.familyIncome = { $in: Array.isArray(familyIncome) ? familyIncome : [familyIncome] };
    if (industry) filters.industry = { $in: Array.isArray(industry) ? industry : [industry] };
    if (fieldOfStudy) filters.fieldOfStudy = { $in: Array.isArray(fieldOfStudy) ? fieldOfStudy : [fieldOfStudy] };

    // Location filter (text-based)
    if (location) {
      filters.$or = [
        { location: { $regex: location, $options: "i" } },
        { city: { $regex: location, $options: "i" } },
        { state: { $regex: location, $options: "i" } }
      ];
    }

    // Income filter
    if (incomeMin || incomeMax) {
      const incomeRanges = {
        "0-2": { min: 0, max: 200000 },
        "2-5": { min: 200000, max: 500000 },
        "5-10": { min: 500000, max: 1000000 },
        "10-20": { min: 1000000, max: 2000000 },
        "20+": { min: 2000000, max: Infinity }
      };
      
      const validRanges = [];
      Object.entries(incomeRanges).forEach(([range, values]) => {
        if ((!incomeMin || values.max >= incomeMin) && (!incomeMax || values.min <= incomeMax)) {
          validRanges.push(range);
        }
      });
      
      if (validRanges.length > 0) {
        filters.annualIncome = { $in: validRanges };
      }
    }

    // Height filter
    if (heightMin || heightMax) {
      const heightRanges = {
        "4'0\"-4'6\"": { min: 48, max: 54 },
        "4'6\"-5'0\"": { min: 54, max: 60 },
        "5'0\"-5'6\"": { min: 60, max: 66 },
        "5'6\"-6'0\"": { min: 66, max: 72 },
        "6'0\"-6'6\"": { min: 72, max: 78 },
        "6'6\"+": { min: 78, max: Infinity }
      };
      
      const validHeightRanges = [];
      Object.entries(heightRanges).forEach(([range, values]) => {
        if ((!heightMin || values.max >= heightMin) && (!heightMax || values.min <= heightMax)) {
          validHeightRanges.push(range);
        }
      });
      
      if (validHeightRanges.length > 0) {
        filters.height = { $in: validHeightRanges };
      }
    }

    // Languages filter
    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      filters.languagesKnown = { $in: langArray };
    }

    // Geolocation filter (if coordinates provided)
    if (latitude && longitude) {
      // This is a simplified geolocation filter
      // In production, you'd use MongoDB's geospatial queries
      filters["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Exclude blocked users
    const blockedUsers = await Interaction.find({
      $or: [
        { fromUser: currentUserId, type: "block" },
        { toUser: currentUserId, type: "block" }
      ]
    }).select("fromUser toUser");

    const blockedUserIds = blockedUsers.map(interaction => 
      interaction.fromUser.toString() === currentUserId.toString() 
        ? interaction.toUser 
        : interaction.fromUser
    );

    if (blockedUserIds.length > 0) {
      filters._id = { $nin: blockedUserIds };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute search
    const users = await User.find(filters, "-password -otp -otpExpiry -isOtpVerified")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filters);

    // Format response
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const profiles = users.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      dob: user.dob,
      age: user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : null,
      occupation: user.occupation,
      location: user.location,
      city: user.city,
      state: user.state,
      profileFor: user.profileFor,
      education: user.education,
      religion: user.religion,
      caste: user.caste,
      about: user.about,
      height: user.height,
      maritalStatus: user.maritalStatus,
      annualIncome: user.annualIncome,
      profileImage: user.profileImage ? `${baseUrl}/${user.profileImage}` : null,
      photos: user.photos?.map(photo => `${baseUrl}/${photo}`) || [],
      profileCompletion: user.profileCompletion,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        profiles,
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
    console.error("Search profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during search",
      error: error.message
    });
  }
};

// Get recommended matches based on user preferences
export const getRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 20 } = req.query;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser || !currentUser.preferences) {
      return res.status(400).json({
        success: false,
        message: "Please set your partner preferences first"
      });
    }

    // Build recommendation filters based on user preferences
    let filters = { _id: { $ne: currentUserId } };

    // Age filter
    if (currentUser.preferences.ageRange) {
      const currentYear = new Date().getFullYear();
      filters.dob = {};
      if (currentUser.preferences.ageRange.min) {
        filters.dob.$lte = new Date(`${currentYear - currentUser.preferences.ageRange.min}-12-31`);
      }
      if (currentUser.preferences.ageRange.max) {
        filters.dob.$gte = new Date(`${currentYear - currentUser.preferences.ageRange.max}-01-01`);
      }
    }

    // Other preference filters
    if (currentUser.preferences.religion) {
      filters.religion = currentUser.preferences.religion;
    }
    if (currentUser.preferences.caste) {
      filters.caste = currentUser.preferences.caste;
    }
    if (currentUser.preferences.education) {
      filters.education = currentUser.preferences.education;
    }
    if (currentUser.preferences.location) {
      filters.location = currentUser.preferences.location;
    }
    if (currentUser.preferences.maritalStatusPref) {
      filters.maritalStatus = currentUser.preferences.maritalStatusPref;
    }

    // Exclude blocked users
    const blockedUsers = await Interaction.find({
      $or: [
        { fromUser: currentUserId, type: "block" },
        { toUser: currentUserId, type: "block" }
      ]
    }).select("fromUser toUser");

    const blockedUserIds = blockedUsers.map(interaction => 
      interaction.fromUser.toString() === currentUserId.toString() 
        ? interaction.toUser 
        : interaction.fromUser
    );

    if (blockedUserIds.length > 0) {
      filters._id = { $nin: blockedUserIds };
    }

    // Get users and calculate match scores
    const users = await User.find(filters, "-password -otp -otpExpiry -isOtpVerified")
      .limit(parseInt(limit));

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const recommendations = users.map(user => {
      let score = 0;
      let total = 0;

      // Calculate match score
      if (currentUser.preferences.ageRange && user.dob) {
        total++;
        const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
        if (age >= currentUser.preferences.ageRange.min && 
            age <= currentUser.preferences.ageRange.max) {
          score++;
        }
      }

      if (currentUser.preferences.religion && user.religion === currentUser.preferences.religion) {
        total++;
        score++;
      }

      if (currentUser.preferences.caste && user.caste === currentUser.preferences.caste) {
        total++;
        score++;
      }

      if (currentUser.preferences.education && user.education === currentUser.preferences.education) {
        total++;
        score++;
      }

      if (currentUser.preferences.location && user.location === currentUser.preferences.location) {
        total++;
        score++;
      }

      const matchScore = total > 0 ? Math.round((score / total) * 100) : 0;

      return {
        _id: user._id,
        name: user.name,
        gender: user.gender,
        dob: user.dob,
        age: user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : null,
        occupation: user.occupation,
        location: user.location,
        profileFor: user.profileFor,
        education: user.education,
        religion: user.religion,
        caste: user.caste,
        about: user.about,
        matchScore,
        profileImage: user.profileImage ? `${baseUrl}/${user.profileImage}` : null,
        photos: user.photos?.map(photo => `${baseUrl}/${photo}`) || [],
        profileCompletion: user.profileCompletion
      };
    });

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      message: "Recommendations fetched successfully",
      data: recommendations
    });

  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching recommendations",
      error: error.message
    });
  }
};

// Save search filter
export const saveSearchFilter = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { name, filters } = req.body;

    if (!name || !filters) {
      return res.status(400).json({
        success: false,
        message: "Filter name and filters are required"
      });
    }

    const searchFilter = await SearchFilter.create({
      user: currentUserId,
      name,
      filters
    });

    res.status(201).json({
      success: true,
      message: "Search filter saved successfully",
      data: searchFilter
    });

  } catch (error) {
    console.error("Save search filter error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving filter",
      error: error.message
    });
  }
};

// Get saved search filters
export const getSavedFilters = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const filters = await SearchFilter.find({ 
      user: currentUserId, 
      isActive: true 
    }).sort({ lastUsed: -1 });

    res.status(200).json({
      success: true,
      message: "Saved filters fetched successfully",
      data: filters
    });

  } catch (error) {
    console.error("Get saved filters error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching filters",
      error: error.message
    });
  }
};

// Delete saved search filter
export const deleteSavedFilter = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { filterId } = req.params;

    const filter = await SearchFilter.findOneAndUpdate(
      { _id: filterId, user: currentUserId },
      { isActive: false },
      { new: true }
    );

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: "Filter not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Filter deleted successfully"
    });

  } catch (error) {
    console.error("Delete saved filter error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting filter",
      error: error.message
    });
  }
};
