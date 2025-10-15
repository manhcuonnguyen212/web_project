import { useSelector } from "react-redux";
import { useState } from "react";
import { FaFolder, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import { BASE_URL } from "../../config";
import useAxiosJWT from "../../../../client/src/config/axiosConfig";
import CategoryModal from "../../shared/CategoryModal/CategoryModal";

import "./Categories.css";
import { useEffect } from "react";
function Categories() {
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        const res = await axiosJWT.delete(`${BASE_URL}/category/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        });
        const result = res.data;
        if (result.success) {
          toast.success(result.message);
          handleGetAllCategories();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  const handleGetAllCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosJWT.get(`${BASE_URL}/category`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        withCredentials: true,
      });
      const result = res.data;
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingCategory({
      _id: null,
      name: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleSaveCategory = async (categoryId, formData) => {
    try {
      let res;
      if (categoryId) {
        // Update existing category
        res = await axiosJWT.put(
          `${BASE_URL}/category/${categoryId}`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.accessToken}`,
            },
            withCredentials: true,
          }
        );
      } else {
        // Create new category
        res = await axiosJWT.post(`${BASE_URL}/category`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        });
      }

      const result = res.data;
      if (result.success) {
        toast.success(result.message);
        setShowModal(false);
        setEditingCategory(null);
        // Reload categories list
        handleGetAllCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  useEffect(() => {
    handleGetAllCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FaFolder /> Quản lý danh mục
          </h1>
          <p className="page-subtitle">Quản lý danh mục bài viết</p>
        </div>
        <button className="btn-add" onClick={handleCreateNew}>
          <FaPlus /> Thêm danh mục mới
        </button>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th>Số bài viết</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                    <div className="spinner"></div>
                    <p>Đang tải...</p>
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category._id}>
                    <td>{index + 1}</td>
                    <td className="category-name-cell">{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.description || "N/A"}</td>
                    <td>{category.postCount}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(category)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(category._id)}
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

        {!loading && categories.length === 0 && (
          <div className="empty-state">
            <FaFolder />
            <p>Chưa có danh mục nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}

export default Categories;
