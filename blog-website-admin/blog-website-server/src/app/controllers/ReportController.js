import ReportModel from '../models/ReportModel.js';
import UserModel from '../models/UserModel.js';
import NewsModel from '../models/NewsModel.js';
import CommentModel from '../models/CommentModel.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetType, targetId, reason, description } = req.body;

    // Validate required fields
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Check if target exists
    if (targetType === 'news') {
      const news = await NewsModel.findById(targetId);
      if (!news) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết',
        });
      }
    } else if (targetType === 'comment') {
      const comment = await CommentModel.findById(targetId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận',
        });
      }
    }

    // Check if user already reported this target
    const existingReport = await ReportModel.findOne({
      reporter: userId,
      targetType,
      targetId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã báo cáo nội dung này rồi',
      });
    }

    // Create new report
    const newReport = new ReportModel({
      reporter: userId,
      targetType,
      targetId,
      reason,
      description: description || '',
      status: 'pending',
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: 'Báo cáo của bạn đã được gửi',
      data: newReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all reports (Admin)
export const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, targetType } = req.query;
    const skip = (page - 1) * limit;

    // Build query filter
    const filter = {};
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    const reports = await ReportModel.find(filter)
      .populate('reporter', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate target info
    const reportsWithTarget = await Promise.all(
      reports.map(async (report) => {
        let targetInfo = null;
        if (report.targetType === 'news') {
          targetInfo = await NewsModel.findById(report.targetId).select('title');
        } else if (report.targetType === 'comment') {
          // Lấy cả newsId để tạo link đúng trên frontend
          targetInfo = await CommentModel.findById(report.targetId).select('content author newsId');
        }
        return {
          ...report.toObject(),
          targetInfo,
        };
      })
    );

    const total = await ReportModel.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        reports: reportsWithTarget,
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

// Update report status (Admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const report = await ReportModel.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete report (Admin)
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await ReportModel.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa báo cáo thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
