import express from "express";
import { createStore, getMyStores, getNearbyStores } from "../controllers/store.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createStore);
router.get("/my", authMiddleware, getMyStores);
router.get("/nearby", authMiddleware, getNearbyStores);

export default router;
