
import express from "express";
import {
  getNews,
  getNewsById,
  getRecentNews,
  getAllNewsByAdmin,
  toggleNewsStatus,
  updateNews,
  createNews,
  deleteNews,
  toggleLikeNews,
  toggleSaveNews,
  uploadImage,
  getPostStats,
} from "../app/controllers/NewsController.js";
import { verifyAdmin, verifyToken } from "../middlewares/verify.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/admin/stats", verifyAdmin, getPostStats);

// Upload ảnh đại diện bài viết
router.post('/upload-image', upload.single('featuredImage'), uploadImage);

// admin routes đặt trước
router.get("/admin", verifyAdmin, getAllNewsByAdmin);
router.get("/admin/recent", verifyAdmin, getRecentNews);
router.put("/admin/toggle-status/:id", verifyAdmin, toggleNewsStatus);
router.post("/", verifyAdmin, upload.single("featuredImage"), createNews);
router.put("/:id", verifyAdmin, updateNews);
router.delete("/:id", verifyAdmin, deleteNews);

// routes public
router.get("/", getNews);
router.get("/:id", getNewsById);

// user routes (authenticated)
router.post("/like/:id", verifyToken, toggleLikeNews);
router.post("/save/:id", verifyToken, toggleSaveNews);

export default router;
