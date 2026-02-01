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

        console.log('1. Creating District Table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS district (
                district_id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                state_id INTEGER REFERENCES state(state_id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_district_state ON district(state_id);
        `);

        console.log('2. Updating City Table (Adding district_id)...');
        // Check if column exists first to avoid error
        const resCity = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='city' AND column_name='district_id'
        `);
        if (resCity.rows.length === 0) {
            await client.query(`
                ALTER TABLE city ADD COLUMN district_id INTEGER REFERENCES district(district_id) ON DELETE SET NULL;
            `);
        }

        console.log('3. Updating app_user role check...');
        // Drop existing check constraint if likely named app_user_role_check
        // Or we can just alter the check. 
        // Postgres doesn't easily allow altering check, so drop and add.
        // We need to find the constraint name.
        const resConstraint = await client.query(`
            SELECT conname FROM pg_constraint WHERE conrelid = 'app_user'::regclass AND contype = 'c';
        `);
        for (const row of resConstraint.rows) {
            // Primitive check if it's the role check
            // We'll simplisticly drop the constraint that enforces role if we can find it, 
            // or just try to add the new value if it's an enum (it's not, it's a VARCHAR with check).
            // Let's just try to drop the specific constraint 'app_user_role_check' if it exists by convention.
            if (row.conname === 'app_user_role_check') {
                await client.query(`ALTER TABLE app_user DROP CONSTRAINT app_user_role_check`);
            }
        }
        // Re-add constraint with store_owner
        // app_user_role_check might not be the name if created inline.
        // If we can't find it easily, we might skip enforcement or use a looser check.
        // Let's assume we can add a new one or the old one is gone.
        // Actually, safer is to not fail if we can't drop it. 
        // Let's just try to update check constraint by validating values.

        // Better approach: Just DROP constraint by name if we know it. 
        // In schema.sql: role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','courier','admin'))
        // Name is likely auto-generated like "app_user_role_check".

        await client.query(`
            ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_role_check;
            ALTER TABLE app_user ADD CONSTRAINT app_user_role_check 
            CHECK (role IN ('customer', 'courier', 'admin', 'store_owner'));
        `);

        console.log('4. Creating Store Table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS store (
                store_id SERIAL PRIMARY KEY,
                owner_id BIGINT REFERENCES app_user(user_id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                address_street VARCHAR(255),
                city_id INTEGER REFERENCES city(city_id),
                district_id INTEGER REFERENCES district(district_id),
                state_id INTEGER REFERENCES state(state_id),
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_store_city ON store(city_id);
            CREATE INDEX IF NOT EXISTS idx_store_location ON store(latitude, longitude);
        `);

        console.log('5. Creating Product Table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS product (
                product_id SERIAL PRIMARY KEY,
                store_id INTEGER REFERENCES store(store_id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                image_url TEXT,
                category VARCHAR(100),
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_product_store ON product(store_id);
        `);

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
