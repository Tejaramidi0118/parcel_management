import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_address (
                address_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES app_user(user_id) ON DELETE CASCADE,
                type VARCHAR(50) DEFAULT 'Home',
                full_name VARCHAR(100), -- For specific recipient at this address
                phone VARCHAR(20),      -- Contact for this address
                street TEXT NOT NULL,
                city_id INTEGER REFERENCES city(city_id),
                zip_code VARCHAR(20),
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            );

            -- Ensure one default per user (partial index or trigger, but simple logic for now)
            CREATE INDEX IF NOT EXISTS idx_user_address_user ON user_address(user_id);
        `);
        console.log("user_address table created");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
