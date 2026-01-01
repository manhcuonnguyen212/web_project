// Get monthly comment stats for dashboard
export const getCommentStats = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thisMonthCount = await CommentModel.countDocuments({
      createdAt: { $gte: thisMonth, $lt: nextMonth },
      status: { $ne: "deleted" },
    });
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthCount = await CommentModel.countDocuments({
      createdAt: { $gte: lastMonth, $lt: lastMonthEnd },
      status: { $ne: "deleted" },
    });
    let change = 0;
    if (lastMonthCount === 0) {
      // Nếu cả hai đều 0 thì là 0%, nếu tháng này > 0 thì không có dữ liệu so sánh, để là 0%
      change = 0;
    } else if (thisMonthCount === 0) {
      change = -100;
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
import UserModel from '../models/UserModel.js';
import NewsModel from '../models/NewsModel.js';
import CommentModel from '../models/CommentModel.js';
import { createNotification } from './NotificationController.js';

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
    // Validate min length
    if (content.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Bình luận phải có ít nhất 5 ký tự!',
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

    let parentAuthorId = null;
    // If parentId provided, check if parent comment exists
    if (parentId) {
      const parentComment = await CommentModel.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận cha',
        });
      }
      
      // Lấy author ID của parent comment để tạo notification
      const parentAuthor = await UserModel.findOne({ username: parentComment.author });
      if (parentAuthor) {
        parentAuthorId = parentAuthor._id;
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

    // Tạo notification nếu đây là reply (có parentId) và không phải tự reply chính mình
    if (parentId && parentAuthorId && parentAuthorId.toString() !== userId.toString()) {
      console.log('Creating notification for reply:', {
        recipient: parentAuthorId,
        sender: userId,
        type: 'comment_reply',
        newsId: newsId,
        commentId: newComment._id,
      });
      
      const notification = await createNotification({
        recipient: parentAuthorId,
        sender: userId,
        type: 'comment_reply',
        newsId: newsId,
        commentId: newComment._id,
        message: `${user.username} đã trả lời bình luận của bạn: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      });
      
      if (notification) {
        console.log('✅ Notification created successfully:', notification._id);
      } else {
        console.log('❌ Failed to create notification');
      }
    }

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

    // Validate newsId is a valid ObjectId
    const mongoose = (await import('mongoose')).default;
    if (!mongoose.Types.ObjectId.isValid(newsId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid newsId',
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

    const skip = (page - 1) * limit;

    // Query chỉ lấy comment cha
    const query = {
      newsId,
      parentId: null,
      status: 'active',
    };

    const total = await CommentModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const parentComments = await CommentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lấy replies cho mỗi parent comment
    const commentsWithReplies = await Promise.all(
      parentComments.map(async (comment) => {
        const replies = await CommentModel.find({
          newsId,
          parentId: comment._id,
          status: 'active',
        }).sort({ createdAt: 1 });

        return {
          ...comment._doc,
          likes: comment.likedBy.length,
          replies: replies.map((reply) => ({
            ...reply._doc,
            likes: reply.likedBy.length,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithReplies,
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

// Get all comments (for admin)
export const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await CommentModel.find({ status: { $ne: 'deleted' } })
      .populate('newsId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate author info manually
    const commentsWithAuthor = await Promise.all(
      comments.map(async (comment) => {
        const author = await UserModel.findOne({ username: comment.author });
        return {
          ...comment.toObject(),
          author: author ? { username: author.username, email: author.email } : null,
        };
      })
    );

    const total = await CommentModel.countDocuments({ status: { $ne: 'deleted' } });

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithAuthor,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
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
