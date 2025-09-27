import Interaction from "../models/Interaction.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Like a profile
export const likeProfile = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot like your own profile"
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already liked
    const existingLike = await Interaction.findOne({
      fromUser: currentUserId,
      toUser: userId,
      type: "like"
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "Profile already liked"
      });
    }

    // Create like interaction
    const like = await Interaction.create({
      fromUser: currentUserId,
      toUser: userId,
      type: "like"
    });

    // Check for mutual like (match)
    const mutualLike = await Interaction.findOne({
      fromUser: userId,
      toUser: currentUserId,
      type: "like"
    });

    if (mutualLike) {
      // Create match notification for both users
      await Notification.create([
        {
          user: currentUserId,
          type: "match",
          title: "New Match!",
          message: `You and ${targetUser.name} liked each other!`,
          data: { matchedUserId: userId }
        },
        {
          user: userId,
          type: "match",
          title: "New Match!",
          message: `You and ${req.user.name} liked each other!`,
          data: { matchedUserId: currentUserId }
        }
      ]);
    } else {
      // Create like notification for target user
      await Notification.create({
        user: userId,
        type: "like",
        title: "Someone liked you!",
        message: `${req.user.name} liked your profile`,
        data: { likedByUserId: currentUserId }
      });
    }

    res.status(201).json({
      success: true,
      message: mutualLike ? "It's a match!" : "Profile liked successfully",
      data: { isMatch: !!mutualLike }
    });

  } catch (error) {
    console.error("Like profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking profile",
      error: error.message
    });
  }
};

// Super like a profile
export const superLikeProfile = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot super like your own profile"
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already super liked
    const existingSuperLike = await Interaction.findOne({
      fromUser: currentUserId,
      toUser: userId,
      type: "superlike"
    });

    if (existingSuperLike) {
      return res.status(400).json({
        success: false,
        message: "Profile already super liked"
      });
    }

    // Create super like interaction
    const superLike = await Interaction.create({
      fromUser: currentUserId,
      toUser: userId,
      type: "superlike"
    });

    // Create super like notification for target user
    await Notification.create({
      user: userId,
      type: "superlike",
      title: "Someone super liked you!",
      message: `${req.user.name} super liked your profile`,
      data: { superLikedByUserId: currentUserId }
    });

    res.status(201).json({
      success: true,
      message: "Profile super liked successfully"
    });

  } catch (error) {
    console.error("Super like profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while super liking profile",
      error: error.message
    });
  }
};

// Add to favourites
export const addToFavourites = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot add your own profile to favourites"
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already in favourites
    const existingFavourite = await Interaction.findOne({
      fromUser: currentUserId,
      toUser: userId,
      type: "favourite"
    });

    if (existingFavourite) {
      return res.status(400).json({
        success: false,
        message: "Profile already in favourites"
      });
    }

    // Create favourite interaction
    const favourite = await Interaction.create({
      fromUser: currentUserId,
      toUser: userId,
      type: "favourite"
    });

    res.status(201).json({
      success: true,
      message: "Profile added to favourites successfully"
    });

  } catch (error) {
    console.error("Add to favourites error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to favourites",
      error: error.message
    });
  }
};

// Remove from favourites
export const removeFromFavourites = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const favourite = await Interaction.findOneAndDelete({
      fromUser: currentUserId,
      toUser: userId,
      type: "favourite"
    });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: "Profile not found in favourites"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile removed from favourites successfully"
    });

  } catch (error) {
    console.error("Remove from favourites error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from favourites",
      error: error.message
    });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot block yourself"
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already blocked
    const existingBlock = await Interaction.findOne({
      fromUser: currentUserId,
      toUser: userId,
      type: "block"
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "User already blocked"
      });
    }

    // Create block interaction
    const block = await Interaction.create({
      fromUser: currentUserId,
      toUser: userId,
      type: "block"
    });

    // Remove any existing likes/superlikes between these users
    await Interaction.deleteMany({
      $or: [
        { fromUser: currentUserId, toUser: userId, type: { $in: ["like", "superlike"] } },
        { fromUser: userId, toUser: currentUserId, type: { $in: ["like", "superlike"] } }
      ]
    });

    res.status(201).json({
      success: true,
      message: "User blocked successfully"
    });

  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while blocking user",
      error: error.message
    });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const block = await Interaction.findOneAndDelete({
      fromUser: currentUserId,
      toUser: userId,
      type: "block"
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "User not found in blocked list"
      });
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully"
    });

  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while unblocking user",
      error: error.message
    });
  }
};

