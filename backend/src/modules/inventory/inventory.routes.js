import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { addInventoryController, updateStockController, getInventoryController } from "./inventory.controller.js";

const router = express.Router();

router.post("/add", authMiddleware, addInventoryController);
router.put("/:storeId/product/:productId", authMiddleware, updateStockController);
router.get("/store/:storeId", authMiddleware, getInventoryController);

export default router;
