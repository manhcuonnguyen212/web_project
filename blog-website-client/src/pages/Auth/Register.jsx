import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import { BASE_URL } from "../../config/index";
import {
  registerStart,
  registerSuccess,
  registerFailed,
} from "../../redux/authSlice";

import "./Auth.css";
function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    dispatch(registerStart())
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        username: name,
      });
      const result = res.data;

      if (result.success) {
        toast.success(result.message);
        dispatch(registerSuccess())
        navigate("/login");
      }
    } catch (error) {
      dispatch(registerFailed())
      return toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <FaUserPlus />
            </div>
            <h1 className="auth-title">Tạo tài khoản mới</h1>
            <p className="auth-subtitle">
              Đăng ký để bắt đầu chia sẻ câu chuyện của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FaUser className="label-icon" />
                Họ và tên
              </label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="label-icon" />
                Email
              </label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock className="label-icon" />
                Mật khẩu
              </label>
              <div className="password-input-wrapper">
                <input
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FaLock className="label-icon" />
                Xác nhận mật khẩu
              </label>
              <div className="password-input-wrapper">
                <input
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-terms">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="/terms" className="terms-link">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a href="/privacy" className="terms-link">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Tạo tài khoản
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Đã có tài khoản?{" "}
              <Link to="/login" className="auth-link">
                <FaSignInAlt /> Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}

export default Register;
