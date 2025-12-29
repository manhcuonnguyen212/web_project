import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaComment,
  FaTrash,
  FaSearch,
  FaEye,
  FaUser,
  FaClock,
} from "react-icons/fa";
import useAxiosJWT from "../../config/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "../../config";
import "./Comments.css";

function Comments() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Fetching comments with token:', user?.accessToken ? 'Token exists' : 'No token');
      const res = await axiosJWT.get(
        `${BASE_URL}/comment/all?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        }
      );
      console.log('Comments response:', res.data);
      const result = res.data;
      if (result.success && result.data) {
        setComments(result.data.comments || []);
        setTotalPages(result.data.pagination.totalPages);
        setTotalComments(result.data.pagination.total);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Không thể tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.accessToken) {
      fetchComments(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  const filteredComments = comments.filter(
    (c) =>
      c.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      try {
        const res = await axiosJWT.delete(`${BASE_URL}/comment/${id}`, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });
        const result = res.data;
        if (result.success) {
          toast.success("Xóa bình luận thành công!");
          fetchComments(currentPage);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleViewPost = (newsId) => {
    window.open(`http://localhost:5173/post/${newsId}`, "_blank");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchComments(page);
    }
  };

  return (
    <div className="admin-page comments-page">
      <div className="page-header">
        <div className="header-left">
          <FaComment className="page-icon" />
          <h1>Quản lý Bình luận</h1>
        </div>
      </div>

      <div className="page-content">
        <div className="content-header">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bình luận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-info">
            <span className="total-count">
              Tổng số: <strong>{totalComments}</strong> bình luận
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người dùng</th>
                  <th>Nội dung</th>
                  <th>Bài viết</th>
                  <th>Likes</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.length > 0 ? (
                  filteredComments.map((comment, index) => (
                    <tr key={comment._id}>
                      <td>{(currentPage - 1) * limit + index + 1}</td>
                      <td>
                        <div className="user-info">
                          <FaUser className="user-icon" />
                          <div>
                            <div className="user-name">
                              {comment.author?.username || "N/A"}
                            </div>
                            <div className="user-email">
                              {comment.author?.email || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="comment-content">
                          {comment.parentId && (
                            <span className="reply-badge">Trả lời</span>
                          )}
                          <p>
                            {comment.content?.length > 100
                              ? comment.content.substring(0, 100) + "..."
                              : comment.content}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="post-title">
                          {comment.newsId?.title?.length > 50
                            ? comment.newsId?.title.substring(0, 50) + "..."
                            : comment.newsId?.title || "N/A"}
                        </div>
                      </td>
                      <td>
                        <span className="likes-count">{comment.likes || 0}</span>
                      </td>
                      <td>
                        <div className="date-info">
                          <FaClock className="date-icon" />
                          {formatDate(comment.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => handleViewPost(comment.newsId?._id)}
                            title="Xem bài viết"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(comment._id)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchTerm
                        ? "Không tìm thấy bình luận nào"
                        : "Chưa có bình luận nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;
