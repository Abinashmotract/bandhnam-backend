import User from "../models/User.js";

// Get search criteria options
export const getSearchCriteria = async (req, res) => {
  try {
    const criteria = {
      maritalStatus: [
        "Doesn't Matter",
        "Never Married",
        "Awaiting Divorce",
        "Divorced",
        "Widowed",
        "Annulled",
        "Married",
      ],
      religion: [
        "Doesn't Matter",
        "Hindu",
        "Muslim",
        "Sikh",
        "Christian",
        "Buddhist",
        "Jain",
        "Parsi",
        "Jewish",
        "Bahai",
      ],
      manglik: [
        "Doesn't Matter",
        "Manglik",
        "Non Manglik",
        "Angshik (Partial Manglik)",
      ],
      diet: [
        "Doesn't Matter",
        "Vegetarian",
        "Non Vegetarian",
        "Jain",
        "Eggetarian",
      ],
      showProfiles: ["All Profiles", "Profile with photos"],
      education: [
        "B.A",
        "B.Com",
        "B.Sc",
        "B.Tech",
        "B.E",
        "B.Pharm",
        "BBA",
        "BCA",
        "M.A",
        "M.Com",
        "M.Sc",
        "M.Tech",
        "M.E",
        "M.Pharm",
        "MBA",
        "MCA",
        "Ph.D",
        "MD",
        "MS",
        "CA",
        "CS",
        "ICWA",
        "LLB",
        "LLM",
      ],
      occupation: [
        "Software Engineer",
        "Doctor",
        "Teacher",
        "Engineer",
        "Business",
        "Government Employee",
        "Private Employee",
        "Self Employed",
        "Student",
        "Homemaker",
        "Retired",
        "Other",
      ],
      motherTongue: [
        "Hindi",
        "English",
        "Bengali",
        "Telugu",
        "Marathi",
        "Tamil",
        "Gujarati",
        "Urdu",
        "Kannada",
        "Odia",
        "Malayalam",
        "Punjabi",
        "Assamese",
        "Nepali",
        "Sanskrit",
        "Other",
      ],
      countries: [
        "India",
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "United Arab Emirates",
        "Singapore",
        "Germany",
        "France",
        "Other",
      ],
    };

    res.status(200).json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    console.error("Error fetching search criteria:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search criteria",
      error: error.message,
    });
  }
};

// Search profiles by criteria
export const searchByCriteria = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      ageMin,
      ageMax,
      heightMin,
      heightMax,
      maritalStatus,
      religion,
      caste,
      motherTongue,
      annualIncomeMin,
      annualIncomeMax,
      country,
      state,
      city,
      showProfiles,
      manglik,
      diet,
      education,
      occupation,
    } = req.body;

    // Build query
    let query = {
      _id: { $ne: userId }, // Exclude current user
      isActive: true,
    };

    // Age filter
    if (ageMin || ageMax) {
      const today = new Date();
      const maxBirthDate = ageMax
        ? new Date(
            today.getFullYear() - ageMax,
            today.getMonth(),
            today.getDate()
          )
        : null;
      const minBirthDate = ageMin
        ? new Date(
            today.getFullYear() - ageMin,
            today.getMonth(),
            today.getDate()
          )
        : null;

      if (maxBirthDate && minBirthDate) {
        query.dob = { $gte: maxBirthDate, $lte: minBirthDate };
      } else if (maxBirthDate) {
        query.dob = { $gte: maxBirthDate };
      } else if (minBirthDate) {
        query.dob = { $lte: minBirthDate };
      }
    }

    // Height filter
    if (heightMin || heightMax) {
      query.height = {};
      if (heightMin) query.height.$gte = heightMin;
      if (heightMax) query.height.$lte = heightMax;
    }

    // Other filters
    if (maritalStatus && maritalStatus.length > 0) {
      if (Array.isArray(maritalStatus)) {
        // Handle multiple selections (e.g., ["never married", "divorced"])
        query.maritalStatus = {
          $in: maritalStatus.map((m) => m.toLowerCase().replace(/\s+/g, "_")),
        };
      } else if (
        typeof maritalStatus === "string" &&
        maritalStatus !== "Doesn't Matter"
      ) {
        // Handle single selection
        query.maritalStatus = maritalStatus.toLowerCase().replace(/\s+/g, "_");
      }
    }

    if (religion && religion !== "Doesn't Matter") {
      query.religion = religion;
    }

    if (caste) {
      query.caste = { $regex: caste, $options: "i" };
    }

    if (motherTongue && motherTongue !== "Doesn't Matter") {
      query.motherTongue = motherTongue;
    }

    if (annualIncomeMin || annualIncomeMax) {
      query.annualIncome = {};
      if (annualIncomeMin) query.annualIncome.$gte = annualIncomeMin;
      if (annualIncomeMax) query.annualIncome.$lte = annualIncomeMax;
    }

    if (country && country !== "Doesn't Matter") {
      query.country = country;
    }

    if (state && state !== "Doesn't Matter") {
      query.state = { $regex: state, $options: "i" };
    }

    if (city && city !== "Doesn't Matter") {
      query.city = { $regex: city, $options: "i" };
    }

    if (manglik && manglik !== "Doesn't Matter") {
      query.manglik = manglik;
    }

    if (diet && diet !== "Doesn't Matter") {
      query.diet = diet;
    }

    if (education && education !== "Doesn't Matter") {
      query.education = { $regex: education, $options: "i" };
    }

    if (occupation && occupation.length > 0) {
      if (Array.isArray(occupation)) {
        // Handle multiple selections (e.g., ["never married", "divorced"])
        query.occupation = {
          $in: occupation.map((m) => m.toLowerCase().replace(/\s+/g, "_")),
        };
      } else if (
        typeof occupation === "string" &&
        occupation !== "Doesn't Matter"
      ) {
        // Handle single selection
        query.occupation = occupation.toLowerCase().replace(/\s+/g, "_");
      }
    }

    // Show profiles with photos only
    if (showProfiles === "Profile with photos") {
      query.profileImage = { $exists: true, $ne: null };
    }

    // Execute search
    const profiles = await User.find(query)
      .select(
        "name profileImage customId age height maritalStatus religion caste motherTongue annualIncome country city manglik diet education occupation about"
      )
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: profiles.map((profile) => ({
        id: profile._id,
        name: profile.name,
        customId: profile.customId,
        profileImage: profile.profileImage,
        age: profile.age,
        height: profile.height,
        maritalStatus: profile.maritalStatus,
        religion: profile.religion,
        caste: profile.caste,
        motherTongue: profile.motherTongue,
        annualIncome: profile.annualIncome,
        country: profile.country,
        city: profile.city,
        manglik: profile.manglik,
        diet: profile.diet,
        education: profile.education,
        occupation: profile.occupation,
        about: profile.about,
      })),
    });
  } catch (error) {
    console.error("Error searching profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search profiles",
      error: error.message,
    });
  }
};

