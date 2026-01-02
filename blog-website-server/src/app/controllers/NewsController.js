// Get monthly post stats for dashboard
export const getPostStats = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thisMonthCount = await NewsModel.countDocuments({
      createdAt: { $gte: thisMonth, $lt: nextMonth },
    });
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthCount = await NewsModel.countDocuments({
      createdAt: { $gte: lastMonth, $lt: lastMonthEnd },
    });
    let change = 0;
    if (lastMonthCount === 0) {
      change = thisMonthCount > 0 ? 0 : 0; // +0% if no data last month, as per dashboard convention
    } else {
      change = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }
    change = Math.round(change);
    res.status(200).json({
      success: true,
      data: {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        change: Math.round(change),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Upload ảnh đại diện bài viết
export async function uploadImage(req, res) {
  try {
    console.log("uploadImage called, req.user:", req.user);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file ảnh được upload' });
    }
    const url = `/uploads/news/${req.file.filename}`;
    return res.status(200).json({ success: true, url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
import NewsModel from "../models/NewsModel.js";
import UserModel from "../models/UserModel.js";

// Get news with pagination (limit = 6)
export const getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Fixed limit
    const skip = (page - 1) * limit;

    // Get filters from query
    const { category, status, search } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category && category !== "Tất cả") {
      query.category = category;
    }

    // Filter by status (default to published for public)
    if (status) {
      query.status = status;
    } else {
      query.status = "published"; // Default show only published
    }

    // Search by title or excerpt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await NewsModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get news with pagination
    const news = await NewsModel.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .select("-content"); // Exclude full content, only get metadata

    res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
        },
      },
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single news by ID
export const getNewsById = async (req, res) => {
  const { id } = req.params;
  const viewedKey = `viewed_${id}`;
  
  try {
    const news = await NewsModel.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Increment views only once per session
    // Check if this session already viewed this post
    if (!req.session) {
      req.session = {};
    }
    
    if (!req.session[viewedKey]) {
      news.views += 1;
      await news.save();
      req.session[viewedKey] = true;
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy bài viết",
      error: error.message,
    });
  }
};

// Toggle like news
export const toggleLikeNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await NewsModel.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const likedIndex = news.likedBy.indexOf(userId);

    if (likedIndex === -1) {
      // User chưa like -> thêm vào
      news.likedBy.push(userId);
      news.likes += 1;
    } else {
      // User đã like -> bỏ like
      news.likedBy.splice(likedIndex, 1);
      news.likes -= 1;
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: likedIndex === -1 ? "Đã thích bài viết" : "Đã bỏ thích",
      data: {
        likes: news.likes,
        likedBy: news.likedBy,
        isLiked: likedIndex === -1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle save news
export const toggleSaveNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const news = await NewsModel.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const savedIndex = news.savedBy.indexOf(userId);

    if (savedIndex === -1) {
      // User chưa lưu -> thêm vào
      news.savedBy.push(userId);
    } else {
      // User đã lưu -> bỏ lưu
      news.savedBy.splice(savedIndex, 1);
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: savedIndex === -1 ? "Đã lưu bài viết" : "Đã bỏ lưu",
      data: {
        savedBy: news.savedBy,
        isSaved: savedIndex === -1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// admin apis
export const getRecentNews = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  try {
    // Kiểm tra user tồn tại
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Chỉ cho phép admin
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Lấy 3 tin mới nhất (sắp xếp theo createdAt giảm dần)
    const recentNews = await NewsModel.find()
      .select("_id title authorName status views")
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json({
      success: true,
      message: "Lấy tin mới nhất thành công",
      data: recentNews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllNewsByAdmin = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Fixed limit
    const skip = (page - 1) * limit;

    // Get filters from query
    const { category, status, search } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category && category !== "Tất cả") {
      query.category = category;
    }

    // Filter by status - admin can see all statuses
    if (status && status !== "all") {
      query.status = status;
    }

    // Search by title or excerpt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await NewsModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get news with pagination
    const news = await NewsModel.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .select("-content"); // Exclude full content, only get metadata

    res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, authorName, status } = req.body;
    let thumbnail = req.body.thumbnail;
    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Validate content structure
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Content phải là array và có ít nhất 1 block",
      });
    }

    const newNews = new NewsModel({
      title,
      content,
      excerpt,
      thumbnail,
      category,
      authorName,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
    });

    await newNews.save();

    res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công",
      data: newNews,
    });
  } catch (error) {
    console.error("Create news error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo bài viết",
      error: error.message,
    });
  }
};

export const updateNews = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { id } = req.params;
  const updateData = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // If status changed to published, set publishedAt
    if (updateData.status === "published" && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedNews = await NewsModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công",
      data: updatedNews,
    });
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNews = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { id } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    const deletedNews = await NewsModel.findByIdAndDelete(id);

    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleNewsStatus = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { id } = req.params;

  try {
    // Check if admin exists
    const admin = await UserModel.findById(userId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check if user has admin role
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const news = await NewsModel.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Toggle logic:
    // - If published -> hidden
    // - If hidden or draft -> published
    if (news.status === "published") {
      news.status = "hidden";
    } else {
      news.status = "published";
      // Set publishedAt if not already set
      if (!news.publishedAt) {
        news.publishedAt = new Date();
      }
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: `Đã ${
        news.status === "published" ? "công khai" : "ẩn"
      } bài viết`,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
