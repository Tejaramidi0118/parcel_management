import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Setting up Orders and Stock Triggers...");
        await client.query('BEGIN');

        // 1. Create Orders Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                user_id BIGINT REFERENCES app_user(user_id),
                store_id INTEGER REFERENCES store(store_id),
                total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                delivery_address_id INTEGER REFERENCES user_address(address_id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Create Order Items Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES product(product_id),
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                price_at_time DECIMAL(10,2) NOT NULL
            );
        `);

        // 3. Create Trigger Function to Decrease Stock
        await client.query(`
            CREATE OR REPLACE FUNCTION decrease_stock() 
            RETURNS TRIGGER AS $$
            BEGIN
                -- Check if enough stock exists
                IF (SELECT stock_quantity FROM product WHERE product_id = NEW.product_id) < NEW.quantity THEN
                    RAISE EXCEPTION 'Insufficient stock for product ID %', NEW.product_id;
                END IF;

                -- Decrease stock
                UPDATE product 
                SET stock_quantity = stock_quantity - NEW.quantity
                WHERE product_id = NEW.product_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // 4. Attach Trigger to Order Items
        // Drop first to allow re-running script without error
        await client.query(`DROP TRIGGER IF EXISTS trg_decrease_stock ON order_items`);
        await client.query(`
            CREATE TRIGGER trg_decrease_stock
            AFTER INSERT ON order_items
            FOR EACH ROW
            EXECUTE FUNCTION decrease_stock();
        `);

        await client.query('COMMIT');
        console.log("Tables and Triggers setup successfully!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
