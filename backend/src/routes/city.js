// City routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { z } from "zod";

const router = Router();

const createCitySchema = z.object({
  name: z.string().min(1),
  state_id: z.number().int().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const updateCitySchema = z.object({
  name: z.string().min(1).optional(),
  state_id: z.number().int().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

/**
 * GET /city - Get all cities
 */
router.get("/", async (req, res, next) => {
  try {
    const { state_id } = req.query;

    let query = `
      SELECT c.city_id, c.name, c.latitude, c.longitude, c.state_id, s.name as state_name
      FROM city c
      LEFT JOIN state s ON s.state_id = c.state_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (state_id) {
      paramCount++;
      query += ` AND c.state_id = $${paramCount}`;
      params.push(state_id);
    }

    query += ` ORDER BY c.name ASC`;

    const q = await pool.query(query, params);
    return res.json({ cities: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /city/:id - Get city by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      `SELECT c.*, s.name as state_name
       FROM city c
       LEFT JOIN state s ON s.state_id = c.state_id
       WHERE c.city_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "City not found" });
    }

    return res.json({ city: q.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /city - Create city (Admin only)
 */
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = createCitySchema.parse(req.body);

    // Verify state exists if provided
    if (data.state_id) {
      const stateCheck = await pool.query(
        `SELECT state_id FROM state WHERE state_id = $1`,
        [data.state_id]
      );

      if (!stateCheck.rowCount) {
        return res.status(404).json({ error: "State not found" });
      }
    }

    const result = await pool.query(
      `INSERT INTO city (name, state_id, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.name,
        data.state_id || null,
        data.latitude || null,
        data.longitude || null
      ]
    );

    return res.status(201).json({ city: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /city/:id - Update city (Admin only)
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateCitySchema.parse(req.body);

    // Check if city exists
    const cityCheck = await pool.query(
      `SELECT city_id FROM city WHERE city_id = $1`,
      [id]
    );

    if (!cityCheck.rowCount) {
      return res.status(404).json({ error: "City not found" });
    }

    // Verify state exists if provided
    if (data.state_id) {
      const stateCheck = await pool.query(
        `SELECT state_id FROM state WHERE state_id = $1`,
        [data.state_id]
      );

      if (!stateCheck.rowCount) {
        return res.status(404).json({ error: "State not found" });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(data.name);
    }
    if (data.state_id !== undefined) {
      paramCount++;
      updates.push(`state_id = $${paramCount}`);
      values.push(data.state_id);
    }
    if (data.latitude !== undefined) {
      paramCount++;
      updates.push(`latitude = $${paramCount}`);
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      paramCount++;
      updates.push(`longitude = $${paramCount}`);
      values.push(data.longitude);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE city
      SET ${updates.join(", ")}
      WHERE city_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);
    return res.json({ city: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

