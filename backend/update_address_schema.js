import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        console.log("Updating user_address table...");

        // Add state_id and district_id columns
        // We assume city_id might become optional or secondary
        await pool.query(`
            ALTER TABLE user_address 
            ADD COLUMN IF NOT EXISTS state_id INTEGER REFERENCES state(state_id),
            ADD COLUMN IF NOT EXISTS district_id INTEGER REFERENCES district(district_id);
        `);

        // Also ensure city_id is nullable if we want to rely on district in the future,
        // but for now keeping it as is.
        // Let's also drop CONSTRAINT if exists to make city_id optional?
        // For now, let's just ADD the new columns.

        console.log("Columns state_id and district_id added to user_address.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

run();
