import express from "express";
import { getDistricts, createDistrict } from "../controllers/district.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getDistricts);
router.post("/", authMiddleware, createDistrict);

export default router;
