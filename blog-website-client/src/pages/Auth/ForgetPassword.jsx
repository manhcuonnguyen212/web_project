import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import { BASE_URL } from "../../config";
import "./Auth.css";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/user/forget-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const result = res.data;

      if (result.success) {
        setEmailSent(true);
        toast.success(
          result.message || "Email khôi phục mật khẩu đã được gửi!"
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
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
              <FaKey />
            </div>
            <h1 className="auth-title">Quên mật khẩu?</h1>
            <p className="auth-subtitle">
              {emailSent
                ? "Kiểm tra email của bạn để đặt lại mật khẩu"
                : "Nhập email để nhận liên kết đặt lại mật khẩu"}
            </p>
          </div>

          {!emailSent ? (
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

              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Gửi email khôi phục
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="email-sent-message">
              <p>
                Chúng tôi đã gửi email khôi phục mật khẩu đến{" "}
                <strong>{email}</strong>
              </p>
              <p>Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.</p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="btn-auth"
                style={{ marginTop: "20px" }}
              >
                Gửi lại email
              </button>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              <FaArrowLeft /> Quay lại đăng nhập
            </Link>
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

export default ForgetPassword;
