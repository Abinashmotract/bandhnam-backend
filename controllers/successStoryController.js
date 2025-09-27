import SuccessStory from "../models/SuccessStory.js";
import User from "../models/User.js";

// Create success story
export const createSuccessStory = async (req, res) => {
  try {
    const {
      bride,
      groom,
      title,
      story,
      weddingDate,
      weddingLocation,
      weddingPhotos,
      howTheyMet,
      meetingDetails,
      testimonial,
      photos,
      videos,
      city,
      state,
      country,
      tags
    } = req.body;

    const successStory = await SuccessStory.create({
      bride,
      groom,
      title,
      story,
      weddingDate,
      weddingLocation,
      weddingPhotos,
      howTheyMet,
      meetingDetails,
      testimonial,
      photos,
      videos,
      city,
      state,
      country,
      tags
    });

    res.status(201).json({
      success: true,
      message: "Success story created successfully",
      data: successStory
    });

  } catch (error) {
    console.error("Create success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating success story",
      error: error.message
    });
  }
};

// Get all success stories
export const getSuccessStories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = "approved",
      featured,
      city,
      state,
      howTheyMet,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    let filters = { isPublic: true };
    
    if (status) {
      filters.status = status;
    }
    
    if (featured === "true") {
      filters.isFeatured = true;
    }
    
    if (city) {
      filters.city = { $regex: city, $options: "i" };
    }
    
    if (state) {
      filters.state = { $regex: state, $options: "i" };
    }
    
    if (howTheyMet) {
      filters.howTheyMet = howTheyMet;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const stories = await SuccessStory.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await SuccessStory.countDocuments(filters);

    res.status(200).json({
      success: true,
      message: "Success stories fetched successfully",
      data: {
        stories,
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
    console.error("Get success stories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success stories",
      error: error.message
    });
  }
};

// Get single success story
export const getSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await SuccessStory.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    // Increment views
    await SuccessStory.findByIdAndUpdate(storyId, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      message: "Success story fetched successfully",
      data: story
    });

  } catch (error) {
    console.error("Get success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success story",
      error: error.message
    });
  }
};

// Update success story
export const updateSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const updateData = req.body;

    const story = await SuccessStory.findByIdAndUpdate(
      storyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Success story updated successfully",
      data: story
    });

  } catch (error) {
    console.error("Update success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating success story",
      error: error.message
    });
  }
};

// Delete success story
export const deleteSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await SuccessStory.findByIdAndDelete(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Success story deleted successfully"
    });

  } catch (error) {
    console.error("Delete success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting success story",
      error: error.message
    });
  }
};

// Like success story
export const likeSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await SuccessStory.findByIdAndUpdate(
      storyId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Success story liked successfully",
      data: { likes: story.likes }
    });

  } catch (error) {
    console.error("Like success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking success story",
      error: error.message
    });
  }
};

// Share success story
export const shareSuccessStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { platform } = req.body; // facebook, twitter, whatsapp, etc.

    const story = await SuccessStory.findByIdAndUpdate(
      storyId,
      { $inc: { shares: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Success story shared successfully",
      data: { shares: story.shares }
    });

  } catch (error) {
    console.error("Share success story error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sharing success story",
      error: error.message
    });
  }
};

// Get featured success stories
export const getFeaturedStories = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const stories = await SuccessStory.find({
      isFeatured: true,
      isPublic: true,
      status: "approved",
      featuredUntil: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Featured success stories fetched successfully",
      data: stories
    });

  } catch (error) {
    console.error("Get featured stories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured stories",
      error: error.message
    });
  }
};

// Get success story statistics
export const getSuccessStoryStats = async (req, res) => {
  try {
    const totalStories = await SuccessStory.countDocuments({ status: "approved" });
    const featuredStories = await SuccessStory.countDocuments({ isFeatured: true });
    const totalViews = await SuccessStory.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const howTheyMetStats = await SuccessStory.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$howTheyMet", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const locationStats = await SuccessStory.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: "Success story statistics fetched successfully",
      data: {
        totalStories,
        featuredStories,
        totalViews: totalViews[0]?.totalViews || 0,
        howTheyMetStats,
        locationStats
      }
    });

  } catch (error) {
    console.error("Get success story stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching success story statistics",
      error: error.message
    });
  }
};
