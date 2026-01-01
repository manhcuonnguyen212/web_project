import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaFlag, FaCheck, FaTimes, FaTrash, FaSearch } from "react-icons/fa";
import { BASE_URL } from "../../config";
import useAxiosJWT from "../../config/axiosConfig";
import { toast } from "react-toastify";
import "./Reports.css";

function Reports() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(`${BASE_URL}/reports`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        withCredentials: true,
      });
      setReports((res.data.data && res.data.data.reports) ? res.data.data.reports : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải báo cáo");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/reports/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${user?.accessToken}` }, withCredentials: true }
      );
      toast.success("Cập nhật trạng thái thành công");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá báo cáo này?")) return;
    try {
      await axiosJWT.delete(`${BASE_URL}/reports/${id}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        withCredentials: true,
      });
      toast.success("Đã xoá báo cáo");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xoá báo cáo");
    }
  };

  const safeReports = Array.isArray(reports) ? reports : [];
  const filteredReports = safeReports.filter(
    (r) =>
      r.reason?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.status?.toLowerCase().includes(search.toLowerCase()) ||
      r.targetType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="reports-page">
      <h1>
        <FaFlag /> Quản lý báo cáo vi phạm
      </h1>
      <div className="reports-actions">
        <input
          type="text"
          placeholder="Tìm kiếm lý do, mô tả, trạng thái..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchReports} disabled={loading}>
          <FaSearch /> Làm mới
        </button>
      </div>
      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Loại</th>
              <th>ID mục tiêu</th>
              <th>Lý do</th>
              <th>Mô tả</th>
              <th>Người báo cáo</th>
              <th>Trạng thái</th>
              <th>Xem mục tiêu</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  {loading ? "Đang tải..." : "Không có báo cáo nào"}
                </td>
              </tr>
            ) : (
              filteredReports.map((r, idx) => {
                // Đường dẫn tới bài viết hoặc bình luận
                let targetLink = "#";
                let targetLabel = "Xem";
                const mainSite = import.meta.env.VITE_MAIN_SITE_URL || "/";
                if (!import.meta.env.VITE_MAIN_SITE_URL) {
                  console.warn("Chưa cấu hình VITE_MAIN_SITE_URL, link sẽ không trỏ đúng sang trang chính!");
                }
                if (r.targetType === "news" && r.targetId) {
                  targetLink = `${mainSite}/posts/${r.targetId}`;
                  targetLabel = "Bài viết";
                } else if (r.targetType === "comment" && r.targetId) {
                  targetLink = `${mainSite}/posts/${r.targetInfo?.newsId || ''}#comment-${r.targetId}`;
                  targetLabel = "Bình luận";
                }
                return (
                  <tr key={r._id}>
                    <td>{idx + 1}</td>
                    <td>{r.targetType}</td>
                    <td>{r.targetId}</td>
                    <td>{r.reason}</td>
                    <td>{r.description}</td>
                    <td>{r.reporter?.username || r.reporter}</td>
                    <td>{r.status}</td>
                    <td>
                      <a href={targetLink} target="_blank" rel="noopener noreferrer">{targetLabel}</a>
                    </td>
                    <td>
                      <button
                        title="Đánh dấu đã xử lý"
                        onClick={() => handleUpdateStatus(r._id, "reviewed")}
                        disabled={r.status !== "pending"}
                      >
                        <FaCheck />
                      </button>
                      <button
                        title="Từ chối báo cáo"
                        onClick={() => handleUpdateStatus(r._id, "rejected")}
                        disabled={r.status !== "pending"}
                      >
                        <FaTimes />
                      </button>
                      <button
                        title="Xoá báo cáo"
                        onClick={() => handleDelete(r._id)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        title="Xoá mục tiêu"
                        style={{ color: 'red', marginLeft: 4 }}
                        onClick={async () => {
                          if (!window.confirm('Xác nhận xoá mục tiêu này?')) return;
                          try {
                            if (r.targetType === 'news') {
                              await axiosJWT.delete(`${BASE_URL}/news/${r.targetId}`, {
                                headers: { Authorization: `Bearer ${user?.accessToken}` },
                                withCredentials: true,
                              });
                              toast.success('Đã xoá bài viết!');
                            } else if (r.targetType === 'comment') {
                              await axiosJWT.delete(`${BASE_URL}/comment/${r.targetId}`, {
                                headers: { Authorization: `Bearer ${user?.accessToken}` },
                                withCredentials: true,
                              });
                              toast.success('Đã xoá bình luận!');
                            }
                            fetchReports();
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Lỗi xoá mục tiêu!');
                          }
                        }}
                      >
                        🗑 Xoá mục tiêu
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
