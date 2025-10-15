import express from "express";

import {
  register,
  login,
  logout,
  refreshToken,
  adminLogin,
  adminLogout,
} from "../app/controllers/AuthController.js";
import { verifyAdmin, verifyToken } from "../middlewares/verify.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshToken", refreshToken);
router.post("/logout", verifyToken, logout);

// admin routes
router.post("/admin/login", adminLogin);
router.post("/admin/logout", verifyAdmin, adminLogout);

export default router;
