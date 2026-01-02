import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaSave,
  FaKey,
  FaHeart,
  FaBookmark,
  FaComment,
  FaBell,
} from "react-icons/fa";
import { toast } from "react-toastify";

import useAxiosJWT from "../../config/axiosConfig.js";
import { BASE_URL } from "../../config/index.js";
import { loginSuccess } from "../../redux/authSlice.js";

import "./Profile.css";
function Profile() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [profile, setProfile] = useState(user);
  const [activeTab, setActiveTab] = useState("info");

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // States for posts
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch posts based on active tab
  useEffect(() => {
    const fetchPosts = async () => {
      if (activeTab === "info" || activeTab === "password") return;
      if (!user?._id) return; // Don't fetch if user not logged in

      setLoadingPosts(true);
      try {
        let endpoint = "";
        switch (activeTab) {
          case "saved":
            endpoint = "/user/saved-posts";
            break;
          case "liked":
            endpoint = "/user/liked-posts";
            break;
          case "commented":
            endpoint = "/user/commented-posts";
            break;
          case "notifications":
            endpoint = "/notifications";
            break;
          default:
            return;
        }

        const res = await axiosJWT.get(`${BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });

        const result = res.data;

        if (result.success) {
          switch (activeTab) {
            case "saved":
              setSavedPosts(result.data?.posts || []);
              break;
            case "liked":
              setLikedPosts(result.data?.posts || []);
              break;
            case "commented":
              setCommentedPosts(result.data?.posts || []);
              break;
            case "notifications":
              setNotifications(result.data?.notifications || []);
              break;
          }
        } else {
          // Set empty arrays if request succeeds but no data
          switch (activeTab) {
            case "saved":
              setSavedPosts([]);
              break;
            case "liked":
              setLikedPosts([]);
              break;
            case "commented":
              setCommentedPosts([]);
              break;
            case "notifications":
              setNotifications([]);
              break;
          }
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        
        // Set empty arrays on error to show empty state
        switch (activeTab) {
          case "saved":
            setSavedPosts([]);
            break;
          case "liked":
            setLikedPosts([]);
            break;
          case "commented":
            setCommentedPosts([]);
            break;
          case "notifications":
            setNotifications([]);
            break;
        }
        
        // Only show toast for non-empty data errors, not 404
        if (error.response?.status && error.response.status !== 404 && error.response.status !== 401) {
          toast.error("Không thể tải dữ liệu");
        }
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [activeTab]);

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

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <FaUser /> Thông tin
          </button>
          <button
            className={`tab-button ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <FaLock /> Mật khẩu
          </button>
          <button
            className={`tab-button ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <FaBookmark /> Đã lưu
          </button>
          <button
            className={`tab-button ${activeTab === "liked" ? "active" : ""}`}
            onClick={() => setActiveTab("liked")}
          >
            <FaHeart /> Đã thích
          </button>
          <button
            className={`tab-button ${activeTab === "commented" ? "active" : ""}`}
            onClick={() => setActiveTab("commented")}
          >
            <FaComment /> Đã bình luận
          </button>
          <button
            className={`tab-button ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell /> Thông báo
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
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
        )}

        {activeTab === "password" && (
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
        )}

        {/* Posts Tabs */}
        {(activeTab === "saved" || activeTab === "liked" || activeTab === "commented") && (
          <section className="profile-card">
            <div className="card-header">
              {activeTab === "saved" && (
                <>
                  <FaBookmark className="card-icon" />
                  <h2 className="card-title">Bài viết đã lưu</h2>
                </>
              )}
              {activeTab === "liked" && (
                <>
                  <FaHeart className="card-icon" />
                  <h2 className="card-title">Bài viết đã thích</h2>
                </>
              )}
              {activeTab === "commented" && (
                <>
                  <FaComment className="card-icon" />
                  <h2 className="card-title">Bài viết đã bình luận</h2>
                </>
              )}
            </div>
            <div className="posts-content">
              {loadingPosts ? (
                <div className="loading-container">
                  <span className="spinner"></span>
                  <p>Đang tải...</p>
                </div>
              ) : (
                <>
                  {activeTab === "saved" && savedPosts.length === 0 && (
                    <p className="empty-message">Chưa có bài viết nào được lưu</p>
                  )}
                  {activeTab === "liked" && likedPosts.length === 0 && (
                    <p className="empty-message">Chưa có bài viết nào được thích</p>
                  )}
                  {activeTab === "commented" && commentedPosts.length === 0 && (
                    <p className="empty-message">Chưa có bài viết nào được bình luận</p>
                  )}

                  <div className="posts-grid">
                    {activeTab === "saved" &&
                      savedPosts.map((post) => (
                        <div key={post._id} className="post-card" onClick={() => navigate(`/post/${post._id}`)}>
                          <div className="post-image">
                            <img src={post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : `${process.env.NODE_ENV === "production" ? "https://doanlaptrinhweb-server.onrender.com" : "http://localhost:5000"}${post.thumbnail}`}
                              alt={post.title} />
                          </div>
                          <div className="post-info">
                            <h3>{post.title}</h3>
                            <p className="post-meta">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      ))}

                    {activeTab === "liked" &&
                      likedPosts.map((post) => (
                        <div key={post._id} className="post-card" onClick={() => navigate(`/post/${post._id}`)}>
                          <div className="post-image">
                            <img src={post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : `${process.env.NODE_ENV === "production" ? "https://doanlaptrinhweb-server.onrender.com" : "http://localhost:5000"}${post.thumbnail}`}
                              alt={post.title} />
                          </div>
                          <div className="post-info">
                            <h3>{post.title}</h3>
                            <p className="post-meta">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      ))}

                    {activeTab === "commented" &&
                      commentedPosts.map((post) => (
                        <div key={post._id} className="post-card" onClick={() => navigate(`/post/${post._id}`)}>
                          <div className="post-image">
                            <img src={post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : `${process.env.NODE_ENV === "production" ? "https://doanlaptrinhweb-server.onrender.com" : "http://localhost:5000"}${post.thumbnail}`}
                              alt={post.title} />
                          </div>
                          <div className="post-info">
                            <h3>{post.title}</h3>
                            <p className="post-meta">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <section className="profile-card">
            <div className="card-header">
              <FaBell className="card-icon" />
              <h2 className="card-title">Thông báo</h2>
            </div>
            <div className="notifications-content">
              {loadingPosts ? (
                <div className="loading-container">
                  <span className="spinner"></span>
                  <p>Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <p className="empty-message">Chưa có thông báo nào</p>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                      onClick={() => navigate(`/post/${notif.newsId?._id || notif.newsId}?commentId=${notif.commentId}`)}
                    >
                      <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Profile;
