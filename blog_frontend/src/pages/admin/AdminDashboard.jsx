import { Link, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#f0f0f0", padding: "20px" }}>
        <h3>Admin Panel</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/admin/users">Quản lý Users</Link>
          </li>
          <li>
            <Link to="/admin/posts">Quản lý Posts</Link>
          </li>
          <li>
            <Link to="/admin/categories">Quản lý Categories</Link>
          </li>
        </ul>
      </div>

      {/* Nội dung chính */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
