import ProfileAnalytics from "../models/ProfileAnalytics.js";
import User from "../models/User.js";
import Interaction from "../models/Interaction.js";

// Get profile analytics
export const getProfileAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "30" } = req.query; // days

    let analytics = await ProfileAnalytics.findOne({ user: userId });
    
    if (!analytics) {
      // Create new analytics record
      analytics = await ProfileAnalytics.create({ user: userId });
    }

    // Calculate period-based analytics
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get recent interactions
    const recentInteractions = await Interaction.find({
      toUser: userId,
      createdAt: { $gte: daysAgo }
    });

    // Calculate metrics
    const totalViews = recentInteractions.filter(i => i.type === "visit").length;
    const totalLikes = recentInteractions.filter(i => i.type === "like").length;
    const totalSuperLikes = recentInteractions.filter(i => i.type === "superlike").length;
    const totalFavourites = recentInteractions.filter(i => i.type === "favourite").length;

    // Get profile quality score
    const user = await User.findById(userId);
    const qualityScore = calculateProfileQualityScore(user);

    // Update analytics
    analytics.totalViews += totalViews;
    analytics.totalLikes += totalLikes;
    analytics.totalSuperLikes += totalSuperLikes;
    analytics.totalFavourites += totalFavourites;
    analytics.qualityScore = qualityScore;
    analytics.lastUpdated = new Date();

    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Profile analytics fetched successfully",
      data: {
        totalViews: analytics.totalViews,
        totalLikes: analytics.totalLikes,
        totalSuperLikes: analytics.totalSuperLikes,
        totalFavourites: analytics.totalFavourites,
        qualityScore: analytics.qualityScore,
        recentActivity: {
          views: totalViews,
          likes: totalLikes,
          superLikes: totalSuperLikes,
          favourites: totalFavourites
        },
        period: `${period} days`
      }
    });

  } catch (error) {
    console.error("Get profile analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile analytics",
      error: error.message
    });
  }
};

// Get detailed analytics
export const getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = "30" } = req.query;

    const analytics = await ProfileAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this user"
      });
    }

    // Get views by day for the specified period
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const viewsByDay = await Interaction.aggregate([
      {
        $match: {
          toUser: userId,
          type: "visit",
          createdAt: { $gte: daysAgo }
        }
      },
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
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Get views by age group
    const viewsByAgeGroup = await Interaction.aggregate([
      {
        $match: {
          toUser: userId,
          type: "visit"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "viewer"
        }
      },
      {
        $unwind: "$viewer"
      },
      {
        $addFields: {
          age: {
            $subtract: [
              { $year: new Date() },
              { $year: "$viewer.dob" }
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 25, 30, 35, 40, 50, 100],
          default: "50+",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Get views by location
    const viewsByLocation = await Interaction.aggregate([
      {
        $match: {
          toUser: userId,
          type: "visit"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "fromUser",
          foreignField: "_id",
          as: "viewer"
        }
      },
      {
        $unwind: "$viewer"
      },
      {
        $group: {
          _id: "$viewer.location",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Detailed analytics fetched successfully",
      data: {
        overview: {
          totalViews: analytics.totalViews,
          totalLikes: analytics.totalLikes,
          totalSuperLikes: analytics.totalSuperLikes,
          totalFavourites: analytics.totalFavourites,
          qualityScore: analytics.qualityScore
        },
        viewsByDay,
        viewsByAgeGroup,
        viewsByLocation,
        period: `${period} days`
      }
    });

  } catch (error) {
    console.error("Get detailed analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching detailed analytics",
      error: error.message
    });
  }
};

// Get analytics insights
export const getAnalyticsInsights = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await ProfileAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found for this user"
      });
    }

    const user = await User.findById(userId);
    const insights = [];

    // Profile completion insights
    if (user.profileCompletion < 80) {
      insights.push({
        type: "warning",
        title: "Profile Incomplete",
        message: `Your profile is ${user.profileCompletion}% complete. Complete your profile to get more matches.`,
        action: "Complete Profile"
      });
    }

    // Photo insights
    if (!user.profileImage) {
      insights.push({
        type: "warning",
        title: "No Profile Photo",
        message: "Add a profile photo to increase your chances of getting matches by 3x.",
        action: "Add Photo"
      });
    }

    // Activity insights
    if (analytics.totalViews < 10) {
      insights.push({
        type: "info",
        title: "Low Profile Views",
        message: "Your profile has low visibility. Consider updating your preferences or adding more photos.",
        action: "Update Profile"
      });
    }

    // Quality score insights
    if (analytics.qualityScore < 70) {
      insights.push({
        type: "warning",
        title: "Profile Quality",
        message: "Your profile quality score is below average. Focus on completing all sections.",
        action: "Improve Profile"
      });
    }

    // Positive insights
    if (analytics.totalLikes > 5) {
      insights.push({
        type: "success",
        title: "Great Engagement",
        message: "Your profile is getting good engagement! Keep it up.",
        action: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Analytics insights fetched successfully",
      data: {
        insights,
        qualityScore: analytics.qualityScore,
        profileCompletion: user.profileCompletion
      }
    });

  } catch (error) {
    console.error("Get analytics insights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics insights",
      error: error.message
    });
  }
};

// Update analytics
export const updateAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, targetUserId } = req.body;

    let analytics = await ProfileAnalytics.findOne({ user: userId });
    if (!analytics) {
      analytics = await ProfileAnalytics.create({ user: userId });
    }

    // Update based on interaction type
    switch (type) {
      case "view":
        analytics.totalViews += 1;
        break;
      case "like":
        analytics.totalLikes += 1;
        break;
      case "superlike":
        analytics.totalSuperLikes += 1;
        break;
      case "favourite":
        analytics.totalFavourites += 1;
        break;
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Analytics updated successfully"
    });

  } catch (error) {
    console.error("Update analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating analytics",
      error: error.message
    });
  }
};

// Helper function to calculate profile quality score
function calculateProfileQualityScore(user) {
  let score = 0;
  let totalWeight = 0;

  // Basic information (40% weight)
  const basicInfoWeight = 40;
  totalWeight += basicInfoWeight;
  if (user.name && user.email && user.phoneNumber) score += basicInfoWeight * 0.3;
  if (user.dob) score += basicInfoWeight * 0.2;
  if (user.location) score += basicInfoWeight * 0.2;
  if (user.occupation) score += basicInfoWeight * 0.3;

  // Photos (25% weight)
  const photosWeight = 25;
  totalWeight += photosWeight;
  if (user.profileImage) score += photosWeight * 0.6;
  if (user.photos && user.photos.length > 0) score += photosWeight * 0.4;

  // About section (15% weight)
  const aboutWeight = 15;
  totalWeight += aboutWeight;
  if (user.about && user.about.length > 50) score += aboutWeight;

  // Interests (10% weight)
  const interestsWeight = 10;
  totalWeight += interestsWeight;
  if (user.interests && user.interests.length > 0) score += interestsWeight;

  // Preferences (10% weight)
  const preferencesWeight = 10;
  totalWeight += preferencesWeight;
  if (user.preferences) score += preferencesWeight;

  return Math.round((score / totalWeight) * 100);
}
