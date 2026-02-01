// Tracking routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { NotFoundError } from "../utils/errors.js";
import { z } from "zod";

const router = Router();

const createTrackingEventSchema = z.object({
  parcel_id: z.number().int().positive(),
  event_type: z.string(),
  location: z.string().optional(),
  note: z.string().optional(),
  proof: z.string().optional()
});

/**
 * GET /tracking/:trackingCode - Get tracking info by tracking code (public)
 */
router.get("/:trackingCode", async (req, res, next) => {
  try {
    const { trackingCode } = req.params;

    // Get parcel by tracking code (handle both UUID and string formats)
    // Try UUID first, then try as text
    let parcelQ;
    try {
      // Try as UUID
      parcelQ = await pool.query(
        `SELECT p.*,
                (SELECT json_agg(json_build_object(
                  'item_id', pi.item_id,
                  'description', pi.description,
                  'quantity', pi.quantity,
                  'declared_value', pi.declared_value
                )) FROM parcel_item pi WHERE pi.parcel_id = p.parcel_id) as items
         FROM parcel p
         WHERE p.tracking_code = $1::uuid`,
        [trackingCode]
      );
    } catch (e) {
      // If UUID conversion fails, try as text
      parcelQ = await pool.query(
        `SELECT p.*,
                (SELECT json_agg(json_build_object(
                  'item_id', pi.item_id,
                  'description', pi.description,
                  'quantity', pi.quantity,
                  'declared_value', pi.declared_value
                )) FROM parcel_item pi WHERE pi.parcel_id = p.parcel_id) as items
         FROM parcel p
         WHERE p.tracking_code::text = $1`,
        [trackingCode]
      );
    }

    if (!parcelQ.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelQ.rows[0];

    // Get tracking events
    const eventsQ = await pool.query(
      `SELECT te.*, u.username as actor_name
       FROM tracking_event te
       LEFT JOIN app_user u ON u.user_id = te.actor_id
       WHERE te.parcel_id = $1
       ORDER BY te.seq ASC, te.event_time ASC`,
      [parcel.parcel_id]
    );

    return res.json({
      parcel,
      events: eventsQ.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /tracking/parcel/:id - Get tracking events for parcel (authenticated)
 */
router.get("/parcel/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Check if user has access to this parcel
    const parcelCheck = await pool.query(
      `SELECT sender_id, recipient_id FROM parcel WHERE parcel_id = $1`,
      [id]
    );

    if (!parcelCheck.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelCheck.rows[0];

    // Permission check
    if (userRole !== "admin" && parcel.sender_id !== userId && parcel.recipient_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get tracking events
    const eventsQ = await pool.query(
      `SELECT te.*, u.username as actor_name, h.name as hub_name
       FROM tracking_event te
       LEFT JOIN app_user u ON u.user_id = te.actor_id
       LEFT JOIN hub h ON h.hub_id = te.hub_id
       WHERE te.parcel_id = $1
       ORDER BY te.seq ASC, te.event_time ASC`,
      [id]
    );

    return res.json({ events: eventsQ.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /tracking/events - Create tracking event (authenticated)
 */
router.post("/events", requireAuth, async (req, res, next) => {
  try {
    const data = createTrackingEventSchema.parse(req.body);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Verify parcel exists
    const parcelCheck = await pool.query(
      `SELECT * FROM parcel WHERE parcel_id = $1`,
      [data.parcel_id]
    );

    if (!parcelCheck.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelCheck.rows[0];

    // Permission check: courier can create events for assigned parcels, admin for any
    if (userRole !== "admin") {
      if (userRole === "courier" && parcel.assigned_courier_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (userRole === "customer") {
        return res.status(403).json({ error: "Customers cannot create tracking events" });
      }
    }

    // Get next sequence number
    const seqQ = await pool.query(
      `SELECT COALESCE(MAX(seq), -1) + 1 as next_seq
       FROM tracking_event WHERE parcel_id = $1`,
      [data.parcel_id]
    );
    const nextSeq = parseInt(seqQ.rows[0].next_seq);

    // Create tracking event
    const result = await pool.query(
      `INSERT INTO tracking_event (parcel_id, seq, event_type, actor_id, note, proof)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.parcel_id,
        nextSeq,
        data.event_type,
        userId,
        data.note || null,
        data.proof ? JSON.stringify(data.proof) : null
      ]
    );

    return res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

