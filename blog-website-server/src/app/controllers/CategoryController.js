import UserModel from "../models/UserModel.js";
import CategoryModel from "../models/CategoryModel.js";
import NewsModel from "../models/NewsModel.js";
import slugify from "slugify";

// Helper function to generate slug from name using slugify
const generateSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
  });
};

// Get all categories (Admin)
export const getAllCategories = async (req, res) => {
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

    const categories = await CategoryModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new category (Admin)
export const createCategory = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { name, description } = req.body;

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

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục là bắt buộc",
      });
    }

    // Check if category name already exists
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Danh mục này đã tồn tại",
      });
    }

    // Generate slug
    const slug = generateSlug(name);

    // Create new category
    const newCategory = new CategoryModel({
      name,
      slug,
      description: description || "",
      postCount: 0,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit category (Admin)
export const editCategory = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { categoryId } = req.params;
  const { name, description } = req.body;

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

    // Find category
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục này đã tồn tại",
        });
      }
      category.name = name;
      category.slug = generateSlug(name);
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category (Admin)
export const deleteCategory = async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  const { categoryId } = req.params;

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

    // Find category
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if category has posts
    const postsCount = await NewsModel.countDocuments({
      category: category.name,
    });

    if (postsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì có ${postsCount} bài viết đang sử dụng`,
      });
    }

    await CategoryModel.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category post count (Helper function - can be called internally)
export const updateCategoryPostCount = async (categoryName) => {
  try {
    const count = await NewsModel.countDocuments({
      category: categoryName,
      status: "published",
    });

    await CategoryModel.findOneAndUpdate(
      { name: categoryName },
      { postCount: count }
    );
  } catch (error) {
    console.error("Error updating category post count:", error);
  }
};
