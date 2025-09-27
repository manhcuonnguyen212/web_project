import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  if (role === "admin" && !adminToken) {
    return <Navigate to="/admin/login" />;
  }
  if (role === "user" && !userToken) {
    return <Navigate to="/login" />;
  }
  return children;
}
