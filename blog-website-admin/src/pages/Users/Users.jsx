import { useState } from "react";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBan,
  FaCheck,
} from "react-icons/fa";
import useAxiosJWT from "../../config/axiosConfig";
import { toast } from "react-toastify";

import { BASE_URL } from "../../config";
import UserModal from "../../shared/UserModal/UserModal";
import "./Users.css";
import { useEffect } from "react";
function Users() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        const res = await axiosJWT.delete(`${BASE_URL}/user/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        });
        const result = res.data;
        if (result.success) {
          toast.success(result.message);
          // Reload users list
          handleGetAllUsers(currentPage, searchTerm);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async (userId, formData) => {
    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/user/update/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        toast.success(result.message);
        setShowModal(false);
        setEditingUser(null);
        // Reload users list
        handleGetAllUsers(currentPage, searchTerm);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/user/toggle-status/${id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        // Update the user in the list with the returned data
        setUsers(
          users.map((u) => (u._id === id ? result.data : u))
        );
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleGetAllUsers = async (page = 1, search = "") => {
    try {
      const res = await axiosJWT.get(
        `${BASE_URL}/user?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        setUsers(result.data.users);
        setTotalPages(result.data.totalPages);
        setTotalUsers(result.data.total);
        setCurrentPage(result.data.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleGetAllUsers(page, searchTerm);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    handleGetAllUsers(1, term);
  };

  useEffect(() => {
    handleGetAllUsers();
  }, []);

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaUsers /> Quản lý người dùng
          </h1>
          <p className="page-subtitle">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => (
                <tr key={u._id}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td className="user-name-cell">{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role === "admin" ? "Quản trị viên" : "Người dùng"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        u.status === "active"
                          ? "status-active"
                          : u.status === "offline"
                          ? "status-offline"
                          : "status-blocked"
                      }`}
                    >
                      {u.status === "active"
                        ? "Hoạt động"
                        : u.status === "offline"
                        ? "Ngoại tuyến"
                        : "Bị khóa"}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(u)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-toggle"
                        onClick={() => handleToggleStatus(u._id)}
                        title={
                          u.status === "active" || u.status === "offline"
                            ? "Khóa"
                            : "Mở khóa"
                        }
                      >
                        {u.status === "active" || u.status === "offline" ? (
                          <FaBan />
                        ) : (
                          <FaCheck />
                        )}
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(u._id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <FaUsers />
            <p>Không tìm thấy người dùng nào</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <div className="pagination-info">
              Trang {currentPage} / {totalPages} (Tổng: {totalUsers} người dùng)
            </div>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

export default Users;
