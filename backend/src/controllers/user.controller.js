import pool from "../config/db.config.js";

export const getProfile = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT 
                user_id as id,
                full_name as "fullName",
                email,
                phone,
                role,
                created_at as "createdAt"
             FROM app_user 
             WHERE user_id = $1`,
            [req.user.id] // req.user is set by authMiddleware
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user: result.rows[0] // Frontend expects { success: true, user: ... } for /auth/me or similar? 
            // Wait, DataContext apiMe calls /auth/me, not /user/me. 
            // This is for /user/me. Let's return consistent format.
            // But api.js apiMe calls /auth/me. 
            // api.js apiGetUser calls /user/:id
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        // Admin only - filtered by role if needed
        const { role } = req.query;
        let query = `
            SELECT 
                user_id as id,
                username,
                full_name,
                email,
                phone,
                role,
                address_street,
                created_at as created_at
            FROM app_user
        `;

        const params = [];
        if (role) {
            query += ` WHERE role = $1`;
            params.push(role);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            users: result.rows
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
                user_id as id,
                username,
                full_name,
                email,
                phone,
                role,
                address_street,
                created_at
             FROM app_user 
             WHERE user_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM app_user WHERE user_id = $1 RETURNING user_id`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};


export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, role } = req.body;
        const requestingUser = req.user;

        // Security Check 1: Ownership
        // Allow if Admin OR if updating self
        if (requestingUser.role !== 'admin' && String(requestingUser.id) !== String(id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied: You can only update your own profile"
            });
        }

        let query, params;

        // Security Check 2: Role Escalation
        // Only Admin can update 'role'
        if (requestingUser.role === 'admin') {
            query = `UPDATE app_user 
                     SET full_name = $1, email = $2, phone = $3, role = $4
                     WHERE user_id = $5 
                     RETURNING user_id, full_name, email, phone, role`;
            params = [full_name, email, phone, role, id];
        } else {
            // Self-update: Ignore 'role' input, update only details
            query = `UPDATE app_user 
                     SET full_name = $1, email = $2, phone = $3
                     WHERE user_id = $4 
                     RETURNING user_id, full_name, email, phone, role`;
            params = [full_name, email, phone, id];
        }

        const result = await pool.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: result.rows[0],
            message: "User updated successfully"
        });
    } catch (error) {
        next(error);
    }
};
