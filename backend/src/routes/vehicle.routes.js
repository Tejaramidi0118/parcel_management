import { Router } from 'express';
import pool from '../config/db.config.js';

const router = Router();

/**
 * GET /vehicle
 * Get all vehicles
 */
router.get('/', async (req, res, next) => {
  try {
    // TODO: Fix vehicle table schema
    // Temporarily return empty array to unblock frontend
    // Temporarily return empty array to unblock frontend
    res.json({
      success: true,
      vehicles: []
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    next(error);
  }
});

/**
 * GET /vehicle/:id
 * Get vehicle by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        vehicle_id as id,
        vehicle_type as type,
        vehicle_number as number_plate,
        vehicle_capacity as capacity,
        COALESCE(is_active, true) as is_active
      FROM vehicle
      WHERE vehicle_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get vehicle error:', error);
    next(error);
  }
});

export default router;
