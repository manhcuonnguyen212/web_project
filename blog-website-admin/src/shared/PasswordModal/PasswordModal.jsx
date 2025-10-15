import { useState } from "react";
import { FaTimes, FaKey } from "react-icons/fa";
import "./PasswordModal.css";

function PasswordModal({ admin, onClose, onSave, isEditingSelf }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (isEditingSelf) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(admin._id, formData);
    }
  };

  if (!admin) return null;

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div
        className="password-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="password-modal-header">
          <h2>
            <FaKey />{" "}
            {isEditingSelf ? "Đổi mật khẩu" : `Đặt lại mật khẩu - ${admin.username}`}
          </h2>
          <button className="password-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-modal-form">
          {isEditingSelf ? (
            <>
              <div className="password-form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`password-form-input ${
                    errors.currentPassword ? "error" : ""
                  }`}
                  placeholder="Nhập mật khẩu hiện tại..."
                />
                {errors.currentPassword && (
                  <span className="error-message">{errors.currentPassword}</span>
                )}
              </div>

              <div className="password-form-group">
                <label htmlFor="newPassword">Mật khẩu mới *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`password-form-input ${
                    errors.newPassword ? "error" : ""
                  }`}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                />
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>

              <div className="password-form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`password-form-input ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Nhập lại mật khẩu mới..."
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </>
          ) : (
            <div className="password-info-box">
              <p>
                <strong>Lưu ý:</strong> Mật khẩu mới sẽ được tạo tự động và gửi
                đến email: <strong>{admin.email}</strong>
              </p>
              <p>Bạn có chắc muốn đặt lại mật khẩu cho {admin.username}?</p>
            </div>
          )}

          <div className="password-modal-actions">
            <button
              type="button"
              className="password-btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="password-btn-save">
              <FaKey /> {isEditingSelf ? "Đổi mật khẩu" : "Đặt lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordModal;
