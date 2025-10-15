import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Home from "./pages/Home/Home";
import PostDetail from "./pages/BlogDetail/BlogDetail";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import Profile from "./pages/Profile/Profile";
import Header from "./components/Header/Header";

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/register", "/forgot-password"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="app">
      {shouldShowHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ToastContainer position="top-right" autoClose="1500" />
    </div>
  );
}

export default App;
