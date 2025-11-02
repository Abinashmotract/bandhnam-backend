import User from "../models/User.js";
import SearchFilter from "../models/SearchFilter.js";
import mongoose from "mongoose";

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
        query.maritalStatus = {
          $in: maritalStatus.map((m) => m.toLowerCase().replace(/\s+/g, "_")),
        };
      } else if (
        typeof maritalStatus === "string" &&
        maritalStatus !== "Doesn't Matter"
      ) {
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
        query.occupation = {
          $in: occupation.map((m) => m.toLowerCase().replace(/\s+/g, "_")),
        };
      } else if (
        typeof occupation === "string" &&
        occupation !== "Doesn't Matter"
      ) {
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

    if (mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Use customId, not MongoDB _id.",
      });
    }

    // ✅ Find user by customId
    const profile = await User.findOne({ customId: profileId }).select(
      "name profileImage customId age height maritalStatus religion caste motherTongue annualIncome country city manglik diet education occupation about _id"
    );

    // ❌ If no user found with that customId
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }
    // ❌ If the found profile belongs to the same user (own profile)
    if (profile._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot search your own profile.",
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
        { _id: { $ne: userId } },
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

// FIXED: Save search filter - Route Handler
export const saveSearchFilterHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filters, name } = req.body;

    if (!filters) {
      return res.status(400).json({
        success: false,
        message: "Filters are required",
      });
    }

    // Create new search filter
    const searchFilter = new SearchFilter({
      user: userId,
      name: name || "Saved Search",
      filters: {
        ageRange: {
          min: filters.ageMin || null,
          max: filters.ageMax || null,
        },
        heightRange: {
          min: filters.heightMin || null,
          max: filters.heightMax || null,
        },
        maritalStatus: Array.isArray(filters.maritalStatus)
          ? filters.maritalStatus
          : filters.maritalStatus
          ? [filters.maritalStatus]
          : [],
        religion:
          filters.religion && filters.religion !== "Doesn't Matter"
            ? [filters.religion]
            : [],
        caste: filters.caste ? [filters.caste] : [],
        motherTongue:
          filters.motherTongue && filters.motherTongue !== "Doesn't Matter"
            ? Array.isArray(filters.motherTongue)
              ? filters.motherTongue
              : [filters.motherTongue]
            : [],
        incomeRange: {
          min: filters.annualIncomeMin || null,
          max: filters.annualIncomeMax || null,
        },
        location:
          filters.country && filters.country !== "Doesn't Matter"
            ? [filters.country]
            : [],
        country:
          filters.country && filters.country !== "Doesn't Matter"
            ? [filters.country]
            : [],
        state:
          filters.state && filters.state !== "Doesn't Matter"
            ? [filters.state]
            : [],
        city:
          filters.city && filters.city !== "Doesn't Matter"
            ? [filters.city]
            : [],
        manglik:
          filters.manglik && filters.manglik !== "Doesn't Matter"
            ? [filters.manglik]
            : [],
        diet:
          filters.diet && filters.diet !== "Doesn't Matter"
            ? [filters.diet]
            : [],
        education:
          filters.education && filters.education !== "Doesn't Matter"
            ? [filters.education]
            : [],
        occupation: Array.isArray(filters.occupation)
          ? filters.occupation
          : filters.occupation
          ? [filters.occupation]
          : [],
      },
    });

    await searchFilter.save();

    res.status(201).json({
      success: true,
      message: "Search filter saved successfully",
      data: searchFilter,
    });
  } catch (error) {
    console.error("Error saving search filter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save search filter",
      error: error.message,
    });
  }
};

export const getSavedSearches = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedSearches = await SearchFilter.find({
      user: userId,
      isActive: true,
    })
      .sort({ lastUsed: -1 })
      .select("name filters lastUsed createdAt")
      .lean();

    res.status(200).json({
      success: true,
      data: savedSearches,
    });
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved searches",
      error: error.message,
    });
  }
};

export const getSavedSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const savedSearch = await SearchFilter.findOne({
      _id: id,
      user: userId,
      isActive: true,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    // Update last used timestamp
    savedSearch.lastUsed = new Date();
    await savedSearch.save();

    res.status(200).json({
      success: true,
      data: savedSearch,
    });
  } catch (error) {
    console.error("Error fetching saved search:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved search",
      error: error.message,
    });
  }
};

export const deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const savedSearch = await SearchFilter.findOneAndUpdate(
      {
        _id: id,
        user: userId,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: "Saved search not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Saved search deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting saved search:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete saved search",
      error: error.message,
    });
  }
};