// Search by profile ID
export const searchByProfileId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileId } = req.params;

    const profile = await User.findOne({
      $or: [{ customId: profileId }, { _id: profileId }],
      _id: { $ne: userId },
    }).select(
      "name profileImage customId age height maritalStatus religion caste motherTongue annualIncome country city manglik diet education occupation about"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: profile._id,
        name: profile.name,
        customId: profile.customId,
        profileImage: profile.profileImage,
        age: profile.age,
        height: profile.height,
        maritalStatus: profile.maritalStatus,
        religion: profile.religion,
        caste: profile.caste,
        motherTongue: profile.motherTongue,
        annualIncome: profile.annualIncome,
        country: profile.country,
        city: profile.city,
        manglik: profile.manglik,
        diet: profile.diet,
        education: profile.education,
        occupation: profile.occupation,
        about: profile.about,
      },
    });
  } catch (error) {
    console.error("Error searching by profile ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search by profile ID",
      error: error.message,
    });
  }
};

// Search users by typing their ID or name
export const searchByIdOrName = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    const userId = req.user.id;

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    // Search by customId, name, or _id
    const profiles = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        { isActive: true },
        {
          $or: [
            { customId: { $regex: searchQuery, $options: "i" } },
            { name: { $regex: searchQuery, $options: "i" } },
            {
              _id: searchQuery.match(/^[0-9a-fA-F]{24}$/) ? searchQuery : null,
            },
          ],
        },
      ],
    })
      .select(
        "name profileImage customId age height maritalStatus religion education occupation city state"
      )
      .limit(10);

    res.status(200).json({
      success: true,
      data: profiles.map((profile) => ({
        id: profile._id,
        name: profile.name,
        customId: profile.customId,
        profileImage: profile.profileImage,
        age: profile.age,
        height: profile.height,
        maritalStatus: profile.maritalStatus,
        religion: profile.religion,
        education: profile.education,
        occupation: profile.occupation,
        location: `${profile.city}${profile.state ? ", " + profile.state : ""}`,
      })),
    });
  } catch (error) {
    console.error("Error searching by ID or name:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search profiles",
      error: error.message,
    });
  }
};

export const saveSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { searchQuery } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.searchHistory.push(searchQuery);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Search history saved successfully",
    });
  } catch (error) {
    console.error("Error saving search history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save search history",
      error: error.message,
    });
  }
};
