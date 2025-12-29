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
} from "../app/controllers/NewsController.js";

import { verifyAdmin, verifyToken } from "../middlewares/verify.js";

const router = express.Router();

// admin routes đặt trước
router.get("/admin", verifyAdmin, getAllNewsByAdmin);
router.get("/admin/recent", verifyAdmin, getRecentNews);
router.put("/admin/toggle-status/:id", verifyAdmin, toggleNewsStatus);
router.post("/", verifyAdmin, createNews);
router.put("/:id", verifyAdmin, updateNews);
router.delete("/:id", verifyAdmin, deleteNews);

// routes public
router.get("/", getNews);
router.get("/:id", getNewsById);

// user routes (authenticated)
router.post("/like/:id", verifyToken, toggleLikeNews);
router.post("/save/:id", verifyToken, toggleSaveNews);

export default router;
