import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting quick-commerce migration...\n');

        // Read migration file
        const migrationPath = path.join(__dirname, 'migration_quick_commerce.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        console.log('📋 Executing migration SQL...');
        await client.query(migrationSQL);

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNew tables created:');
        console.log('  - products');
        console.log('  - inventory');
        console.log('  - orders');
        console.log('  - order_items');
        console.log('  - order_status_log');
        console.log('\nSpatial columns added to:');
        console.log('  - hub (location)');
        console.log('  - courier (location, is_available)');
        console.log('  - node (location)');
        console.log('\n✅ PostGIS extension enabled');
        console.log('✅ Spatial indexes created');
        console.log('✅ Triggers added');
        console.log('✅ Views created');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => {
        console.log('\n🎉 Database is ready for quick-commerce!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
