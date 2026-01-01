import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaFileAlt,
  FaFolder,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaComment,
  FaFlag,
} from "react-icons/fa";
import { toast } from "react-toastify";

import { BASE_URL } from "../../config";
import {
  logoutStart,
  logoutSuccess,
  logoutFailed,
} from "../../redux/authSlice";
import useAxiosJWT from "../../config/axiosConfig";

import "./Sidebar.css";
function Sidebar() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { path: "/admin/users", icon: <FaUsers />, label: "Người dùng" },
    { path: "/admin/posts", icon: <FaFileAlt />, label: "Bài viết" },
    { path: "/admin/categories", icon: <FaFolder />, label: "Danh mục" },
    { path: "/admin/comments", icon: <FaComment />, label: "Bình luận" },
    { path: "/admin/reports", icon: <FaFlag />, label: "Quản lý báo cáo" },
    { path: "/admin/admins", icon: <FaUserShield />, label: "Quản trị viên" },
  ];

  const handleLogout = async () => {
    dispatch(logoutStart());
    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/auth/admin/logout`,
        {},
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
        dispatch(logoutSuccess());
        toast.success(result.message);
        window.location.href = "/";
      }
    } catch (error) {
      return toast.error(error.response?.data?.message);
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaUserShield />
          </div>
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

export default Sidebar;
