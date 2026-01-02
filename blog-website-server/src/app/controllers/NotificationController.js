import NotificationModel from "../models/NotificationModel.js";
import CommentModel from "../models/CommentModel.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    
    const userId = req.user._id;
    console.log("userId:", userId);
    
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    console.log("Fetching notifications for userId:", userId);
    
    const notifications = await NotificationModel.find({ recipient: userId })
      .populate("sender", "username")
      .populate("newsId", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Notifications fetched:", notifications.length);

    const total = await NotificationModel.countDocuments({ recipient: userId });
    const unreadCount = await NotificationModel.countDocuments({
      recipient: userId,
      isRead: false,
    });

    console.log("total:", total, "unreadCount:", unreadCount);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationModel.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu đã đọc",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await NotificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu tất cả là đã đọc",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await NotificationModel.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa thông báo",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to create notification (called from CommentController)
export const createNotification = async (data) => {
  try {
    const notification = new NotificationModel(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};
