import User from "../models/User.js";
import Interest from "../models/Interest.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import Interaction from "../models/Interaction.js";
// Get activity dashboard data

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
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
export const getActivityDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get accepted interests count
    const acceptedInterests = await Interest.countDocuments({
      targetUser: userId,
      status: "accepted",
    });

    // Get interests received count
    const interestsReceived = await Interest.countDocuments({
      targetUser: userId,
    });

    // Get interests sent count
    const interestsSent = await Interest.countDocuments({
      fromUser: userId,
    });

    // Get shortlisted profiles count from User model
    const shortlistedProfiles = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $project: { shortlistedCount: { $size: "$shortlists" } } },
    ]);

    // Get declined interests count
    const declinedInterests = await Interest.countDocuments({
      targetUser: userId,
      status: "declined",
    });

    // Get UP Match Hour data
    const upMatchHour = {
      title: "UP Match Hour",
      date: "12 Oct, Sun",
      time: "08:00 PM - 09:00 PM",
      registeredCount: 13127,
      participants: [
        { name: "A", avatar: "A" },
        { name: "B", avatar: "B" },
        { name: "C", avatar: "C" },
      ],
    };

    // Get online matches
    const onlineMatches = await User.find({
      _id: { $ne: userId },
      isOnline: true,
    })
      .limit(22)
      .select("name profileImage customId");

    // Get profile visit stats
    const profileVisits = await Notification.countDocuments({
      userId: userId,
      type: "profile_view",
    });

    res.status(200).json({
      success: true,
      data: {
        activityCards: {
          acceptedInterests,
          interestsReceived,
          interestsSent,
          shortlistedProfiles: shortlistedProfiles[0]?.shortlistedCount || 0,
          declinedInterests,
        },
        upMatchHour,
        onlineMatches: onlineMatches.map((match) => ({
          name: match.name,
          avatar: match.name.charAt(0),
          customId: match.customId,
          profileImage: match.profileImage,
        })),
        profileVisits,
      },
    });
  } catch (error) {
    console.error("Error fetching activity dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity dashboard",
      error: error.message,
    });
  }
};

// Get shortlisted profiles with details
export const getShortlistedProfiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const result = await User.aggregate([
      // Match the current user
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },

      // Unwind the shortlists array to work with individual documents
      { $unwind: "$shortlists" },

      // Sort by shortlistedAt date (most recent first)
      { $sort: { "shortlists.shortlistedAt": -1 } },

      // Lookup user details for each shortlisted user
      {
        $lookup: {
          from: "users",
          localField: "shortlists.userId",
          foreignField: "_id",
          as: "shortlistedUser",
        },
      },

      // Unwind the shortlistedUser array (since lookup returns an array)
      { $unwind: "$shortlistedUser" },

      // Project the fields we need
      {
        $project: {
          _id: "$shortlistedUser._id",
          name: "$shortlistedUser.name",
          dob: "$shortlistedUser.dob",
          profileImage: "$shortlistedUser.profileImage",
          customId: "$shortlistedUser.customId",
          occupation: "$shortlistedUser.occupation",
          education: "$shortlistedUser.education",
          location: "$shortlistedUser.location",
          city: "$shortlistedUser.city",
          state: "$shortlistedUser.state",
          maritalStatus: "$shortlistedUser.maritalStatus",
          height: "$shortlistedUser.height",
          religion: "$shortlistedUser.religion",
          caste: "$shortlistedUser.caste",
          isOnline: "$shortlistedUser.isOnline",
          lastSeen: "$shortlistedUser.lastSeen",
          shortlistedAt: "$shortlists.shortlistedAt",
        },
      },

      // Group back to get total count and apply pagination
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          profiles: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }

    const totalCount = result[0].metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const profiles = result[0].data.map((profile) => ({
      ...profile,
      id: profile._id,
      age: profile.dob ? calculateAge(profile.dob) : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        profiles,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching shortlisted profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shortlisted profiles",
      error: error.message,
    });
  }
};

// Get interests received with details
export const getInterestsReceived = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { targetUser: userId };
    if (status && status !== "all") {
      query.status = status;
    }

    const interests = await Interaction.find(query)
      .populate(
        "fromUser",
        "name age profileImage customId occupation education location city state maritalStatus isOnline lastSeen"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Interaction.countDocuments(query);

    const interestsData = interests.map((interest) => ({
      id: interest._id,
      fromUser: {
        id: interest.fromUser._id,
        name: interest.fromUser.name,
        age: interest.fromUser.age,
        profileImage: interest.fromUser.profileImage,
        customId: interest.fromUser.customId,
        occupation: interest.fromUser.occupation,
        education: interest.fromUser.education,
        location: interest.fromUser.location,
        city: interest.fromUser.city,
        state: interest.fromUser.state,
        maritalStatus: interest.fromUser.maritalStatus,
        isOnline: interest.fromUser.isOnline,
        lastSeen: interest.fromUser.lastSeen,
      },
      type: interest.type,
      status: interest.status,
      message: interest.message,
      isRead: interest.isRead,
      createdAt: interest.createdAt,
      respondedAt: interest.respondedAt,
      responseMessage: interest.responseMessage,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        interests: interestsData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching interests received:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interests received",
      error: error.message,
    });
  }
};

