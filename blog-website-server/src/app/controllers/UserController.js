import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { sendMail } from "../../services/mailService.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
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

    const { page = 1, limit = 10, search = "" } = req.query;

    // Query cơ bản: loại bỏ admin và supervisor admin
    let query = { role: { $nin: ["admin", "supervisor admin"] } };

    // Nếu có search thì thêm điều kiện
    if (search) {
      query = {
        ...query,
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await UserModel.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await UserModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
  }
};

export const changeUserInfo = async (req, res) => {
  const userId = req.user._id;
  const { username, year, address, phone, email } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (year) user.year = year;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (email) user.email = email;

    await user.save();

    // Return user without password
    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: rest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu",
      error: error.message,
    });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    // Generate random password (8 characters)
    const randomPassword = Math.random().toString(36).slice(-8);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Send email with new password
    const emailSubject = "Khôi phục mật khẩu - MyBlog";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MyBlog</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Xin chào ${
            user.username
          },</h2>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Mật khẩu mới của bạn:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace;">
              ${randomPassword}
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Vui lòng đăng nhập bằng mật khẩu mới này và đổi lại mật khẩu trong phần cài đặt tài khoản.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:5173"
            }/login" 
               style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Đăng nhập ngay
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              <strong>Lưu ý:</strong> Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 MyBlog. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendMail(email, emailSubject, emailHtml);

    return res.status(200).json({
      success: true,
      message: "Mật khẩu mới đã được gửi đến email của bạn",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// admin apis
export const toggleStatus = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { userId } = req.params;

  try {
    // Check if admin exists
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check if user has admin role
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Find the user to toggle status
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Toggle status logic
    if (user.status === "blocked") {
      // Restore to previous status (active or offline)
      user.status = user.previousStatus || "active";
    } else {
      // Save current status before blocking
      user.previousStatus = user.status;
      user.status = "blocked";
    }

    await user.save();

    // Return user without password
    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: rest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { userId } = req.params;
  const { username, email, year, phone, address } = req.body;

  try {
    // Check if admin exists
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check if user has admin role
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Find the user to update
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (year !== undefined) user.year = year;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    // Return user without password
    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      data: rest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { userId } = req.params;

  try {
    // Check if admin exists
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Check if user has admin role
    if (role === "user") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Find the user to delete
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent deleting admin or supervisor admin accounts
    if (user.role === "admin" || user.role === "supervisor admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản quản trị viên",
      });
    }

    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdmins = async (req, res) => {
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

    // Get all admin users (including supervisor admin)
    const admins = await UserModel.find({
      role: { $in: ["admin", "supervisor admin"] },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    // Sort to put supervisor admin first
    admins.sort((a, b) => {
      if (a.role === "supervisor admin" && b.role !== "supervisor admin")
        return -1;
      if (a.role !== "supervisor admin" && b.role === "supervisor admin")
        return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change password for admin - sends random password via email (Supervisor Admin only, or self with current password)
export const changePasswordAdmin = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { targetAdminId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Find target user
    const targetUser = await UserModel.findById(targetAdminId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Check if editing self
    const isEditingSelf = adminId.toString() === targetAdminId;

    // If editing self, require current password and new password
    if (isEditingSelf) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        targetUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      targetUser.password = hashedPassword;
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    }

    // If not editing self, only supervisor admin can reset passwords
    if (role !== "supervisor admin") {
      return res.status(403).json({
        success: false,
        message:
          "Chỉ supervisor admin mới có quyền đặt lại mật khẩu người khác",
      });
    }

    // Generate random password (8 characters)
    const randomPassword = Math.random().toString(36).slice(-8);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    targetUser.password = hashedPassword;
    await targetUser.save();

    // Send email with new password
    const emailSubject = "Đặt lại mật khẩu - MyBlog Admin";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MyBlog Admin</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Xin chào ${
            targetUser.username
          },</h2>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Mật khẩu của bạn đã được đặt lại bởi Supervisor Admin.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Mật khẩu mới của bạn:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace;">
              ${randomPassword}
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Vui lòng đăng nhập bằng mật khẩu mới này và đổi lại mật khẩu trong phần cài đặt tài khoản.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.ADMIN_URL || "http://localhost:5174"
            }/admin/login" 
               style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Đăng nhập Admin
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 MyBlog. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendMail(targetUser.email, emailSubject, emailHtml);

    res.status(200).json({
      success: true,
      message: "Mật khẩu mới đã được gửi đến email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new admin (Supervisor Admin only)
export const createAdmin = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { username, email, adminRole } = req.body;

  try {
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Only supervisor admin can create admins
    if (role !== "supervisor admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ supervisor admin mới có quyền tạo quản trị viên",
      });
    }

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Create new admin
    const newAdmin = new UserModel({
      username,
      email,
      password: hashedPassword,
      role: adminRole === "admin" ? "admin" : "admin",
      status: "active",
    });

    await newAdmin.save();

    // Send email with password
    const emailSubject = "Tài khoản Admin - MyBlog";
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">MyBlog Admin</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Xin chào ${username},</h2>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Tài khoản quản trị viên của bạn đã được tạo thành công.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Email: <strong>${email}</strong></p>
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Mật khẩu:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace;">
              ${randomPassword}
            </p>
          </div>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Vui lòng đăng nhập và đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.ADMIN_URL || "http://localhost:5174"
            }/admin/login" 
               style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Đăng nhập Admin
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 MyBlog. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendMail(email, emailSubject, emailHtml);

    res.status(201).json({
      success: true,
      message: "Tạo quản trị viên thành công. Thông tin đã được gửi qua email.",
      data: {
        _id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Edit admin info (Supervisor Admin only, or self-edit)
export const editAdmin = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { targetAdminId } = req.params;
  const { username, email } = req.body;

  try {
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Find target admin
    const targetAdmin = await UserModel.findById(targetAdminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quản trị viên",
      });
    }

    // Check permissions: allow if editing self OR if supervisor admin
    const isEditingSelf = adminId.toString() === targetAdminId;
    const isSupervisorAdmin = role === "supervisor admin";

    if (!isEditingSelf && !isSupervisorAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể chỉnh sửa thông tin của chính mình",
      });
    }

    // Prevent non-supervisor from editing supervisor admin
    if (!isEditingSelf && targetAdmin.role === "supervisor admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể chỉnh sửa supervisor admin",
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== targetAdmin.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }
      targetAdmin.email = email;
    }

    // Update fields
    if (username) targetAdmin.username = username;

    await targetAdmin.save();

    // Return without password
    const { password, ...rest } = targetAdmin._doc;

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin quản trị viên thành công",
      data: rest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAdmin = async (req, res) => {
  const adminId = req.user._id;
  const role = req.user.role;
  const { targetAdminId } = req.params;

  try {
    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Only supervisor admin can delete admins
    if (role !== "supervisor admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ supervisor admin mới có quyền xóa quản trị viên",
      });
    }

    // Prevent deleting self
    if (adminId.toString() === targetAdminId) {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa tài khoản của chính mình",
      });
    }

    // Find target admin
    const targetAdmin = await UserModel.findById(targetAdminId);
    if (!targetAdmin) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quản trị viên",
      });
    }

    // Verify target is admin (not supervisor admin)
    if (targetAdmin.role === "user") {
      return res.status(400).json({
        success: false,
        message: "Người dùng này không phải là quản trị viên",
      });
    }

    // Prevent deleting supervisor admin
    if (targetAdmin.role === "supervisor admin") {
      return res.status(403).json({
        success: false,
        message: "Không thể xóa supervisor admin",
      });
    }

    // Delete the admin
    await UserModel.findByIdAndDelete(targetAdminId);

    res.status(200).json({
      success: true,
      message: "Xóa quản trị viên thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
