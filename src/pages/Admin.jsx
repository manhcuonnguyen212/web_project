import React, { useState } from "react";
import { getPosts, addPost, deletePost } from "../api/mockApi";

export default function Admin() {
  const [posts, setPosts] = useState(getPosts());
  const [form, setForm] = useState({ title: "", content: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = () => {
    if (!form.title || !form.content) return;
    addPost(form);
    setPosts(getPosts());
    setForm({ title: "", content: "" });
  };

  const handleDelete = (id) => {
    deletePost(id);
    setPosts(getPosts());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý bài viết</h1>
      <div className="mb-6">
        <input
          name="title"
          value={form.title}
          placeholder="Tiêu đề"
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <textarea
          name="content"
          value={form.content}
          placeholder="Nội dung"
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm bài viết
        </button>
      </div>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id} className="border p-3 rounded flex justify-between items-center">
            <span>{post.title}</span>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-red-600 hover:underline"
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
