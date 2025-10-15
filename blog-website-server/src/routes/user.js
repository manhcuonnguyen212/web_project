import express from "express";
import {
  changePassword,
  changeUserInfo,
  forgetPassword,
  getAllUsers,
  toggleStatus,
  deleteUser,
  updateUserByAdmin,
  getAdmins,
  changePasswordAdmin,
  deleteAdmin,
  createAdmin,
  editAdmin,
} from "../app/controllers/UserController.js";
import { verifyAdmin, verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.put("/change-info", verifyToken, changeUserInfo);
router.put("/change-password", verifyToken, changePassword);
router.post("/forget-password", forgetPassword);

// admin routes
router.get("/admins", verifyAdmin, getAdmins);
router.post("/admin", verifyAdmin, createAdmin);
router.put("/admin/:targetAdminId", verifyAdmin, editAdmin);
router.put("/admin/change-password/:targetAdminId", verifyAdmin, changePasswordAdmin);
router.delete("/admin/:targetAdminId", verifyAdmin, deleteAdmin);
router.get("/", verifyAdmin, getAllUsers);
router.put("/toggle-status/:userId", verifyAdmin, toggleStatus);
router.put("/update/:userId", verifyAdmin, updateUserByAdmin);
router.delete("/:userId", verifyAdmin, deleteUser);

export default router;
