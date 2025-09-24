import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(user || {});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    updateUser(form);
    alert("Cập nhật thành công!");
  };

  if (!user) return <div className="p-6">Bạn cần đăng nhập để xem trang này.</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Thông tin cá nhân</h1>
      <input
        name="name"
        value={form.name || ""}
        placeholder="Họ tên"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />
      <input
        name="year"
        value={form.year || ""}
        placeholder="Năm sinh"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />
      <input
        name="address"
        value={form.address || ""}
        placeholder="Địa chỉ"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />
      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Lưu thay đổi
      </button>
    </div>
  );
}