// Report a user
export const reportUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;
    const { reportReason, reportDescription } = req.body;

    if (currentUserId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot report yourself"
      });
    }

    if (!reportReason || !reportDescription) {
      return res.status(400).json({
        success: false,
        message: "Report reason and description are required"
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already reported
    const existingReport = await Interaction.findOne({
      fromUser: currentUserId,
      toUser: userId,
      type: "report"
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "User already reported"
      });
    }

    // Create report interaction
    const report = await Interaction.create({
      fromUser: currentUserId,
      toUser: userId,
      type: "report",
      reportReason,
      reportDescription
    });

    // Create notification for admins (you might want to create an admin notification system)
    await Notification.create({
      user: null, // This could be a system notification
      type: "admin",
      title: "New User Report",
      message: `${req.user.name} reported ${targetUser.name}`,
      data: { 
        reportId: report._id,
        reportedUserId: userId,
        reporterUserId: currentUserId,
        reason: reportReason
      }
    });

    res.status(201).json({
      success: true,
      message: "User reported successfully"
    });

  } catch (error) {
    console.error("Report user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reporting user",
      error: error.message
    });
  }
};

// Get interaction history
export const getInteractionHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { type, page = 1, limit = 20 } = req.query;

    let filters = { fromUser: currentUserId };
    if (type) {
      filters.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const interactions = await Interaction.find(filters)
      .populate("toUser", "name profileImage location occupation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Interaction.countDocuments(filters);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const history = interactions.map(interaction => ({
      _id: interaction._id,
      type: interaction.type,
      user: {
        _id: interaction.toUser._id,
        name: interaction.toUser.name,
        location: interaction.toUser.location,
        occupation: interaction.toUser.occupation,
        profileImage: interaction.toUser.profileImage ? 
          `${baseUrl}/${interaction.toUser.profileImage}` : null
      },
      createdAt: interaction.createdAt,
      status: interaction.status
    }));

    res.status(200).json({
      success: true,
      message: "Interaction history fetched successfully",
      data: {
        history,
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
    console.error("Get interaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interaction history",
      error: error.message
    });
  }
};

// Get who viewed my profile
export const getProfileViews = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const views = await Interaction.find({
      toUser: currentUserId,
      type: "visit"
    })
      .populate("fromUser", "name profileImage location occupation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Interaction.countDocuments({
      toUser: currentUserId,
      type: "visit"
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profileViews = views.map(view => ({
      _id: view._id,
      user: {
        _id: view.fromUser._id,
        name: view.fromUser.name,
        location: view.fromUser.location,
        occupation: view.fromUser.occupation,
        profileImage: view.fromUser.profileImage ? 
          `${baseUrl}/${view.fromUser.profileImage}` : null
      },
      viewedAt: view.createdAt
    }));

    res.status(200).json({
      success: true,
      message: "Profile views fetched successfully",
      data: {
        views: profileViews,
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
    console.error("Get profile views error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile views",
      error: error.message
    });
  }
};

// Get favourites list
export const getFavourites = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const favourites = await Interaction.find({
      fromUser: currentUserId,
      type: "favourite"
    })
      .populate("toUser", "name profileImage location occupation about")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Interaction.countDocuments({
      fromUser: currentUserId,
      type: "favourite"
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const favouritesList = favourites.map(favourite => ({
      _id: favourite._id,
      user: {
        _id: favourite.toUser._id,
        name: favourite.toUser.name,
        location: favourite.toUser.location,
        occupation: favourite.toUser.occupation,
        about: favourite.toUser.about,
        profileImage: favourite.toUser.profileImage ? 
          `${baseUrl}/${favourite.toUser.profileImage}` : null
      },
      addedAt: favourite.createdAt
    }));

    res.status(200).json({
      success: true,
      message: "Favourites fetched successfully",
      data: {
        favourites: favouritesList,
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
    console.error("Get favourites error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching favourites",
      error: error.message
    });
  }
};
