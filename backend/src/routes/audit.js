// Audit log routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

/**
 * GET /audit - Get audit logs (Admin only)
 */
router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { entity_name, entity_id, actor_id, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT a.*, u.username as actor_username, u.full_name as actor_name
      FROM audit_log a
      LEFT JOIN app_user u ON u.user_id = a.actor_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (entity_name) {
      paramCount++;
      query += ` AND a.entity_name = $${paramCount}`;
      params.push(entity_name);
    }

    if (entity_id) {
      paramCount++;
      query += ` AND a.entity_id = $${paramCount}`;
      params.push(entity_id);
    }

    if (actor_id) {
      paramCount++;
      query += ` AND a.actor_id = $${paramCount}`;
      params.push(actor_id);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const q = await pool.query(query, params);
    return res.json({ logs: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /audit/:id - Get audit log by ID
 */
router.get("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const q = await pool.query(
      `SELECT a.*, u.username as actor_username, u.full_name as actor_name
       FROM audit_log a
       LEFT JOIN app_user u ON u.user_id = a.actor_id
       WHERE a.audit_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    return res.json({ log: q.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /audit/user/:userId - Get audit logs for user
 */
router.get("/user/:userId", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const q = await pool.query(
      `SELECT a.*, u.username as actor_username, u.full_name as actor_name
       FROM audit_log a
       LEFT JOIN app_user u ON u.user_id = a.actor_id
       WHERE a.actor_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    return res.json({ logs: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /audit/entity/:type/:id - Get audit logs for entity
 */
router.get("/entity/:type/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const q = await pool.query(
      `SELECT a.*, u.username as actor_username, u.full_name as actor_name
       FROM audit_log a
       LEFT JOIN app_user u ON u.user_id = a.actor_id
       WHERE a.entity_name = $1 AND a.entity_id = $2
       ORDER BY a.created_at DESC
       LIMIT $3 OFFSET $4`,
      [type, id, parseInt(limit), parseInt(offset)]
    );

    return res.json({ logs: q.rows });
  } catch (err) {
    next(err);
  }
});

export default router;

