// Statistics routes
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

/**
 * GET /stats/dashboard - Dashboard statistics (Admin only)
 */
router.get("/dashboard", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // Get total counts
    const [
      totalParcels,
      totalUsers,
      totalCouriers,
      totalHubs,
      totalVehicles,
      statusCounts,
      recentParcels
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM parcel`),
      pool.query(`SELECT COUNT(*) as count FROM app_user`),
      pool.query(`SELECT COUNT(*) as count FROM courier`),
      pool.query(`SELECT COUNT(*) as count FROM hub`),
      pool.query(`SELECT COUNT(*) as count FROM vehicle`),
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM parcel
        GROUP BY status
      `),
      pool.query(`
        SELECT parcel_id, tracking_code, status, created_at
        FROM parcel
        ORDER BY created_at DESC
        LIMIT 10
      `)
    ]);

    return res.json({
      totals: {
        parcels: parseInt(totalParcels.rows[0].count),
        users: parseInt(totalUsers.rows[0].count),
        couriers: parseInt(totalCouriers.rows[0].count),
        hubs: parseInt(totalHubs.rows[0].count),
        vehicles: parseInt(totalVehicles.rows[0].count)
      },
      statusCounts: statusCounts.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      recentParcels: recentParcels.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /stats/courier - Courier statistics
 */
router.get("/courier", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    if (req.user.role !== "courier" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const courierId = req.user.role === "admin" && req.query.courier_id 
      ? req.query.courier_id 
      : userId;

    // Get courier stats
    const [
      totalAssigned,
      delivered,
      inTransit,
      statusBreakdown
    ] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as count
        FROM parcel
        WHERE assigned_courier_id = $1
      `, [courierId]),
      pool.query(`
        SELECT COUNT(*) as count
        FROM parcel
        WHERE assigned_courier_id = $1 AND status = 'delivered'
      `, [courierId]),
      pool.query(`
        SELECT COUNT(*) as count
        FROM parcel
        WHERE assigned_courier_id = $1 
        AND status IN ('picked_up', 'in_transit', 'out_for_delivery')
      `, [courierId]),
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM parcel
        WHERE assigned_courier_id = $1
        GROUP BY status
      `, [courierId])
    ]);

    return res.json({
      totalAssigned: parseInt(totalAssigned.rows[0].count),
      delivered: parseInt(delivered.rows[0].count),
      inTransit: parseInt(inTransit.rows[0].count),
      statusBreakdown: statusBreakdown.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {})
    });
  } catch (err) {
    next(err);
  }
});

export default router;