// Get interests sent with details
export const getInterestsSent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build match stage
    const matchStage = { fromUser: new mongoose.Types.ObjectId(userId) };
    if (status && status !== "all") {
      matchStage.status = status;
    }

    const aggregationPipeline = [
      // Match interactions for the current user
      { $match: matchStage },

      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "toUser",
          foreignField: "_id",
          as: "targetUser",
        },
      },

      // Unwind the targetUser array (will create separate documents)
      { $unwind: { path: "$targetUser", preserveNullAndEmptyArrays: false } },

      // Project the fields we need
      {
        $project: {
          type: 1,
          status: 1,
          message: 1,
          isRead: 1,
          createdAt: 1,
          respondedAt: 1,
          responseMessage: 1,
          "targetUser._id": 1,
          "targetUser.name": 1,
          "targetUser.dob": 1,
          "targetUser.profileImage": 1,
          "targetUser.customId": 1,
          "targetUser.occupation": 1,
          "targetUser.education": 1,
          "targetUser.location": 1,
          "targetUser.city": 1,
          "targetUser.state": 1,
          "targetUser.maritalStatus": 1,
          "targetUser.isOnline": 1,
          "targetUser.lastSeen": 1,
        },
      },

      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },

      // Facet for pagination metadata
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
        },
      },
    ];

    const result = await Interaction.aggregate(aggregationPipeline);

    // Process the results
    const totalCount = result[0]?.metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const interactionsData = result[0]?.data || [];

    const interestsData = interactionsData.map((interest) => {
      const age = interest.targetUser.dob
        ? calculateAge(interest.targetUser.dob)
        : null;

      return {
        id: interest._id,
        targetUser: {
          id: interest.targetUser._id,
          name: interest.targetUser.name,
          age: age,
          profileImage: interest.targetUser.profileImage,
          customId: interest.targetUser.customId,
          occupation: interest.targetUser.occupation,
          education: interest.targetUser.education,
          location: interest.targetUser.location,
          city: interest.targetUser.city,
          state: interest.targetUser.state,
          maritalStatus: interest.targetUser.maritalStatus,
          isOnline: interest.targetUser.isOnline,
          lastSeen: interest.targetUser.lastSeen,
        },
        type: interest.type,
        status: interest.status,
        message: interest.message,
        isRead: interest.isRead,
        createdAt: interest.createdAt,
        respondedAt: interest.respondedAt,
        responseMessage: interest.responseMessage,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        interests: interestsData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching interests sent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interests sent",
      error: error.message,
    });
  }
};

// Get online matches
export const getOnlineMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 22 } = req.query;

    const onlineMatches = await User.find({
      _id: { $ne: userId },
      isOnline: true,
    })
      .limit(parseInt(limit))
      .select("name profileImage customId isOnline lastSeen")
      .sort({ lastSeen: -1 });

    res.status(200).json({
      success: true,
      data: onlineMatches.map((match) => ({
        id: match._id,
        name: match.name,
        customId: match.customId,
        profileImage: match.profileImage,
        isOnline: match.isOnline,
        lastSeen: match.lastSeen,
      })),
    });
  } catch (error) {
    console.error("Error fetching online matches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch online matches",
      error: error.message,
    });
  }
};

// Get activity summary (combined data for dashboard)
export const getActivitySummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all counts in parallel for better performance
    const [
      acceptedInterests,
      interestsReceived,
      interestsSent,
      declinedInterests,
      user,
    ] = await Promise.all([
      Interaction.countDocuments({ targetUser: userId, status: "accepted" }),
      Interaction.countDocuments({ targetUser: userId }),
      Interaction.countDocuments({ fromUser: userId }),
      Interaction.countDocuments({ targetUser: userId, status: "declined" }),
      User.findById(userId).select("shortlists"),
    ]);

    const shortlistedProfiles = user.shortlists.length;

    // Get recent shortlisted profiles (limit 3 for summary)
    const recentShortlisted = await User.findById(userId).populate({
      path: "shortlists.userId",
      select: "name age profileImage customId occupation education location",
      options: { limit: 3, sort: { shortlistedAt: -1 } },
    });

    const shortlistedProfilesData = recentShortlisted.shortlists
      .slice(0, 3)
      .map((shortlist) => ({
        id: shortlist.userId._id,
        name: shortlist.userId.name,
        age: shortlist.userId.age,
        profileImage: shortlist.userId.profileImage,
        customId: shortlist.userId.customId,
        occupation: shortlist.userId.occupation,
        education: shortlist.userId.education,
        location: shortlist.userId.location,
        shortlistedAt: shortlist.shortlistedAt,
      }));

    // Get recent Interactions received (limit 2 for summary)
    const recentInteractionsReceived = await Interaction.find({
      targetUser: userId,
    })
      .populate("fromUser", "name profileImage customId occupation")
      .sort({ createdAt: -1 })
      .limit(2);

    const interestsReceivedData = recentInteractionsReceived.map(
      (interest) => ({
        id: interest._id,
        fromUser: {
          id: interest.fromUser._id,
          name: interest.fromUser.name,
          profileImage: interest.fromUser.profileImage,
          customId: interest.fromUser.customId,
          occupation: interest.fromUser.occupation,
        },
        type: interest.type,
        status: interest.status,
        createdAt: interest.createdAt,
      })
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          acceptedInterests,
          interestsReceived,
          interestsSent,
          shortlistedProfiles,
          declinedInterests,
        },
        recentShortlisted: shortlistedProfilesData,
        recentInterestsReceived: interestsReceivedData,
      },
    });
  } catch (error) {
    console.error("Error fetching activity summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity summary",
      error: error.message,
    });
  }
};
