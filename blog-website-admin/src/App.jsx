import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AdminLogin from "./pages/Auth/AdminLogin";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Users from "./pages/Users/Users";
import Posts from "./pages/Posts/Posts";
import Categories from "./pages/Categories/Categories";
import Admins from "./pages/Admins/Admins";
import Comments from "./pages/Comments/Comments";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="comments" element={<Comments />} />
          <Route path="admins" element={<Admins />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose="1500" />
    </div>
  );
}

export default App;
