import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    axiosClient.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const handleAdd = async () => {
    const res = await axiosClient.post("/categories", { name: newCat });
    setCategories([...categories, res.data]);
    setNewCat("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    await axiosClient.delete(`/categories/${id}`);
    setCategories(categories.filter((c) => c.category_id !== id));
  };

  return (
    <div>
      <h2>Quản lý Categories</h2>

      <input
        type="text"
        placeholder="Tên danh mục"
        value={newCat}
        onChange={(e) => setNewCat(e.target.value)}
      />
      <button onClick={handleAdd}>Thêm</button>

      <ul>
        {categories.map((c) => (
          <li key={c.category_id}>
            {c.name}{" "}
            <button onClick={() => handleDelete(c.category_id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
