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
import useAxiosJWT from "../../config/axiosConfig";

import "./Dashboard.css";

function Dashboard() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [recentPosts, setRecentPosts] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [userChange, setUserChange] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [postChange, setPostChange] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [commentChange, setCommentChange] = useState(0);

  const stats = [
    {
      icon: <FaUsers />,
      title: "Tổng người dùng",
      value: userCount,
      change: userChange,
      color: "#667eea",
      showChange: true,
    },
    {
      icon: <FaFileAlt />,
      title: "Tổng bài viết",
      value: postCount,
      change: postChange,
      color: "#764ba2",
      showChange: true,
    },
    {
      icon: <FaFolder />,
      title: "Danh mục",
      value: categoryCount,
      color: "#f59e0b",
      showChange: false,
    },
    {
      icon: <FaComment />,
      title: "Bình luận",
      value: commentCount,
      change: commentChange,
      color: "#10b981",
      showChange: true,
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

    // Fetch total users
    axiosJWT.get(`${BASE_URL}/user`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setUserCount(res.data.data?.total || 0));
    // Fetch user monthly growth
    axiosJWT.get(`${BASE_URL}/user/admin/stats`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setUserChange(res.data.data?.change || 0));

    // Fetch total posts
    axiosJWT.get(`${BASE_URL}/news/admin`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setPostCount(res.data.data?.pagination?.totalItems || 0));
    // Fetch post monthly growth
    axiosJWT.get(`${BASE_URL}/news/admin/stats`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setPostChange(res.data.data?.change || 0));

    // Fetch total categories
    axiosJWT.get(`${BASE_URL}/category`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setCategoryCount(res.data.data?.length || 0));

    // Fetch total comments (status !== 'deleted')
    axiosJWT.get(`${BASE_URL}/comment/all?page=1&limit=1`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setCommentCount(res.data.data?.pagination?.total || 0));
    // Fetch comment monthly growth
    axiosJWT.get(`${BASE_URL}/comment/admin/stats`, { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true })
      .then(res => setCommentChange(res.data.data?.change || 0));
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
              {stat.showChange && (
                <div className="stat-change">
                  {stat.change > 0
                    ? `+${stat.change}%`
                    : stat.change === 0
                      ? `0%`
                      : `${stat.change}%`
                  } so với tháng trước
                </div>
              )}
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
