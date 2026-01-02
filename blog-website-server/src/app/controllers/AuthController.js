import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_ACCESSTOKEN_KEY,
    {
      expiresIn: "1800s", // 30 phút
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_REFRESHTOKEN_KEY,
    {
      expiresIn: "365d",
    }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hashSync(password, salt);

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
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

    // Create new user with default role 'user'
    const newUser = new UserModel({
      username,
      email,
      password: hash,
      role: "user",
      status: "active",
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Prevent login if user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị chặn. Vui lòng liên hệ quản trị viên.",
      });
    }

    user.status = "active";
    await user.save();

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const { password, ...rest } = user._doc;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    return res.status(200).json({
      success: true,
      message: "Login success",
      data: { ...rest, accessToken },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Set user status to offline
    user.status = "offline";
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logout success" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "You're not authenticated" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_KEY, (err, user) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Refreshtoken is invalid" });
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

      return res
        .status(200)
        .json({ success: true, accessToken: newAccessToken });
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// admin apis
export const adminLogin = async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.role === "user") {
      return res.status(500).json({
        success: false,
        message: "Account của bạn không đủ quyền để truy cập",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const { password, ...rest } = user._doc;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    return res.status(200).json({
      success: true,
      message: "Login success",
      data: { ...rest, accessToken },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminLogout = async (req, res) => {
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
    // Set user status to offline
    user.status = "offline";
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logout success" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
