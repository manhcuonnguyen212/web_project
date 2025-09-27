import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// User pages
import Home from "./pages/user/Home";
import PostDetail from "./pages/user/PostDetail";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Profile from "./pages/user/UserProfile";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Posts from "./pages/admin/Posts";
import Categories from "./pages/admin/Categories";

function App() {
  return (
    <Router>
      <Routes>
        {/* User UI */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/post/:id" element={<><Navbar /><PostDetail /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route
          path="/profile"
          element={
            <PrivateRoute role="user">
              <><Navbar /><Profile /></>
            </PrivateRoute>
          }
        />

        {/* Admin UI */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="categories" element={<Categories />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
