// Vehicle routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createVehicleSchema = z.object({
  courier_id: z.number().int().positive(),
  license_plate: z.string().min(1),
  capacity_kg: z.number().positive(),
  status: z.enum(['active', 'inactive', 'maintenance', 'idle']).optional()
});

const updateVehicleSchema = z.object({
  license_plate: z.string().min(1).optional(),
  capacity_kg: z.number().positive().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'idle']).optional()
});

/**
 * GET /vehicle - Get all vehicles
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { courier_id, status } = req.query;

    let query = `
      SELECT v.*, u.username as courier_username, u.full_name as courier_name
      FROM vehicle v
      LEFT JOIN courier c ON c.user_id = v.courier_id
      LEFT JOIN app_user u ON u.user_id = v.courier_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (courier_id) {
      paramCount++;
      query += ` AND v.courier_id = $${paramCount}`;
      params.push(courier_id);
    }

    if (status) {
      paramCount++;
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY v.vehicle_id DESC`;

    const q = await pool.query(query, params);
    return res.json({ vehicles: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /vehicle/my - Get current courier's vehicle
 */
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (req.user.role !== "courier" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const q = await pool.query(
      `SELECT v.*
       FROM vehicle v
       WHERE v.courier_id = $1
       ORDER BY v.vehicle_id DESC
       LIMIT 1`,
      [userId]
    );

    return res.json({ vehicle: q.rows[0] || null });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /vehicle/:id - Get vehicle by ID
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      `SELECT v.*, u.username as courier_username, u.full_name as courier_name
       FROM vehicle v
       LEFT JOIN courier c ON c.user_id = v.courier_id
       LEFT JOIN app_user u ON u.user_id = v.courier_id
       WHERE v.vehicle_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    return res.json({ vehicle: q.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /vehicle - Create vehicle (Admin only)
 */
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const data = createVehicleSchema.parse(req.body);

    // Verify courier exists and is a courier
    const courierCheck = await pool.query(
      `SELECT u.user_id FROM app_user u
       JOIN courier c ON c.user_id = u.user_id
       WHERE u.user_id = $1`,
      [data.courier_id]
    );

    if (!courierCheck.rowCount) {
      return res.status(404).json({ error: "Courier not found" });
    }

    // Check if license plate already exists
    const plateCheck = await pool.query(
      `SELECT vehicle_id FROM vehicle WHERE license_plate = $1`,
      [data.license_plate]
    );

    if (plateCheck.rowCount) {
      return res.status(409).json({ error: "License plate already exists" });
    }

    const result = await pool.query(
      `INSERT INTO vehicle (courier_id, license_plate, capacity_kg, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.courier_id,
        data.license_plate,
        data.capacity_kg,
        data.status || 'idle'
      ]
    );

    return res.status(201).json({ vehicle: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /vehicle/:id - Update vehicle (Admin or vehicle owner)
 */
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateVehicleSchema.parse(req.body);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Check if vehicle exists
    const vehicleCheck = await pool.query(
      `SELECT courier_id FROM vehicle WHERE vehicle_id = $1`,
      [id]
    );

    if (!vehicleCheck.rowCount) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = vehicleCheck.rows[0];

    // Permission check: admin or vehicle owner
    if (userRole !== "admin" && vehicle.courier_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.license_plate !== undefined) {
      // Check if license plate already exists (excluding current vehicle)
      const plateCheck = await pool.query(
        `SELECT vehicle_id FROM vehicle WHERE license_plate = $1 AND vehicle_id != $2`,
        [data.license_plate, id]
      );
      if (plateCheck.rowCount) {
        return res.status(409).json({ error: "License plate already exists" });
      }
      paramCount++;
      updates.push(`license_plate = $${paramCount}`);
      values.push(data.license_plate);
    }
    if (data.capacity_kg !== undefined) {
      paramCount++;
      updates.push(`capacity_kg = $${paramCount}`);
      values.push(data.capacity_kg);
    }
    if (data.status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE vehicle
      SET ${updates.join(", ")}
      WHERE vehicle_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);
    return res.json({ vehicle: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /vehicle/:id - Delete vehicle (Admin only)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM vehicle WHERE vehicle_id = $1 RETURNING *`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    return res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;

