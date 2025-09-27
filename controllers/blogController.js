import Blog from "../models/Blog.js";
import User from "../models/User.js";

// Create blog post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      images,
      videos,
      metaTitle,
      metaDescription,
      keywords,
      status = "draft",
      isFeatured = false,
      isPinned = false,
      publishedAt,
      scheduledAt,
      relatedPosts
    } = req.body;

    const author = req.user._id;

    const blogPost = await Blog.create({
      title,
      content,
      excerpt,
      author,
      category,
      tags,
      featuredImage,
      images,
      videos,
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isPinned,
      publishedAt,
      scheduledAt,
      relatedPosts
    });

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blogPost
    });

  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating blog post",
      error: error.message
    });
  }
};

// Get all blog posts
export const getBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "published",
      category,
      tags,
      featured,
      pinned,
      author,
      sortBy = "publishedAt",
      sortOrder = "desc",
      search
    } = req.query;

    let filters = {};

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.category = category;
    }

    if (tags) {
      filters.tags = { $in: tags.split(",") };
    }

    if (featured === "true") {
      filters.isFeatured = true;
    }

    if (pinned === "true") {
      filters.isPinned = true;
    }

    if (author) {
      filters.author = author;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const posts = await Blog.find(filters)
      .populate("author", "name profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Blog.countDocuments(filters);

    res.status(200).json({
      success: true,
      message: "Blog posts fetched successfully",
      data: {
        posts,
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
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog posts",
      error: error.message
    });
  }
};

// Get single blog post
export const getBlogPost = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Blog.findOne({ slug })
      .populate("author", "name profileImage")
      .populate("relatedPosts", "title slug featuredImage publishedAt");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    // Increment views
    await Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      message: "Blog post fetched successfully",
      data: post
    });

  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog post",
      error: error.message
    });
  }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const updateData = req.body;

    const post = await Blog.findByIdAndUpdate(
      postId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: post
    });

  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating blog post",
      error: error.message
    });
  }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Blog.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully"
    });

  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting blog post",
      error: error.message
    });
  }
};

// Like blog post
export const likeBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post liked successfully",
      data: { likes: post.likes }
    });

  } catch (error) {
    console.error("Like blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking blog post",
      error: error.message
    });
  }
};

// Share blog post
export const shareBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.body;

    const post = await Blog.findByIdAndUpdate(
      postId,
      { $inc: { shares: 1, [`socialShares.${platform}`]: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post shared successfully",
      data: { shares: post.shares }
    });

  } catch (error) {
    console.error("Share blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sharing blog post",
      error: error.message
    });
  }
};

// Get featured blog posts
export const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await Blog.find({
      isFeatured: true,
      status: "published"
    })
    .populate("author", "name profileImage")
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Featured blog posts fetched successfully",
      data: posts
    });

  } catch (error) {
    console.error("Get featured posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured posts",
      error: error.message
    });
  }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: "Blog categories fetched successfully",
      data: categories
    });

  } catch (error) {
    console.error("Get blog categories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog categories",
      error: error.message
    });
  }
};

// Get popular blog posts
export const getPopularPosts = async (req, res) => {
  try {
    const { limit = 10, timeframe = "30" } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const posts = await Blog.find({
      status: "published",
      publishedAt: { $gte: daysAgo }
    })
    .populate("author", "name profileImage")
    .sort({ views: -1, likes: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Popular blog posts fetched successfully",
      data: posts
    });

  } catch (error) {
    console.error("Get popular posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching popular posts",
      error: error.message
    });
  }
};

// Get blog statistics
export const getBlogStats = async (req, res) => {
  try {
    const totalPosts = await Blog.countDocuments({ status: "published" });
    const totalViews = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const authorStats = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: "Blog statistics fetched successfully",
      data: {
        totalPosts,
        totalViews: totalViews[0]?.totalViews || 0,
        categoryStats,
        authorStats
      }
    });

  } catch (error) {
    console.error("Get blog stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog statistics",
      error: error.message
    });
  }
};
