import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaSave,
  FaKey,
} from "react-icons/fa";
import { toast } from "react-toastify";

import useAxiosJWT from "../../config/axiosConfig.js";
import { BASE_URL } from "../../config/index.js";
import { loginSuccess } from "../../redux/authSlice.js";

import "./Profile.css";
function Profile() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [profile, setProfile] = useState(user);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/user/change-info`,
        {
          username: profile.username,
          year: profile.year,
          address: profile.address,
          phone: profile.phone,
          email: profile.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        // Update localStorage with new user data
        const updatedUser = {
          ...profile,
          ...result.data,
        };
        dispatch(loginSuccess(updatedUser));
        setProfile(updatedUser);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingProfile(false);
    }
  };

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  }

  const handleSavePassword = async (e) => {
    e.preventDefault();

    // Validate
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/user/change-password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.next,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswords({ current: "", next: "", confirm: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="page profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-title">{profile.name}</h1>
            <p className="profile-subtitle">{profile.email}</p>
          </div>
        </div>

        <section className="profile-card">
          <div className="card-header">
            <FaUser className="card-icon" />
            <h2 className="card-title">Thông tin cá nhân</h2>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="label-icon" />
                  Họ và tên
                </label>
                <input
                  className="form-input"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaCalendar className="label-icon" />
                  Năm sinh
                </label>
                <input
                  className="form-input"
                  name="year"
                  value={profile.year}
                  onChange={handleProfileChange}
                  placeholder="Năm sinh"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="label-icon" />
                  Địa chỉ
                </label>
                <input
                  className="form-input"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="Địa chỉ"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="label-icon" />
                  Số điện thoại
                </label>
                <input
                  className="form-input"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Số điện thoại"
                />
              </div>

              <div className="form-group form-group-full">
                <label className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email
                </label>
                <input
                  className="form-input"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  type="email"
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loadingProfile}
              >
                {loadingProfile ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="profile-card">
          <div className="card-header">
            <FaLock className="card-icon" />
            <h2 className="card-title">Đổi mật khẩu</h2>
          </div>
          <form onSubmit={handleSavePassword}>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  <FaKey className="label-icon" />
                  Mật khẩu hiện tại
                </label>
                <input
                  className="form-input"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Mật khẩu mới
                </label>
                <input
                  className="form-input"
                  name="next"
                  value={passwords.next}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Xác nhận mật khẩu
                </label>
                <input
                  className="form-input"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loadingPassword}
              >
                {loadingPassword ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaKey />
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Profile;
