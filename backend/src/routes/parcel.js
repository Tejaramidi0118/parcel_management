// Parcel routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin, requireCustomer } from "../middleware/roleMiddleware.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors.js";
import { parseDimensions, calculateFare } from "../utils/helpers.js";
import { z } from "zod";
import { PARCEL_STATUSES } from "../utils/constants.js";

const router = Router();

// Validation schemas
const createParcelSchema = z.object({
  recipient_name: z.string().min(1),
  recipient_phone: z.string().min(7),
  recipient_address_street: z.string().optional(),
  recipient_address_area: z.string().optional(),
  recipient_address_city: z.string().optional(),
  recipient_address_pincode: z.string().optional(),
  recipient_id: z.union([z.number().int().positive(), z.string().transform(Number)]).optional().nullable(),
  pickup_city_id: z.union([z.number().int().positive(), z.string().transform(Number)]).optional().nullable(),
  delivery_city_id: z.union([z.number().int().positive(), z.string().transform(Number)]),
  weight_kg: z.union([z.number().positive(), z.string().transform((val) => parseFloat(val))]).refine((val) => !isNaN(val) && val > 0, "Weight must be a positive number"),
  length_cm: z.union([z.number().positive(), z.string().transform(Number)]).optional(),
  width_cm: z.union([z.number().positive(), z.string().transform(Number)]).optional(),
  height_cm: z.union([z.number().positive(), z.string().transform(Number)]).optional(),
  dimensions: z.string().optional().nullable(), // Alternative to length/width/height
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive().default(1),
    declared_value: z.number().nonnegative().default(0)
  })).optional().default([])
});

