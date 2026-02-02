
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updateSchema() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Adding store_id to orders table...');
        // Check if column exists
        const resStore = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='orders' AND column_name='store_id'
        `);
        if (resStore.rows.length === 0) {
            await client.query(`
                ALTER TABLE orders ADD COLUMN store_id INTEGER REFERENCES store(store_id) ON DELETE SET NULL;
                CREATE INDEX idx_orders_store ON orders(store_id);
            `);
        }

        console.log('2. Making hub_id nullable in orders table...');
        await client.query(`
            ALTER TABLE orders ALTER COLUMN hub_id DROP NOT NULL;
        `);

        console.log('3. Adding store_id to order_items table (optional but good for tracking)...');
        // Actually order_items links to order_id, which links to store. So not strictly needed.
        // But we might want 'price_at_order' which is already there.

        await client.query('COMMIT');
        console.log('Schema update successful!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error updating schema:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

updateSchema();
