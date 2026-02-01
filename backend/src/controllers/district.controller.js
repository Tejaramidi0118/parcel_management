import pool from "../config/db.config.js";

// Get all districts (optionally filtered by state_id)
export const getDistricts = async (req, res, next) => {
    try {
        const { state_id } = req.query;
        let query = `SELECT * FROM district`;
        const params = [];

        if (state_id) {
            query += ` WHERE state_id = $1`;
            params.push(state_id);
        }

        query += ` ORDER BY name ASC`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            districts: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Admin can create district
export const createDistrict = async (req, res, next) => {
    try {
        const { name, state_id } = req.body;
        const result = await pool.query(
            `INSERT INTO district (name, state_id) VALUES ($1, $2) RETURNING *`,
            [name, state_id]
        );
        res.status(201).json({
            success: true,
            district: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};
