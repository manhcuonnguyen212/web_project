import { Link } from "react-router-dom";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/">Trang chủ</Link> |{" "}
      <Link to="/login">Đăng nhập</Link> |{" "}
      <Link to="/register">Đăng ký</Link> |{" "}
      <Link to="/profile">Tài khoản</Link> |{" "}
      <button onClick={handleLogout}>Đăng xuất</button>
    </nav>
  );
}
