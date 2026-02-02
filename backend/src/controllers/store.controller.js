import pool from "../config/db.config.js";

// Create Store
export const createStore = async (req, res, next) => {
    try {
        const { name, description, image_url, address_street, city_id, district_id, state_id, latitude, longitude } = req.body;
        const owner_id = req.user.id;

        // Basic validation or defaults
        const lat = latitude || 0.0;
        const lng = longitude || 0.0;
        const st_id = state_id || 1; // Default or from body

        const result = await pool.query(
            `INSERT INTO store (
                owner_id, name, description, image_url, address_street, city_id, district_id, state_id, latitude, longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [owner_id, name, description, image_url, address_street, city_id, district_id, st_id, lat, lng]
        );

        res.status(201).json({
            success: true,
            store: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Update Store
export const updateStore = async (req, res, next) => {
    try {
        const { id } = req.params;
        const owner_id = req.user.id;
        const { name, description, image_url, address_street, city_id, district_id, state_id, is_active } = req.body;

        const result = await pool.query(
            `UPDATE store SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                image_url = COALESCE($3, image_url),
                address_street = COALESCE($4, address_street),
                city_id = COALESCE($5, city_id),
                district_id = COALESCE($6, district_id),
                state_id = COALESCE($7, state_id),
                is_active = COALESCE($8, is_active)
            WHERE store_id = $9 AND owner_id = $10
            RETURNING *`,
            [name, description, image_url, address_street, city_id, district_id, state_id, is_active, id, owner_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Store not found or unauthorized" });
        }

        res.json({
            success: true,
            store: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Get My Stores (Store Owner)
export const getMyStores = async (req, res, next) => {
    try {
        const owner_id = req.user.id;
        const result = await pool.query(
            `SELECT s.*, c.name as city_name, d.name as district_name 
             FROM store s
             LEFT JOIN city c ON s.city_id = c.city_id
             LEFT JOIN district d ON s.district_id = d.district_id
             WHERE s.owner_id = $1`,
            [owner_id]
        );

        res.json({
            success: true,
            stores: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get Nearby Stores (Customer)
export const getNearbyStores = async (req, res, next) => {
    try {
        const { city_id, district_id } = req.query;
        // Simple filtering by city/district for now (strict hierarchy)
        let query = `
            SELECT s.*, c.name as city_name 
            FROM store s
            LEFT JOIN city c ON s.city_id = c.city_id
            WHERE s.is_active = true
        `;
        const params = [];

        if (city_id) {
            query += ` AND s.city_id = $1`;
            params.push(city_id);
        } else if (district_id) {
            query += ` AND s.district_id = $1`; // Fallback to district if city not selected
            params.push(district_id);
        }

        const result = await pool.query(query, params);

        res.json({
            success: true,
            stores: result.rows
        });
    } catch (error) {
        next(error);
    }
};

// Get Store by ID (Public)
export const getStoreById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT s.*, c.name as city_name, d.name as district_name 
             FROM store s
             LEFT JOIN city c ON s.city_id = c.city_id
             LEFT JOIN district d ON s.district_id = d.district_id
             WHERE s.store_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Store not found" });
        }

        res.json({
            success: true,
            store: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};
