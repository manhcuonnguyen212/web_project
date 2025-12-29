import { useSelector } from "react-redux";
import { useState } from "react";
import {
  FaFileAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";

import { BASE_URL } from "../../config";
import useAxiosJWT from "../../config/axiosConfig";
import EditBlogModal from "../../shared/BlogModal/EditBlogModal";

import "./Posts.css";
import { useEffect } from "react";
function Posts() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "published", label: "Công khai" },
    { value: "hidden", label: "Ẩn" },
  ];

  const getStatusLabel = (value) => {
    return (
      statusOptions.find((opt) => opt.value === value)?.label ||
      "Tất cả trạng thái"
    );
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      published: "Công khai",
      hidden: "Ẩn",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleGetAllNews = async (page = 1, status = "all", search = "") => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/news/admin?page=${page}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      if (search) {
        url += `&search=${search}`;
      }

      const res = await axiosJWT.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setPosts(result.data.news);
        setTotalPages(result.data.pagination.totalPages);
        setTotalPosts(result.data.pagination.totalItems);
        setCurrentPage(result.data.pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        const res = await axiosJWT.delete(`${BASE_URL}/news/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });
        const result = res.data;
        if (result.success) {
          toast.success(result.message);
          handleGetAllNews(currentPage, filterStatus, searchTerm);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/news/admin/toggle-status/${id}`,
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
        toast.success(result.message);
        // Update the post in the state with the returned data
        setPosts(posts.map((post) => (post._id === id ? result.data : post)));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleGetAllNews(page, filterStatus, searchTerm);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    handleGetAllNews(1, filterStatus, term);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
    handleGetAllNews(1, status, searchTerm);
  };

  const handleEdit = async (post) => {
    // Only allow editing if status is hidden
    if (post.status !== "hidden") {
      toast.warning("Chỉ có thể chỉnh sửa bài viết đang ở trạng thái ẩn");
      return;
    }

    try {
      // Fetch full post data including content
      const res = await axiosJWT.get(`${BASE_URL}/news/${post._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setEditingPost(result.data);
        setShowModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      _id: null,
      title: "",
      excerpt: "",
      thumbnail: "",
      category: "",
      authorName: "",
      status: "published",
      content: [],
    });
    setShowModal(true);
  };

  const handleSavePost = async (postId, formData) => {
    try {
      let res;
      if (postId) {
        // Update existing post
        res = await axiosJWT.put(`${BASE_URL}/news/${postId}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });
      } else {
        // Create new post
        res = await axiosJWT.post(`${BASE_URL}/news`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });
      }

      const result = res.data;
      if (result.success) {
        toast.success(result.message);
        setShowModal(false);
        setEditingPost(null);
        // Reload posts list
        handleGetAllNews(currentPage, filterStatus, searchTerm);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  useEffect(() => {
    handleGetAllNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="posts-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaFileAlt /> Quản lý bài viết
          </h1>
          <p className="page-subtitle">
            Quản lý tất cả bài viết trong hệ thống
          </p>
        </div>
        <button className="btn-add" onClick={handleCreateNew}>
          <FaPlus /> Tạo bài viết mới
        </button>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-dropdown-wrapper">
          <div
            className="filter-select"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{getStatusLabel(filterStatus)}</span>
            <span className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>
              ▼
            </span>
          </div>
          {isDropdownOpen && (
            <>
              <div
                className="dropdown-overlay"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="filter-dropdown-menu">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`dropdown-item ${
                      option.value === filterStatus ? "active" : ""
                    }`}
                    onClick={() => {
                      handleFilterChange(option.value);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Lượt xem</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                  </td>
                </tr>
              ) : (
                posts.map((post, index) => (
                  <tr key={post._id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="post-title-cell">{post.title}</td>
                    <td>{post.authorName || "N/A"}</td>
                    <td>{post.category}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          post.status === "published"
                            ? "status-public"
                            : "status-hidden"
                        }`}
                      >
                        {getStatusDisplay(post.status)}
                      </span>
                    </td>
                    <td>{post.views || 0}</td>
                    <td>{formatDate(post.publishedAt || post.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn-icon btn-edit ${
                            post.status !== "hidden" ? "btn-disabled" : ""
                          }`}
                          onClick={() => handleEdit(post)}
                          title={
                            post.status !== "hidden"
                              ? "Chỉ có thể chỉnh sửa bài viết ẩn"
                              : "Chỉnh sửa"
                          }
                          disabled={post.status !== "hidden"}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-toggle"
                          onClick={() => handleToggleVisibility(post._id)}
                          title={post.status === "published" ? "Ẩn" : "Hiện"}
                        >
                          {post.status === "published" ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(post._id)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <FaFileAlt />
            <p>Không tìm thấy bài viết nào</p>
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
              Trang {currentPage} / {totalPages} (Tổng: {totalPosts} bài viết)
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
        <EditBlogModal
          post={editingPost}
          onClose={handleCloseModal}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
}

export default Posts;
