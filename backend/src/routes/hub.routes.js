import { Router } from 'express';
import pool from '../config/db.config.js';

const router = Router();

/**
 * GET /hub
 * Get all hubs/stores
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        h.hub_id as id,
        h.name,
        h.city_id,
        h.contact,
        h.capacity,
        h.radius_km,
        h.is_active,
        ST_X(h.location) as longitude,
        ST_Y(h.location) as latitude,
        c.name as city_name
      FROM hub h
      LEFT JOIN city c ON h.city_id = c.city_id
      ORDER BY h.name
    `);

    res.json({
      success: true,
      hubs: result.rows
    });
  } catch (error) {
    console.error('Get hubs error:', error);
    next(error);
  }
});

/**
 * GET /hub/:id
 * Get hub by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        h.hub_id as id,
        h.name,
        h.city_id,
        h.contact,
        h.capacity,
        h.radius_km,
        h.is_active,
        ST_X(h.location) as longitude,
        ST_Y(h.location) as latitude,
        c.name as city_name
      FROM hub h
      LEFT JOIN city c ON h.city_id = c.city_id
      WHERE h.hub_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hub not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get hub error:', error);
    next(error);
  }
});

export default router;
