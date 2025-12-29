import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user"); // hoặc parse JSON nếu bạn lưu object
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;