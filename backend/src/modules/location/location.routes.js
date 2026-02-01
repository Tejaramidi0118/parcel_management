import express from "express";
import prisma from "../../config/prisma.js";

const router = express.Router();

router.get("/states", async (req, res) => {
    const states = await prisma.state.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: states });
});

router.get("/states/:stateId/districts", async (req, res) => {
    const { stateId } = req.params;
    const districts = await prisma.district.findMany({
        where: { stateId },
        orderBy: { name: "asc" }
    });
    res.json({ success: true, data: districts });
});

export default router;
