import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createProductController, getStoreProductsController } from "./product.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createProductController);
router.get("/store/:storeId", authMiddleware, getStoreProductsController);

export default router;
