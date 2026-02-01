import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";
import orderRoutes from "../modules/order/order.routes.js";
import storeRoutes from "../modules/store/store.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);

export default router;
