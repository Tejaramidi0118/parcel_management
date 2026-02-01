import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
    try {
        console.log('\n=== CHECKING DATABASE SCHEMA ===\n');

        const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('app_user', 'user_auth')
      ORDER BY table_name, ordinal_position
    `);

        let currentTable = '';
        result.rows.forEach(row => {
            if (row.table_name !== currentTable) {
                currentTable = row.table_name;
                console.log(`\n${row.table_name.toUpperCase()}:`);
            }
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

        console.log('\n');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
