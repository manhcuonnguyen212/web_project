import UserModel from '../models/UserModel.js';
import NewsModel from '../models/NewsModel.js';
import CommentModel from '../models/CommentModel.js';

export const commentNews = async (req, res) => {
  const userId = req.user?._id;
  const { newsId, content, parentId } = req.body;

  try {
    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để bình luận',
      });
    }

    // Validate required fields
    if (!newsId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa, không thể bình luận',
      });
    }

    // Check if news exists
    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    // If parentId provided, check if parent comment exists
    if (parentId) {
      const parentComment = await CommentModel.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận cha',
        });
      }
    }

    // Create new comment
    const newComment = new CommentModel({
      newsId,
      author: user.username,
      content: content.trim(),
      parentId: parentId || null,
      status: 'active',
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: 'Bình luận thành công',
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentsByNewsId = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id; // user hiện tại (nếu có)

    // Check if news exists
    const news = await NewsModel.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết',
      });
    }

    const skip = (page - 1) * limit;

    // Query chỉ lấy comment cha
    const query = {
      newsId,
      parentId: null,
      status: 'active',
    };

    const total = await CommentModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const comments = await CommentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Trả về comments với likedBy array
    const commentsWithLikes = comments.map((comment) => ({
      ...comment._doc,
      likes: comment.likedBy.length,
    }));

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithLikes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
        },
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bình luận',
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    // Check if user is the author or admin
    if (comment.author !== user.username && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này',
      });
    }

    // Soft delete: change status to deleted
    comment.status = 'deleted';
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Xóa bình luận thành công',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bình luận',
      error: error.message,
    });
  }
};

export const toggleLikeComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;

  try {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa, không thể thích bình luận',
      });
    }

    // Check if comment exists
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận',
      });
    }

    // Check if user already liked this comment
    const hasLiked = comment.likedBy.includes(userId);

    if (hasLiked) {
      // Unlike: remove user from likedBy array
      comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like: add user to likedBy array
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Đã bỏ thích' : 'Đã thích bình luận',
      data: {
        likes: comment.likes,
        hasLiked: !hasLiked,
        likedBy: comment.likedBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
