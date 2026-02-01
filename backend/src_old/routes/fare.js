// Fare calculation routes
import { Router } from "express";
import { calculateFare } from "../utils/helpers.js";
import { z } from "zod";

const router = Router();

const calculateFareSchema = z.object({
  weight: z.number().positive(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  distance: z.number().nonnegative().optional()
});

/**
 * GET /fare/calculate - Calculate fare
 */
router.get("/calculate", async (req, res, next) => {
  try {
    const data = calculateFareSchema.parse({
      weight: parseFloat(req.query.weight),
      length: parseFloat(req.query.length),
      width: parseFloat(req.query.width),
      height: parseFloat(req.query.height),
      distance: req.query.distance ? parseFloat(req.query.distance) : undefined
    });

    const fare = calculateFare(data.weight, data.length, data.width, data.height, data.distance || null);

    return res.json({
      fare: Math.round(fare * 100) / 100, // Round to 2 decimal places
      breakdown: {
        base: 50,
        weight: data.weight * 10,
        volume: data.length * data.width * data.height * 0.5,
        distance: data.distance ? data.distance * 2 : 0
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

