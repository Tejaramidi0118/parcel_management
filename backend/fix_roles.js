import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function fixRoles() {
    try {
        console.log('Fixing Admin Roles...');
        const resAdmin = await pool.query(`
            UPDATE app_user 
            SET role = 'admin' 
            WHERE email LIKE '%@swiftadmin.com' AND role != 'admin'
        `);
        console.log(`Updated ${resAdmin.rowCount} admin accounts.`);

        console.log('Fixing Courier Roles...');
        const resCourier = await pool.query(`
            UPDATE app_user 
            SET role = 'courier' 
            WHERE email LIKE '%@swiftcourier.com' AND role != 'courier'
        `);
        console.log(`Updated ${resCourier.rowCount} courier accounts.`);

    } catch (err) {
        console.error('Error fixing roles:', err);
    } finally {
        await pool.end();
    }
}

fixRoles();
