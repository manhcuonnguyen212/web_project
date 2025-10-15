import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaFileAlt,
  FaFolder,
  FaEye,
  FaComment,
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import useAxiosJWT from "../../../../client/src/config/axiosConfig";

import "./Dashboard.css";
function Dashboard() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [recentPosts, setRecentPosts] = useState([]);

  const stats = [
    {
      icon: <FaUsers />,
      title: "Tổng người dùng",
      value: "1,234",
      change: "+12%",
      color: "#667eea",
    },
    {
      icon: <FaFileAlt />,
      title: "Tổng bài viết",
      value: "456",
      change: "+8%",
      color: "#764ba2",
    },
    {
      icon: <FaFolder />,
      title: "Danh mục",
      value: "24",
      change: "+2",
      color: "#f59e0b",
    },
    {
      icon: <FaComment />,
      title: "Bình luận",
      value: "3,891",
      change: "+24%",
      color: "#10b981",
    },
  ];

  const handleGetRecentNews = async () => {
    try {
      const res = await axiosJWT.get(`${BASE_URL}/news/admin/recent`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setRecentPosts(result.data);
      }
    } catch (error) {
      return toast.error(error.response?.data?.message);
    }
  };

  useEffect(() => {
    handleGetRecentNews();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <FaChartLine /> Dashboard
        </h1>
        <p className="dashboard-subtitle">Tổng quan hệ thống quản lý</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ "--stat-color": stat.color }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change">
                {stat.change} so với tháng trước
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="recent-posts-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaFileAlt /> Bài viết gần đây
            </h2>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post._id}>
                    <td className="post-title-cell">{post.title}</td>
                    <td>{post.authorName}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          post.status === "publish"
                            ? "status-public"
                            : "status-draft"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <span className="views-count">
                        <FaEye /> {post.views}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* <div className="quick-actions-card">
          <div className="card-header">
            <h2 className="card-title">Thao tác nhanh</h2>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <FaFileAlt /> Tạo bài viết mới
            </button>
            <button className="quick-action-btn">
              <FaUsers /> Quản lý người dùng
            </button>
            <button className="quick-action-btn">
              <FaFolder /> Quản lý danh mục
            </button>
            <button className="quick-action-btn">
              <FaUserShield /> Quản lý admin
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Dashboard;
