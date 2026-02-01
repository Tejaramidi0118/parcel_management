import express from "express";
import { getMyAddresses, addAddress, deleteAddress } from "../controllers/address.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyAddresses);
router.post("/", authMiddleware, addAddress);
router.delete("/:id", authMiddleware, deleteAddress);

export default router;
