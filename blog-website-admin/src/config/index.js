const isProd = process.env.NODE_ENV === "production";
export const BASE_URL = isProd
  ? "https://doanlaptrinhweb-server.onrender.com/api/v1"
  : "http://localhost:5000/api/v1";
export const BASE_IMAGE_URL = isProd
  ? "https://doanlaptrinhweb-server.onrender.com"
  : "http://localhost:5000";