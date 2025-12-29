import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPenNib,
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

import {
  logoutStart,
  logoutSuccess,
  logoutFailed,
} from "../../redux/authSlice";
import { BASE_URL } from "../../config";
import useAxiosJWT from "../../config/axiosConfig";
import NotificationBell from "../NotificationBell/NotificationBell";

import "./Header.css";
function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const getAxiosJWT = useAxiosJWT();
  const axiosJWT = getAxiosJWT();

  const navigate = useNavigate();

  const handleLogout = async () => {
    dispatch(logoutStart())
    try {
      const res = await axiosJWT.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const result = res.data;
      if (result.success) {
        dispatch(logoutSuccess())
        toast.success(result.message);
        navigate("/");
      }
    } catch (error) {
      dispatch(logoutFailed())
      return toast.error(error.response?.data?.message);
    }
  };

  return (
    <header className="site-header">
      <div className="container">
        <h1 className="logo">
          <Link to="/">
            <FaPenNib className="logo-icon" />
            <span>MyBlog</span>
          </Link>
        </h1>
        <nav className="main-nav">
          <NavLink to="/" end>
            <FaHome />
            <span>Home</span>
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile">
                <FaUser />
                <span>Profile</span>
              </NavLink>
              <NotificationBell />
              <button onClick={handleLogout} className="nav-logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <FaSignInAlt />
                <span>Login</span>
              </NavLink>
              <NavLink to="/register">
                <FaUserPlus />
                <span>Register</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
