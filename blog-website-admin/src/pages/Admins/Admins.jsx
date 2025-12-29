import { useSelector } from "react-redux";
import { useState } from "react";
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";

import { BASE_URL } from "../../config/index.js";
import { useEffect } from "react";
import useAxiosJWT from "../../config/axiosConfig.js";
import AdminModal from "../../shared/AdminModal/AdminModal.jsx";
import PasswordModal from "../../shared/PasswordModal/PasswordModal.jsx";

import "./Admins.css";
function Admins() {
  const user = useSelector((state) => state.auth.user);

  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa quản trị viên này?")) {
      try {
        const res = await axiosJWT.delete(`${BASE_URL}/user/admin/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });
        const result = res.data;
        if (result.success) {
          toast.success(result.message);
          handleGetAdmins();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleResetPassword = (admin) => {
    setPasswordAdmin(admin);
    setShowPasswordModal(true);
  };

  const handleSavePassword = async (adminId, formData) => {
    const isEditingSelf = adminId === user?._id;

    try {
      const res = await axiosJWT.put(
        `${BASE_URL}/user/admin/change-password/${adminId}`,
        isEditingSelf
          ? {
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }
          : {},
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
        setShowPasswordModal(false);
        setPasswordAdmin(null);
      }
    } catch (error) {
      return toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordAdmin(null);
  };

  const handleGetAdmins = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(`${BASE_URL}/user/admins`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        // Sort to ensure supervisor admin is always first
        const sortedAdmins = result.data.sort((a, b) => {
          if (a.role === "supervisor admin" && b.role !== "supervisor admin")
            return -1;
          if (a.role !== "supervisor admin" && b.role === "supervisor admin")
            return 1;
          return 0;
        });
        setAdmins(sortedAdmins);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingAdmin({
      _id: null,
      username: "",
      email: "",
    });
    setShowModal(true);
  };

  const handleSaveAdmin = async (adminId, formData) => {
    try {
      let res;
      const isEditingSelf = adminId === user?._id;

      if (adminId) {
        // Update existing admin
        const updateData = {
          username: formData.username,
          email: formData.email,
        };

        res = await axiosJWT.put(
          `${BASE_URL}/user/admin/${adminId}`,
          updateData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.accessToken}`,
            },
            withCredentials: true,
          }
        );

        // Handle password change/reset
        if (formData.resetPassword || (formData.currentPassword && formData.newPassword)) {
          const passwordPayload = isEditingSelf
            ? {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
              }
            : {}; // Empty for supervisor admin resetting others

          const passwordRes = await axiosJWT.put(
            `${BASE_URL}/user/admin/change-password/${adminId}`,
            passwordPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.accessToken}`,
              },
              withCredentials: true,
            }
          );

          if (passwordRes.data.success) {
            if (isEditingSelf) {
              toast.success("Cập nhật thông tin và mật khẩu thành công");
            } else {
              toast.success(
                "Cập nhật thông tin thành công. Mật khẩu mới đã được gửi qua email"
              );
            }
          }
        } else {
          // Only info updated
          if (res.data.success) {
            toast.success(res.data.message);
          }
        }

        setShowModal(false);
        setEditingAdmin(null);
        handleGetAdmins();
      } else {
        // Create new admin
        res = await axiosJWT.post(`${BASE_URL}/user/admin`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          withCredentials: true,
        });

        const result = res.data;
        if (result.success) {
          toast.success(result.message);
          setShowModal(false);
          setEditingAdmin(null);
          handleGetAdmins();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
  };

  useEffect(() => {
    handleGetAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="admins-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaUserShield /> Quản lý quản trị viên
          </h1>
          <p className="page-subtitle">Quản lý tài khoản quản trị viên</p>
        </div>
        <button
          className={`btn-add ${
            user?.role !== "supervisor admin" ? "btn-disabled" : ""
          }`}
          onClick={handleCreateNew}
          disabled={user?.role !== "supervisor admin"}
        >
          <FaPlus /> Thêm quản trị viên
        </button>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "40px" }}
                  >
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin._id}>
                    <td>{index + 1}</td>
                    <td className="user-name-cell">{admin.username}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          admin.role === "supervisor admin"
                            ? "status-public"
                            : "status-active"
                        }`}
                      >
                        {admin.role === "supervisor admin"
                          ? "Supervisor Admin"
                          : "Admin"}
                      </span>
                    </td>
                    <td>{formatDate(admin.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className={`btn-icon btn-edit ${
                            admin._id !== user?._id &&
                            (user?.role !== "supervisor admin" ||
                              admin.role === "supervisor admin")
                              ? "btn-disabled"
                              : ""
                          }`}
                          onClick={() => handleEdit(admin)}
                          title={
                            admin._id === user?._id
                              ? "Chỉnh sửa thông tin của bạn"
                              : user?.role !== "supervisor admin"
                              ? "Chỉ supervisor admin mới có quyền"
                              : admin.role === "supervisor admin"
                              ? "Không thể chỉnh sửa supervisor admin"
                              : "Chỉnh sửa"
                          }
                          disabled={
                            admin._id !== user?._id &&
                            (user?.role !== "supervisor admin" ||
                              admin.role === "supervisor admin")
                          }
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`btn-icon btn-toggle ${
                            admin._id !== user?._id &&
                            user?.role !== "supervisor admin"
                              ? "btn-disabled"
                              : ""
                          }`}
                          onClick={() => handleResetPassword(admin)}
                          title={
                            admin._id === user?._id
                              ? "Đổi mật khẩu của bạn"
                              : user?.role !== "supervisor admin"
                              ? "Chỉ supervisor admin mới có quyền"
                              : "Đặt lại mật khẩu"
                          }
                          disabled={
                            admin._id !== user?._id &&
                            user?.role !== "supervisor admin"
                          }
                        >
                          <FaKey />
                        </button>
                        <button
                          className={`btn-icon btn-delete ${
                            user?.role !== "supervisor admin" ||
                            admin.role === "supervisor admin" ||
                            admin._id === user?._id
                              ? "btn-disabled"
                              : ""
                          }`}
                          onClick={() => handleDelete(admin._id)}
                          title={
                            user?.role !== "supervisor admin"
                              ? "Chỉ supervisor admin mới có quyền"
                              : admin.role === "supervisor admin"
                              ? "Không thể xóa supervisor admin"
                              : admin._id === user?._id
                              ? "Không thể xóa chính mình"
                              : "Xóa"
                          }
                          disabled={
                            user?.role !== "supervisor admin" ||
                            admin.role === "supervisor admin" ||
                            admin._id === user?._id
                          }
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

        {!loading && admins.length === 0 && (
          <div className="empty-state">
            <FaUserShield />
            <p>Chưa có quản trị viên nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <AdminModal
          admin={editingAdmin}
          onClose={handleCloseModal}
          onSave={handleSaveAdmin}
          isEditingSelf={editingAdmin?._id === user?._id}
          isSupervisorAdmin={user?.role === "supervisor admin"}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          admin={passwordAdmin}
          onClose={handleClosePasswordModal}
          onSave={handleSavePassword}
          isEditingSelf={passwordAdmin?._id === user?._id}
        />
      )}
    </div>
  );
}

export default Admins;
