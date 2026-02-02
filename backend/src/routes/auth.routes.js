import express from "express";
import {
    register,
    login,
    refreshToken,
    logout,
    changePassword
} from "../controllers/auth.controller.js";

import { getProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/signup", register); // Alias for frontend compatibility
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePassword);

export default router;
