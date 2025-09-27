import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    axiosClient.get("/posts").then((res) => setPosts(res.data));
    axiosClient.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category_id === parseInt(selectedCategory))
    : posts;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Danh sách bài viết</h1>

      <select
        onChange={(e) => setSelectedCategory(e.target.value)}
        value={selectedCategory}
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c.category_id} value={c.category_id}>
            {c.name}
          </option>
        ))}
      </select>

      {filteredPosts.map((post) => (
        <div key={post.post_id} style={{ marginTop: "20px" }}>
          <h3>{post.title}</h3>
          <p>{post.content.substring(0, 150)}...</p>
          <Link to={`/post/${post.post_id}`}>Xem chi tiết</Link>
          <hr />
        </div>
      ))}
    </div>
  );
}
