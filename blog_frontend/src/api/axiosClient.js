import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
