import pool from "../config/db.config.js";

// Get all states
export const getStates = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM state ORDER BY name ASC');
        res.json({
            success: true,
            states: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get single state
export const getStateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM state WHERE state_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "State not found" });
        }

        res.json({
            success: true,
            state: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};
