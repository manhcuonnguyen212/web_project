import { useState } from "react";
import { BASE_URL } from "../../config";
import useAxiosJWT from "../../config/axiosConfig";
import { toast } from "react-toastify";
import { FaPlus, FaImage, FaUpload, FaTrash } from "react-icons/fa";


export default function AddPostModal({ show, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [content, setContent] = useState([]);
  const [uploading, setUploading] = useState(false);
  const axiosJWT = useAxiosJWT()();

  const handleAddContentBlock = (type) => {
    const newBlock = {
      type,
      order: content.length,
      ...(type === "paragraph"
        ? { text: "" }
        : { url: "", alt: "", caption: "" }),
    };
    setContent((prev) => [...prev, newBlock]);
  };

  const handleContentChange = (index, field, value) => {
    const updatedContent = [...content];
    updatedContent[index][field] = value;
    setContent(updatedContent);
  };

  const handleRemoveContentBlock = (index) => {
    const updatedContent = content.filter((_, i) => i !== index);
    updatedContent.forEach((block, i) => {
      block.order = i;
    });
    setContent(updatedContent);
  };

  // Upload cover image
  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error("Chỉ cho phép file ảnh jpeg, jpg, png, webp!");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnail(""); // clear URL nếu có
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Tiêu đề không được để trống!");
    if (!category) return toast.error("Vui lòng chọn danh mục!");
    if (!thumbnail && !thumbnailFile) return toast.error("Vui lòng chọn hoặc nhập ảnh đại diện!");
    if (content.length === 0) return toast.error("Nội dung không được để trống!");

    let thumbnailUrl = thumbnail;
    if (thumbnailFile) {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("featuredImage", thumbnailFile);
      try {
        const res = await axiosJWT.post(`${BASE_URL}/news/upload-image`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        if (res.data?.success && res.data?.url) {
          thumbnailUrl = res.data.url;
        } else {
          toast.error(res.data?.message || "Lỗi upload ảnh đại diện");
          setUploading(false);
          return;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi upload ảnh đại diện");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // TODO: Refactor content image upload giống thumbnail (nếu có file mới)

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("thumbnail", thumbnailUrl);
    formData.append("content", JSON.stringify(content));

    try {
      await axiosJWT.post(`${BASE_URL}/news`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Tạo bài viết thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo bài viết");
    }
  };

  if (!show) return null;
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
  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề" required />
        <select value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Chọn danh mục</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div style={{ margin: '12px 0' }}>
          <label>Ảnh đại diện:</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="Nhập URL hoặc upload ảnh"
              style={{ flex: 1 }}
              required
            />
            <label htmlFor="thumbnail-upload" style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", background: "#f3f4f6", borderRadius: 6, padding: "8px 12px", border: "1px solid #d1d5db" }}>
              <FaUpload style={{ marginRight: 4 }} />
              <span>{uploading ? "Đang tải..." : "Upload"}</span>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleThumbnailFileChange}
                disabled={uploading}
              />
            </label>
          </div>
          {(thumbnailPreview || thumbnail) && (
            <img src={
              thumbnailPreview
                ? thumbnailPreview
                : (thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`)
            } alt="preview" style={{ maxWidth: 200, margin: 8, borderRadius: 8 }} />
          )}
        </div>
        <div style={{ margin: '12px 0' }}>
          <label>Nội dung bài viết</label>
          <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
            <button type="button" onClick={() => handleAddContentBlock("paragraph")}> <FaPlus /> Thêm đoạn văn</button>
            <button type="button" onClick={() => handleAddContentBlock("image")}> <FaImage /> Thêm hình ảnh</button>
          </div>
          <div>
            {content.length === 0 ? (
              <div><p>Chưa có nội dung. Nhấn nút bên trên để thêm.</p></div>
            ) : (
              content.map((block, index) => (
                <div key={index} style={{ border: '1px solid #eee', borderRadius: 8, margin: '8px 0', padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{block.type === "paragraph" ? "Đoạn văn" : "Hình ảnh"} #{index + 1}</span>
                    <button type="button" onClick={() => handleRemoveContentBlock(index)}><FaTrash /></button>
                  </div>
                  {block.type === "paragraph" ? (
                    <textarea
                      value={block.text}
                      onChange={e => handleContentChange(index, "text", e.target.value)}
                      rows="4"
                      style={{ width: '100%', margin: '8px 0' }}
                      placeholder="Nhập nội dung đoạn văn..."
                    />
                  ) : (
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="text"
                          value={block.url}
                          onChange={e => handleContentChange(index, "url", e.target.value)}
                          placeholder="URL hoặc đường dẫn ảnh"
                          style={{ flex: 1 }}
                          required
                        />
                        <label htmlFor={`content-image-upload-${index}`} style={{ display: "flex", alignItems: "center", cursor: "pointer", background: "#f3f4f6", borderRadius: 6, padding: "8px 12px", border: "1px solid #d1d5db" }}>
                          <FaUpload style={{ marginRight: 4 }} />
                          <span>{uploading ? "Đang tải..." : "Upload"}</span>
                          <input
                            id={`content-image-upload-${index}`}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                                toast.error("Chỉ cho phép file ảnh jpeg, jpg, png, webp!");
                                return;
                              }
                              const formDataUpload = new FormData();
                              formDataUpload.append("featuredImage", file);
                              setUploading(true);
                              try {
                                const res = await axiosJWT.post(`${BASE_URL}/news/upload-image`, formDataUpload, {
                                  headers: { "Content-Type": "multipart/form-data" },
                                  withCredentials: true,
                                });
                                if (res.data?.success && res.data?.url) {
                                  handleContentChange(index, "url", res.data.url);
                                  toast.success("Upload ảnh thành công!");
                                } else {
                                  toast.error(res.data?.message || "Lỗi upload ảnh");
                                }
                              } catch (err) {
                                toast.error(err.response?.data?.message || "Lỗi upload ảnh");
                              } finally {
                                setUploading(false);
                              }
                            }}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={block.alt}
                        onChange={e => handleContentChange(index, "alt", e.target.value)}
                        placeholder="Mô tả hình ảnh (alt text)"
                        style={{ width: '100%', margin: '4px 0' }}
                      />
                      <input
                        type="text"
                        value={block.caption}
                        onChange={e => handleContentChange(index, "caption", e.target.value)}
                        placeholder="Chú thích hình ảnh"
                        style={{ width: '100%', margin: '4px 0' }}
                      />
                      {block.url && (
                        <img src={
                          block.url.startsWith('http') ? block.url : `${BASE_URL}${block.url}`
                        } alt="preview" style={{ maxWidth: 200, margin: 8, borderRadius: 8 }} />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <button type="submit">Tạo bài viết</button>
        <button type="button" onClick={onClose}>Hủy</button>
      </form>
    </div>
  );
}
