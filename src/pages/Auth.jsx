
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    isRegister ? register(form.username, form.password) : login(form.username, form.password);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-xl w-96">
        <h1 className="text-xl font-bold mb-4">
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </h1>
        <input
          name="username"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </button>
        <p
          className="mt-3 text-blue-600 cursor-pointer text-sm"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
        </p>
      </form>
    </div>
  );
}
