import express from "express";
import { createStore, updateStore, getMyStores, getNearbyStores, getStoreById } from "../controllers/store.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createStore);
router.put("/:id", authMiddleware, updateStore);
router.get("/my", authMiddleware, getMyStores);
router.get("/nearby", authMiddleware, getNearbyStores);
router.get("/:id", authMiddleware, getStoreById);

export default router;
