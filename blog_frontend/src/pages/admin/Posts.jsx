import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    axiosClient.get("/posts").then((res) => setPosts(res.data));
  }, []);

  const handleAdd = async () => {
    const res = await axiosClient.post("/posts", {
      ...newPost,
      user_id: 1, // TODO: Lấy từ token
      category_id: 1,
    });
    setPosts([...posts, res.data]);
    setNewPost({ title: "", content: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    await axiosClient.delete(`/posts/${id}`);
    setPosts(posts.filter((p) => p.post_id !== id));
  };

  return (
    <div>
      <h2>Quản lý Posts</h2>

      <h4>Thêm bài viết mới</h4>
      <input
        type="text"
        placeholder="Tiêu đề"
        value={newPost.title}
        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
      />
      <br />
      <textarea
        placeholder="Nội dung"
        value={newPost.content}
        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
      />
      <br />
      <button onClick={handleAdd}>Thêm</button>

      <h4>Danh sách bài viết</h4>
      <ul>
        {posts.map((p) => (
          <li key={p.post_id}>
            {p.title}{" "}
            <button onClick={() => handleDelete(p.post_id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
