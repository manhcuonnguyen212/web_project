import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  // check token
  if (token && token !== 'Bearer null') {
    const accessToken = token.split(' ')[1];
    // if token exist => verify

    jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_KEY, async (err, user) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Token is invalid' });
      }
      try {
        const UserModel = (await import('../app/models/UserModel.js')).default;
        const dbUser = await UserModel.findById(user._id);
        // Nếu là admin thì luôn cho phép truy cập
        if (!dbUser) {
          return res.status(403).json({ success: false, message: 'Tài khoản không tồn tại.' });
        }
        // Chỉ chặn user thường bị khoá, admin không bị khoá
        if (
          (dbUser.role === 'user') &&
          dbUser.status === 'blocked' &&
          req.originalUrl.indexOf('logout') === -1 // Nếu không phải API logout thì chặn
        ) {
          res.clearCookie('refreshToken', { httpOnly: true });
          return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá. Bạn đã bị đăng xuất. Vui lòng liên hệ quản trị viên.' });
        }
        req.user = user;
        next();
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Lỗi xác thực tài khoản.' });
      }
    });
  } else {
    return res.status(401).json({ success: false, message: "You're not authenticated" });
  }
};
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user._id === req.params.id || req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: "You're not authenticated" });
    }
  });
};
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin'|| req.user.role === 'supervisor admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: "You're not authenticated" });
    }
  });
};
