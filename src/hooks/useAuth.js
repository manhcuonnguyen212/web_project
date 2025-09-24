import { useState, useEffect } from "react";

const USER_KEY = "blog_users";
const CURRENT_KEY = "current_user";

// Hook quản lý user
export function useAuth() {
  const [user, setUser] = useState(null);

  // load user khi app start
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem(CURRENT_KEY));
    if (current) setUser(current);
  }, []);

  // đăng nhập
  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(found));
      setUser(found);
      alert("Đăng nhập thành công!");
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  // đăng ký
  const register = (username, password) => {
    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    if (users.some((u) => u.username === username)) {
      alert("Tài khoản đã tồn tại!");
      return;
    }
    const newUser = { username, password, name: "", year: "", address: "" };
    users.push(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_KEY, JSON.stringify(newUser));
    setUser(newUser);
    alert("Đăng ký thành công!");
  };

  // đăng xuất
  const logout = () => {
    localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  };

  // cập nhật thông tin user
  const updateUser = (updatedUser) => {
    let users = JSON.parse(localStorage.getItem(USER_KEY)) || [];
    users = users.map((u) =>
      u.username === updatedUser.username ? updatedUser : u
    );
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return { user, login, register, logout, updateUser };
}
