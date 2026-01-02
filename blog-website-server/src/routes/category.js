import express from "express";
import {
  getAllCategories,
  createCategory,
  editCategory,
  deleteCategory,
} from "../app/controllers/CategoryController.js";
import { verifyAdmin } from "../middlewares/verify.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyAdmin, createCategory);
router.put("/:categoryId", verifyAdmin, editCategory);
router.delete("/:categoryId", verifyAdmin, deleteCategory);

export default router;
