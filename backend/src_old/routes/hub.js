// Hub routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createHubSchema = z.object({
  name: z.string().min(1),
  city_id: z.number().int().positive(),
  address: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  contact: z.string().optional()
});

const updateHubSchema = z.object({
  name: z.string().min(1).optional(),
  city_id: z.number().int().positive().optional(),
  address: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  contact: z.string().optional()
});

/**
 * GET /hub - Get all hubs
 */
router.get("/", async (req, res, next) => {
  try {
    const { city_id } = req.query;

    let query = `
      SELECT h.*, c.name as city_name, c.state_id
      FROM hub h
      LEFT JOIN city c ON c.city_id = h.city_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (city_id) {
      paramCount++;
      query += ` AND h.city_id = $${paramCount}`;
      params.push(city_id);
    }

    query += ` ORDER BY h.name ASC`;

    const q = await pool.query(query, params);
    return res.json({ hubs: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /hub/:id - Get hub by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      `SELECT h.*, c.name as city_name, c.state_id
       FROM hub h
       LEFT JOIN city c ON c.city_id = h.city_id
       WHERE h.hub_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "Hub not found" });
    }

    return res.json({ hub: q.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /hub/:id/parcels - Get parcels at hub
 */
router.get("/:id/parcels", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      `SELECT p.*
       FROM parcel p
       WHERE p.assigned_hub_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.json({ parcels: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /hub - Create hub (Admin only)
 */
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = createHubSchema.parse(req.body);

    // Verify city exists
    const cityCheck = await pool.query(
      `SELECT city_id FROM city WHERE city_id = $1`,
      [data.city_id]
    );

    if (!cityCheck.rowCount) {
      return res.status(404).json({ error: "City not found" });
    }

    const result = await pool.query(
      `INSERT INTO hub (name, city_id, capacity, contact)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.name,
        data.city_id,
        data.capacity || 100,
        data.contact || null
      ]
    );

    return res.status(201).json({ hub: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /hub/:id - Update hub (Admin only)
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateHubSchema.parse(req.body);

    // Check if hub exists
    const hubCheck = await pool.query(
      `SELECT hub_id FROM hub WHERE hub_id = $1`,
      [id]
    );

    if (!hubCheck.rowCount) {
      return res.status(404).json({ error: "Hub not found" });
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
    if (data.city_id !== undefined) {
      // Verify city exists
      const cityCheck = await pool.query(
        `SELECT city_id FROM city WHERE city_id = $1`,
        [data.city_id]
      );
      if (!cityCheck.rowCount) {
        return res.status(404).json({ error: "City not found" });
      }
      paramCount++;
      updates.push(`city_id = $${paramCount}`);
      values.push(data.city_id);
    }
    if (data.capacity !== undefined) {
      paramCount++;
      updates.push(`capacity = $${paramCount}`);
      values.push(data.capacity);
    }
    if (data.contact !== undefined) {
      paramCount++;
      updates.push(`contact = $${paramCount}`);
      values.push(data.contact);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE hub
      SET ${updates.join(", ")}
      WHERE hub_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);
    return res.json({ hub: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /hub/:id - Delete hub (Admin only)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM hub WHERE hub_id = $1 RETURNING *`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Hub not found" });
    }

    return res.json({ message: "Hub deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;

