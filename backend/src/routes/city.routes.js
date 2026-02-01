import { Router } from 'express';
import pool from '../config/db.config.js';

const router = Router();

/**
 * GET /city
 * Get all cities with state info
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.city_id as id,
        c.name,
        c.state_id,
        c.latitude,
        c.longitude,
        s.name as state_name,
        s.code as state_code
      FROM city c
      LEFT JOIN state s ON c.state_id = s.state_id
      ORDER BY c.name
    `);

    res.json({
      success: true,
      cities: result.rows
    });
  } catch (error) {
    console.error('Get cities error:', error);
    next(error);
  }
});

/**
 * GET /city/:id
 * Get city by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        c.city_id as id,
        c.name,
        c.state_id,
        c.latitude,
        c.longitude,
        s.name as state_name,
        s.code as state_code
      FROM city c
      LEFT JOIN state s ON c.state_id = s.state_id
      WHERE c.city_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get city error:', error);
    next(error);
  }
});

export default router;
