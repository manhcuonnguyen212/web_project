import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginSuccess, logoutSuccess } from "../redux/authSlice";
import { useCallback } from "react";
import { BASE_URL } from "./index";

const useAxiosJWT = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);

  const axiosJWT = useCallback(() => {
    const instance = axios.create();
    const handleRefreshToken = async () => {
      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refreshToken`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        return res.data;
      } catch (error) {
        // Nếu refresh token thất bại, logout và chuyển về trang login
        dispatch(logoutSuccess());
        window.location.href = "/admin/login";
        throw error;
      }
    };

    instance.interceptors.request.use(
      async (config) => {
        let date = new Date();
        const decodedToken = jwtDecode(user?.accessToken);
        if (decodedToken.exp < date.getTime() / 1000) {
          const data = await handleRefreshToken();

          const refreshUser = { ...user, accessToken: data.accessToken };
          dispatch(loginSuccess(refreshUser));
          config.headers["Authorization"] = `Bearer ${data.accessToken}`;
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    // Thêm response interceptor để handle lỗi 401
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token không hợp lệ hoặc hết hạn, chỉ thông báo lỗi, không logout ngay lập tức
          // Có thể toast lỗi ở đây
          // toast.error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
          // Nếu muốn logout, chỉ logout khi refresh token thất bại (đã xử lý ở trên)
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [dispatch, user]);
  return axiosJWT;
};

export default useAxiosJWT;
