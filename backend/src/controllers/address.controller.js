import pool from "../config/db.config.js";

export const getMyAddresses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Join with State and District tables as well
        const result = await pool.query(`
            SELECT a.*, 
                   c.name as city_name,
                   d.name as district_name,
                   s.name as state_name
            FROM user_address a
            LEFT JOIN city c ON a.city_id = c.city_id
            LEFT JOIN district d ON a.district_id = d.district_id
            LEFT JOIN state s ON a.state_id = s.state_id
            WHERE a.user_id = $1
            ORDER BY a.is_default DESC, a.created_at DESC
        `, [userId]);

        res.json({ success: true, addresses: result.rows });
    } catch (error) {
        next(error);
    }
};

export const addAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { type, full_name, phone, street, city_id, district_id, state_id, zip_code, is_default } = req.body;

        // If setting as default, unset others
        if (is_default) {
            await pool.query(`UPDATE user_address SET is_default = false WHERE user_id = $1`, [userId]);
        }

        const result = await pool.query(`
            INSERT INTO user_address (user_id, type, full_name, phone, street, city_id, district_id, state_id, zip_code, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            userId,
            type || 'Home',
            full_name,
            phone,
            street,
            city_id || null,
            district_id || null,
            state_id || null,
            zip_code,
            is_default || false
        ]);

        res.status(201).json({ success: true, address: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM user_address WHERE address_id = $1 AND user_id = $2 RETURNING address_id
        `, [id, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.json({ success: true, message: "Address deleted" });
    } catch (error) {
        next(error);
    }
};
