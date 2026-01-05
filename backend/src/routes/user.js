// User routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { z } from "zod";
import bcrypt from "bcryptjs";

const router = Router();

const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address_street: z.string().optional(),
  address_area: z.string().optional(),
  address_city: z.string().optional(),
  address_pincode: z.string().optional()
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8)
});

/**
 * GET /user - Get all users (Admin only)
 */
router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.query;

    let query = `
      SELECT user_id, username, full_name, email, role, phone,
             address_street, address_area, address_city, address_pincode,
             created_at
      FROM app_user
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC`;

    const q = await pool.query(query, params);
    return res.json({ users: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /user/:id - Get user by ID
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Permission check: admin can see any, others only themselves
    if (userRole !== "admin" && parseInt(id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const q = await pool.query(
      `SELECT user_id, username, full_name, email, role, phone,
              address_street, address_area, address_city, address_pincode,
              created_at
       FROM app_user
       WHERE user_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: q.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /user/:id/parcels - Get user's parcels
 */
router.get("/:id/parcels", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Permission check
    if (userRole !== "admin" && parseInt(id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const q = await pool.query(
      `SELECT p.*
       FROM parcel p
       WHERE p.sender_id = $1 OR p.recipient_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.json({ parcels: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /user/:id - Update user (Admin or self)
 */
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Permission check
    if (userRole !== "admin" && parseInt(id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Check if user exists
    const userCheck = await pool.query(
      `SELECT user_id FROM app_user WHERE user_id = $1`,
      [id]
    );

    if (!userCheck.rowCount) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.full_name !== undefined) {
      paramCount++;
      updates.push(`full_name = $${paramCount}`);
      values.push(data.full_name);
    }
    if (data.email !== undefined) {
      // Check if email already exists (excluding current user)
      const emailCheck = await pool.query(
        `SELECT user_id FROM app_user WHERE email = $1 AND user_id != $2`,
        [data.email, id]
      );
      if (emailCheck.rowCount) {
        return res.status(409).json({ error: "Email already exists" });
      }
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      values.push(data.phone);
    }
    if (data.address_street !== undefined) {
      paramCount++;
      updates.push(`address_street = $${paramCount}`);
      values.push(data.address_street);
    }
    if (data.address_area !== undefined) {
      paramCount++;
      updates.push(`address_area = $${paramCount}`);
      values.push(data.address_area);
    }
    if (data.address_city !== undefined) {
      paramCount++;
      updates.push(`address_city = $${paramCount}`);
      values.push(data.address_city);
    }
    if (data.address_pincode !== undefined) {
      paramCount++;
      updates.push(`address_pincode = $${paramCount}`);
      values.push(data.address_pincode);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE app_user
      SET ${updates.join(", ")}
      WHERE user_id = $${paramCount}
      RETURNING user_id, username, full_name, email, role, phone,
                address_street, address_area, address_city, address_pincode,
                created_at
    `;

    const result = await pool.query(updateQuery, values);
    return res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /user/:id/password - Change password
 */
router.put("/:id/password", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = changePasswordSchema.parse(req.body);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Permission check: users can only change their own password
    if (parseInt(id) !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get current user with password
    const userCheck = await pool.query(
      `SELECT password_hash FROM app_user WHERE user_id = $1`,
      [id]
    );

    if (!userCheck.rowCount) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      data.current_password,
      userCheck.rows[0].password_hash
    );

    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.new_password, 10);

    // Update password
    await pool.query(
      `UPDATE app_user SET password_hash = $1 WHERE user_id = $2`,
      [newPasswordHash, id]
    );

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /user/:id - Delete user (Admin only)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const result = await pool.query(
      `DELETE FROM app_user WHERE user_id = $1 RETURNING user_id`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;

