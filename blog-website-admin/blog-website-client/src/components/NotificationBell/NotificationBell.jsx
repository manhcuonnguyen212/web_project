import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosJWT from '../../config/axiosConfig';
import { BASE_URL } from '../../config';
import './NotificationBell.css';

function NotificationBell() {
  const user = useSelector((state) => state?.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosJWT.get(`${BASE_URL}/notifications?limit=10`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Navigate to the post with comment highlight
    setShowDropdown(false);
    navigate(`/post/${notification.newsId._id}?commentId=${notification.commentId}`);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await axiosJWT.put(
        `${BASE_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      toast.success('Đã đánh dấu tất cả là đã đọc');
      fetchNotifications();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) return null;

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <>
          <div className="notification-overlay" onClick={() => setShowDropdown(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <FaBell />
                  <p>Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <p className="notification-meta">
                        <span className="notification-post">
                          {notif.newsId?.title?.substring(0, 30)}
                          {notif.newsId?.title?.length > 30 ? '...' : ''}
                        </span>
                        <span className="notification-time">{formatTimeAgo(notif.createdAt)}</span>
                      </p>
                    </div>
                    {!notif.isRead && <div className="notification-dot"></div>}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={() => { setShowDropdown(false); navigate('/profile?tab=notifications'); }}>
                  Xem tất cả
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