const updateParcelSchema = z.object({
  recipient_name: z.string().min(1).optional(),
  recipient_phone: z.string().min(7).optional(),
  recipient_address: z.string().min(1).optional(),
  status: z.enum(['created', 'picked_up', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
  assigned_courier_id: z.number().int().positive().optional().nullable(),
  assigned_hub_id: z.number().int().positive().optional().nullable()
});

/**
 * POST /parcel - Create a new parcel (Customer only)
 */
router.post("/", requireAuth, requireCustomer, async (req, res, next) => {
  try {
    const data = createParcelSchema.parse(req.body);
    const senderId = req.user.user_id;

    // Parse dimensions if provided as string
    let { length_cm, width_cm, height_cm } = data;
    if (data.dimensions && !length_cm) {
      const dims = parseDimensions(data.dimensions);
      length_cm = dims.length;
      width_cm = dims.width;
      height_cm = dims.height;
    } else {
      length_cm = length_cm || 10;
      width_cm = width_cm || 10;
      height_cm = height_cm || 10;
    }

    // Calculate fare (simplified - would need distance calculation in real app)
    const fare = calculateFare(data.weight_kg, length_cm, width_cm, height_cm, null);

    // Check if sender is a customer
    const customerCheck = await pool.query(
      `SELECT 1 FROM customer WHERE user_id = $1`,
      [senderId]
    );
    if (!customerCheck.rowCount) {
      return res.status(403).json({ error: "Only customers can create parcels" });
    }

    // Handle recipient - if recipient_id provided, use it; otherwise create a placeholder or use NULL
    let recipientId = data.recipient_id || null;
    
    // If recipient info provided but no recipient_id, we could create a customer record
    // For now, we'll just use NULL and store recipient info in parcel_item notes or a separate field
    // The schema doesn't have recipient_name/phone/address directly, so we'll store in items or skip for now

    // Calculate expected delivery date (3-5 business days)
    const expectedDeliveryDate = new Date();
    if (pickupCityId && data.delivery_city_id && pickupCityId !== data.delivery_city_id) {
      // Different cities: 5 days
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);
    } else {
      // Same city: 3 days
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
    }

    // Create parcel
    const result = await pool.query(
      `INSERT INTO parcel (
        sender_id, recipient_id, pickup_city_id, delivery_city_id,
        weight_kg, length_cm, width_cm, height_cm, status, expected_delivery_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING parcel_id, tracking_code, sender_id, recipient_id, pickup_city_id, delivery_city_id,
                weight_kg, length_cm, width_cm, height_cm, status, created_at, expected_delivery_date`,
      [
        senderId,
        recipientId,
        pickupCityId,
        data.delivery_city_id,
        data.weight_kg,
        length_cm,
        width_cm,
        height_cm,
        PARCEL_STATUSES.CREATED,
        expectedDeliveryDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      ]
    );

    const parcel = result.rows[0];

    // Insert parcel items if provided
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await pool.query(
          `INSERT INTO parcel_item (parcel_id, description, quantity, declared_value)
           VALUES ($1, $2, $3, $4)`,
          [parcel.parcel_id, item.description, item.quantity, item.declared_value]
        );
      }
    } else {
      // If no items provided, create a default item with recipient info in description if available
      const description = data.recipient_name 
        ? `Recipient: ${data.recipient_name}${data.recipient_phone ? `, Phone: ${data.recipient_phone}` : ''}${data.recipient_address ? `, Address: ${data.recipient_address}` : ''}`
        : 'Parcel item';
      await pool.query(
        `INSERT INTO parcel_item (parcel_id, description, quantity, declared_value)
         VALUES ($1, $2, 1, 0)`,
        [parcel.parcel_id, description]
      );
    }

    // Create initial tracking event
    await pool.query(
      `INSERT INTO tracking_event (parcel_id, seq, event_type, actor_id, note)
       VALUES ($1, 0, $2, $3, $4)`,
      [parcel.parcel_id, 'created', senderId, 'Parcel created']
    );

    // Get items for response
    const itemsQ = await pool.query(
      `SELECT * FROM parcel_item WHERE parcel_id = $1`,
      [parcel.parcel_id]
    );

    return res.status(201).json({
      parcel: {
        ...parcel,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        recipient_address_street: data.recipient_address_street || null,
        recipient_address_area: data.recipient_address_area || null,
        recipient_address_city: data.recipient_address_city || null,
        recipient_address_pincode: data.recipient_address_pincode || null,
        fare,
        items: itemsQ.rows
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /parcel/my - Get current user's parcels (Customer)
 */
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const q = await pool.query(
      `SELECT p.parcel_id, p.tracking_code, p.sender_id, p.recipient_id,
              p.pickup_city_id, p.delivery_city_id, p.assigned_hub_id,
              p.assigned_courier_id, p.weight_kg, p.length_cm, p.width_cm,
              p.height_cm, p.status, p.created_at, p.expected_delivery_date
       FROM parcel p
       WHERE p.sender_id = $1 OR p.recipient_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.json({ parcels: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /parcel/assigned - Get parcels assigned to courier
 */
router.get("/assigned", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== "courier" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const courierId = req.user.user_id;

    const q = await pool.query(
      `SELECT p.parcel_id, p.tracking_code, p.sender_id, p.recipient_id,
              p.pickup_city_id, p.delivery_city_id, p.assigned_hub_id,
              p.assigned_courier_id, p.weight_kg, p.length_cm, p.width_cm,
              p.height_cm, p.status, p.created_at, p.expected_delivery_date
       FROM parcel p
       WHERE p.assigned_courier_id = $1
       ORDER BY p.created_at DESC`,
      [courierId]
    );

    return res.json({ parcels: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /parcel - Get all parcels (Admin only) or filtered list
 */
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, sender_id, courier_id } = req.query;

    let query = `
      SELECT p.parcel_id, p.tracking_code, p.sender_id, p.recipient_id,
             p.pickup_city_id, p.delivery_city_id, p.assigned_hub_id,
             p.assigned_courier_id, p.weight_kg, p.length_cm, p.width_cm,
             p.height_cm, p.status, p.created_at, p.expected_delivery_date
      FROM parcel p
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (sender_id) {
      paramCount++;
      query += ` AND p.sender_id = $${paramCount}`;
      params.push(sender_id);
    }

    if (courier_id) {
      paramCount++;
      query += ` AND p.assigned_courier_id = $${paramCount}`;
      params.push(courier_id);
    }

    // If not admin, only show own parcels
    if (req.user.role !== "admin") {
      paramCount++;
      query += ` AND (p.sender_id = $${paramCount} OR p.recipient_id = $${paramCount})`;
      params.push(req.user.user_id);
    }

    query += ` ORDER BY p.created_at DESC`;

    const q = await pool.query(query, params);
    return res.json({ parcels: q.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /parcel/:id - Get parcel by ID
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    const q = await pool.query(
      `SELECT p.*, 
              (SELECT json_agg(json_build_object(
                'item_id', pi.item_id,
                'description', pi.description,
                'quantity', pi.quantity,
                'declared_value', pi.declared_value
              )) FROM parcel_item pi WHERE pi.parcel_id = p.parcel_id) as items
       FROM parcel p
       WHERE p.parcel_id = $1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = q.rows[0];

    // Check access: admin can see all, others only their own
    if (userRole !== "admin" && parcel.sender_id !== userId && parcel.recipient_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ parcel });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /parcel/:id - Update parcel
 */
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateParcelSchema.parse(req.body);
    const userId = req.user.user_id;
    const userRole = req.user.role;

    // Check if parcel exists and user has permission
    const parcelCheck = await pool.query(
      `SELECT sender_id, status FROM parcel WHERE parcel_id = $1`,
      [id]
    );

    if (!parcelCheck.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelCheck.rows[0];

    // Permission check: admin can update any, customer can only update their own if status is 'created'
    if (userRole !== "admin") {
      if (parcel.sender_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (parcel.status !== PARCEL_STATUSES.CREATED && !data.status) {
        return res.status(403).json({ error: "Can only update parcels in 'created' status" });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (data.recipient_name !== undefined) {
      // Store in a separate field or update recipient
      // For now, we'll skip this as schema doesn't have recipient_name directly
    }
    if (data.status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(data.status);
    }
    if (data.assigned_courier_id !== undefined) {
      paramCount++;
      updates.push(`assigned_courier_id = $${paramCount}`);
      values.push(data.assigned_courier_id);
    }
    if (data.assigned_hub_id !== undefined) {
      paramCount++;
      updates.push(`assigned_hub_id = $${paramCount}`);
      values.push(data.assigned_hub_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE parcel
      SET ${updates.join(", ")}
      WHERE parcel_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);
    return res.json({ parcel: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /parcel/:id - Cancel/delete parcel
 */
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    const parcelCheck = await pool.query(
      `SELECT sender_id, status FROM parcel WHERE parcel_id = $1`,
      [id]
    );

    if (!parcelCheck.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelCheck.rows[0];

    // Permission check
    if (userRole !== "admin" && parcel.sender_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Only allow cancellation if not delivered
    if (parcel.status === PARCEL_STATUSES.DELIVERED) {
      return res.status(400).json({ error: "Cannot cancel delivered parcel" });
    }

    // Update status to cancelled instead of deleting
    const result = await pool.query(
      `UPDATE parcel SET status = $1 WHERE parcel_id = $2 RETURNING *`,
      [PARCEL_STATUSES.CANCELLED, id]
    );

    // Create tracking event
    await pool.query(
      `INSERT INTO tracking_event (parcel_id, seq, event_type, actor_id, note)
       VALUES ($1, (SELECT COALESCE(MAX(seq), -1) + 1 FROM tracking_event WHERE parcel_id = $1), $2, $3, $4)`,
      [id, 'cancelled', userId, 'Parcel cancelled']
    );

    return res.json({ parcel: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /parcel/:id/status - Update parcel status
 */
router.put("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (!status || !Object.values(PARCEL_STATUSES).includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const parcelCheck = await pool.query(
      `SELECT * FROM parcel WHERE parcel_id = $1`,
      [id]
    );

    if (!parcelCheck.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    const parcel = parcelCheck.rows[0];

    // Permission check: courier can update assigned parcels, admin can update any
    if (userRole !== "admin") {
      if (userRole === "courier" && parcel.assigned_courier_id !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      if (userRole === "customer") {
        return res.status(403).json({ error: "Customers cannot update parcel status" });
      }
    }

    // Update status
    const result = await pool.query(
      `UPDATE parcel SET status = $1 WHERE parcel_id = $2 RETURNING *`,
      [status, id]
    );

    // Create tracking event
    const eventType = status.replace(/_/g, '_');
    await pool.query(
      `INSERT INTO tracking_event (parcel_id, seq, event_type, actor_id, note)
       VALUES ($1, (SELECT COALESCE(MAX(seq), -1) + 1 FROM tracking_event WHERE parcel_id = $1), $2, $3, $4)`,
      [id, eventType, userId, note || `Status updated to ${status}`]
    );

    return res.json({ parcel: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /parcel/:id/assign - Assign courier to parcel (Admin only)
 */
router.post("/:id/assign", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { courier_id } = req.body;

    if (!courier_id) {
      return res.status(400).json({ error: "courier_id is required" });
    }

    // Verify courier exists and is a courier
    const courierCheck = await pool.query(
      `SELECT u.user_id FROM app_user u
       JOIN courier c ON c.user_id = u.user_id
       WHERE u.user_id = $1`,
      [courier_id]
    );

    if (!courierCheck.rowCount) {
      return res.status(404).json({ error: "Courier not found" });
    }

    // Update parcel
    const result = await pool.query(
      `UPDATE parcel SET assigned_courier_id = $1 WHERE parcel_id = $2 RETURNING *`,
      [courier_id, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Parcel not found" });
    }

    // Create tracking event
    await pool.query(
      `INSERT INTO tracking_event (parcel_id, seq, event_type, actor_id, note)
       VALUES ($1, (SELECT COALESCE(MAX(seq), -1) + 1 FROM tracking_event WHERE parcel_id = $1), $2, $3, $4)`,
      [id, 'picked_up', req.user.user_id, `Courier assigned: ${courier_id}`]
    );

    return res.json({ parcel: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
