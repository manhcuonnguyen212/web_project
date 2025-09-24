import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // backend Express
});

// --- Auth ---
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// --- Posts ---
export const getPosts = () => api.get("/posts");
export const getPost = (id) => api.get(`/posts/${id}`);
export const addPost = (data) => api.post("/posts", data);
export const addComment = (id, data) => api.post(`/posts/${id}/comments`, data);

// --- Users ---
export const getUsers = () => api.get("/users");
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
