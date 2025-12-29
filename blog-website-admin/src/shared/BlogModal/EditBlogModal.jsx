import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaPlus, FaTrash, FaImage } from "react-icons/fa";
import "./EditBlogModal.css";

function EditBlogModal({ post, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    thumbnail: "",
    category: "",
    authorName: "",
    status: "published",
    content: [],
  });

  const categories = [
    "Du lịch",
    "Ẩm thực",
    "Làm đẹp",
    "Công nghệ",
    "Sức khỏe",
    "Thời trang",
    "Tài chính",
    "Giải trí",
    "Nhà cửa",
    "Khác",
  ];

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        thumbnail: post.thumbnail || "",
        category: post.category || "",
        authorName: post.authorName || "",
        status: post.status || "published",
        content: post.content || [],
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddContentBlock = (type) => {
    const newBlock = {
      type,
      order: formData.content.length,
      ...(type === "paragraph"
        ? { text: "" }
        : { url: "", alt: "", caption: "" }),
    };
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, newBlock],
    }));
  };

  const handleContentChange = (index, field, value) => {
    const updatedContent = [...formData.content];
    updatedContent[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      content: updatedContent,
    }));
  };

  const handleRemoveContentBlock = (index) => {
    const updatedContent = formData.content.filter((_, i) => i !== index);
    // Reorder blocks
    updatedContent.forEach((block, i) => {
      block.order = i;
    });
    setFormData((prev) => ({
      ...prev,
      content: updatedContent,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(post?._id, formData);
  };

  if (!post) return null;

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="blog-modal-header">
          <h2>{post._id ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h2>
          <button className="blog-modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="blog-modal-form">
          <div className="blog-form-row">
            <div className="blog-form-group">
              <label htmlFor="title">Tiêu đề *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="blog-form-input"
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>
          </div>

          <div className="blog-form-row">
            <div className="blog-form-group">
              <label htmlFor="excerpt">Mô tả ngắn</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                className="blog-form-input"
                placeholder="Nhập mô tả ngắn về bài viết..."
              />
            </div>
          </div>

          <div className="blog-form-row">
            <div className="blog-form-group">
              <label htmlFor="thumbnail">URL ảnh đại diện</label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="blog-form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="blog-form-row blog-form-row-2">
            <div className="blog-form-group">
              <label htmlFor="category">Danh mục *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="blog-form-input"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="blog-form-group">
              <label htmlFor="authorName">Tác giả</label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="blog-form-input"
                placeholder="Tên tác giả"
              />
            </div>
          </div>

          <div className="blog-form-row">
            <div className="blog-form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="blog-form-input"
              >
                <option value="published">Công khai</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          <div className="blog-content-section">
            <div className="blog-content-header">
              <label>Nội dung bài viết</label>
              <div className="blog-content-actions">
                <button
                  type="button"
                  className="btn-add-block"
                  onClick={() => handleAddContentBlock("paragraph")}
                >
                  <FaPlus /> Thêm đoạn văn
                </button>
                <button
                  type="button"
                  className="btn-add-block"
                  onClick={() => handleAddContentBlock("image")}
                >
                  <FaImage /> Thêm hình ảnh
                </button>
              </div>
            </div>

            <div className="blog-content-blocks">
              {formData.content.length === 0 ? (
                <div className="blog-content-empty">
                  <p>Chưa có nội dung. Nhấn nút bên trên để thêm.</p>
                </div>
              ) : (
                formData.content.map((block, index) => (
                  <div key={index} className="blog-content-block">
                    <div className="blog-block-header">
                      <span className="blog-block-type">
                        {block.type === "paragraph" ? "Đoạn văn" : "Hình ảnh"} #
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        className="btn-remove-block"
                        onClick={() => handleRemoveContentBlock(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {block.type === "paragraph" ? (
                      <textarea
                        value={block.text}
                        onChange={(e) =>
                          handleContentChange(index, "text", e.target.value)
                        }
                        rows="4"
                        className="blog-form-input"
                        placeholder="Nhập nội dung đoạn văn..."
                      />
                    ) : (
                      <div className="blog-image-block">
                        <input
                          type="url"
                          value={block.url}
                          onChange={(e) =>
                            handleContentChange(index, "url", e.target.value)
                          }
                          className="blog-form-input"
                          placeholder="URL hình ảnh"
                        />
                        <input
                          type="text"
                          value={block.alt}
                          onChange={(e) =>
                            handleContentChange(index, "alt", e.target.value)
                          }
                          className="blog-form-input"
                          placeholder="Mô tả hình ảnh (alt text)"
                        />
                        <input
                          type="text"
                          value={block.caption}
                          onChange={(e) =>
                            handleContentChange(
                              index,
                              "caption",
                              e.target.value
                            )
                          }
                          className="blog-form-input"
                          placeholder="Chú thích hình ảnh"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="blog-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save">
              <FaSave /> Lưu bài viết
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlogModal;
