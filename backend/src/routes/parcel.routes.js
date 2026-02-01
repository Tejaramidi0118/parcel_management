import express from "express";
import {
    createParcel,
    getMyParcels,
    getAllParcels,
    getParcelById
} from "../controllers/parcel.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createParcel);
router.get("/my", authMiddleware, getMyParcels);
router.get("/", authMiddleware, getAllParcels); // Admin usually
router.get("/:id", authMiddleware, getParcelById);

export default router;
