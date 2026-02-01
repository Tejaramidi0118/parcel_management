import express from "express";
import { createProduct, getStoreProducts, deleteProduct } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/store/:store_id", authMiddleware, getStoreProducts);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
