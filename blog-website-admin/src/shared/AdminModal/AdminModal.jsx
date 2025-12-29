import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

import "./AdminModal.css";
function AdminModal({
  admin,
  onClose,
  onSave,
  isEditingSelf,
  isSupervisorAdmin,
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || "",
        email: admin.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [admin]);

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

    // Validate password fields if they are shown and filled
    if (showPasswordFields && isEditingSelf) {
      if (
        formData.currentPassword ||
        formData.newPassword ||
        formData.confirmPassword
      ) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Only include password fields if they are filled
      const dataToSave = {
        username: formData.username,
        email: formData.email,
      };

      // For self: include password fields if filled
      if (
        isEditingSelf &&
        showPasswordFields &&
        formData.currentPassword &&
        formData.newPassword
      ) {
        dataToSave.currentPassword = formData.currentPassword;
        dataToSave.newPassword = formData.newPassword;
      }

      // For others: flag to reset password
      if (!isEditingSelf && showPasswordFields) {
        dataToSave.resetPassword = true;
      }

      onSave(admin?._id, dataToSave);
    }
  };

  if (!admin) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>
            {admin._id ? "Chỉnh sửa quản trị viên" : "Thêm quản trị viên mới"}
          </h2>
          <button className="admin-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label htmlFor="username">Tên quản trị viên *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="admin-form-input"
              placeholder="Nhập tên quản trị viên..."
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="admin-form-input"
              placeholder="admin@example.com"
            />
          </div>

          {!admin._id && (
            <div className="admin-info-box">
              <p>
                <strong>Lưu ý:</strong> Mật khẩu sẽ được tạo tự động và gửi qua
                email.
              </p>
            </div>
          )}

          {admin._id &&
            (isEditingSelf ||
              (isSupervisorAdmin && admin.role !== "supervisor admin")) && (
              <>
                <div className="password-toggle-section">
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => {
                      setShowPasswordFields(!showPasswordFields);
                      if (showPasswordFields) {
                        // Clear password fields when hiding
                        setFormData((prev) => ({
                          ...prev,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        }));
                        setErrors({});
                      }
                    }}
                  >
                    {showPasswordFields
                      ? "Ẩn đổi mật khẩu"
                      : isEditingSelf
                      ? "Đổi mật khẩu"
                      : "Đặt lại mật khẩu"}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="password-fields-section">
                    {isEditingSelf ? (
                      <>
                        <div className="admin-form-group">
                          <label htmlFor="currentPassword">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className={`admin-form-input ${
                              errors.currentPassword ? "error" : ""
                            }`}
                            placeholder="Nhập mật khẩu hiện tại..."
                          />
                          {errors.currentPassword && (
                            <span className="error-message">
                              {errors.currentPassword}
                            </span>
                          )}
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="newPassword">Mật khẩu mới</label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`admin-form-input ${
                              errors.newPassword ? "error" : ""
                            }`}
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                          />
                          {errors.newPassword && (
                            <span className="error-message">
                              {errors.newPassword}
                            </span>
                          )}
                        </div>

                        <div className="admin-form-group">
                          <label htmlFor="confirmPassword">
                            Xác nhận mật khẩu
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`admin-form-input ${
                              errors.confirmPassword ? "error" : ""
                            }`}
                            placeholder="Nhập lại mật khẩu mới..."
                          />
                          {errors.confirmPassword && (
                            <span className="error-message">
                              {errors.confirmPassword}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="admin-info-box">
                        <p>
                          <strong>Lưu ý:</strong> Mật khẩu mới sẽ được tạo tự
                          động và gửi đến email: <strong>{admin.email}</strong>
                        </p>
                        <p style={{ marginTop: "8px" }}>
                          Bạn có chắc muốn đặt lại mật khẩu cho{" "}
                          <strong>{admin.username}</strong>?
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-btn-cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="admin-btn-save">
              <FaSave /> {admin._id ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminModal;
