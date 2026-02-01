import express from "express";
import { getProfile, getUsers, getUser, deleteUser, updateUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.get("/me", authMiddleware, getProfile);
router.get("/:id", authMiddleware, getUser);
router.delete("/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, updateUser);

export default router;
