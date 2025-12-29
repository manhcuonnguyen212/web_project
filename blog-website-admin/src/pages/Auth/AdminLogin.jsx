import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import { loginStart, loginSuccess, loginFailed } from "../../redux/authSlice";
import { BASE_URL } from "../../config/index";

import "./AdminLogin.css";
function AdminLogin() {
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(loginStart());
    try {
      const res = await axios.post(
        `${BASE_URL}/auth/admin/login`,
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
        dispatch(loginSuccess(result.data));
        toast.success(result.message || "Đăng nhập thành công");

        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1500);
      }
    } catch (error) {
      dispatch(loginFailed());
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">
              <FaUserShield />
            </div>
            <h1 className="admin-title">Quản trị viên</h1>
            <p className="admin-subtitle">Đăng nhập vào hệ thống quản lý</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label className="form-label">Email quản trị</label>
              <div className="input-wrapper">
                <FaUserShield className="input-icon" />
                <input
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email quản trị"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  className="form-input password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-admin-login" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
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
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
