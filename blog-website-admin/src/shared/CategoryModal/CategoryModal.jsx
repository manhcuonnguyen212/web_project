import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

import "./CategoryModal.css";
function CategoryModal({ category, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(category?._id, formData);
  };

  if (!category) return null;

  return (
    <div className="category-modal-overlay" onClick={onClose}>
      <div
        className="category-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="category-modal-header">
          <h2>{category._id ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h2>
          <button className="category-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-modal-form">
          <div className="category-form-group">
            <label htmlFor="name">Tên danh mục *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="category-form-input"
              placeholder="VD: Công nghệ, Du lịch..."
            />
          </div>

          <div className="category-form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="category-form-input"
              placeholder="Nhập mô tả cho danh mục..."
            />
          </div>

          <div className="category-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              <FaSave /> {category._id ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
