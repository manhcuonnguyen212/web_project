import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import { BASE_URL } from "../../config/index";
import { loginStart, loginSuccess, loginFailed } from "../../redux/authSlice";

import "./Auth.css";
function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const result = res.data;

      if (result.success) {
        
        // Lưu thông tin user vào redux
        dispatch(loginSuccess(result.data));

        toast.success(result.message || "Đăng nhập thành công!");
        // Refresh page và navigate
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error) {
      dispatch(loginFailed());
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
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
              <FaSignInAlt />
            </div>
            <h1 className="auth-title">Chào mừng trở lại</h1>
            <p className="auth-subtitle">
              Đăng nhập để tiếp tục khám phá nội dung
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Nhập mật khẩu"
                  required
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

            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forget-password" className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản?{" "}
              <Link to="/register" className="auth-link">
                <FaUserPlus /> Đăng ký ngay
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

export default Login;
