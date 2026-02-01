
import pg from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const SQL_URL = 'https://raw.githubusercontent.com/Aryaa1024/India-States-Districts-SQL-Database-2024-Updated-/main/india.sql';

async function run() {
    try {
        console.log("Fetching SQL data...");
        const response = await axios.get(SQL_URL);
        const sqlContent = response.data;

        console.log("Parsing data...");

        // 1. Get States
        console.log("Parsing States...");
        // Format in external SQL: (1, 'Andhra Pradesh', 'AP', 26, 1, ...
        // Regex: (ID, 'Name', 'Code', TotalDistricts, Status, ...
        // We use a simpler regex to catch lines and log if needed
        const stateRegex = /\((\d+),\s*'([^']+)',\s*'([A-Z]+)',\s*\d+,\s*\d+,/g;
        const states = [];
        let match;
        // Reset lastIndex just in case
        stateRegex.lastIndex = 0;

        while ((match = stateRegex.exec(sqlContent)) !== null) {
            states.push({
                name: match[2],
                code: match[3]
            });
            // console.log(`Found State: ${match[2]}`);
        }
        console.log(`Found ${states.length} states.`);

        if (states.length === 0) {
            console.log("DEBUG: Snippet of SQL Content for States:");
            console.log(sqlContent.substring(sqlContent.indexOf('INSERT INTO `states`'), sqlContent.indexOf('INSERT INTO `states`') + 500));
        }

        // 2. Get Districts
        console.log("Parsing Districts...");
        // Table structure in SQL: district_id, district_name, district_code, state_id, status, ...
        // Format: (1, 'Anakapalli', 'AP-01', 1, 1, ...)

        // Let's parse the external STATE INSERTs again to build a map of External_ID -> State_Name
        // Regex needs to capture the ID (first digit) and Name (second group)
        // Map External ID -> Name
        const stateIdMapRegex = /\((\d+),\s*'([^']+)',\s*'([A-Z]+)',/g;
        const externalStateMap = new Map(); // ID -> Name

        let stateMatch;
        while ((stateMatch = stateIdMapRegex.exec(sqlContent)) !== null) {
            externalStateMap.set(parseInt(stateMatch[1]), stateMatch[2]);
        }
        console.log(`Mapped ${externalStateMap.size} external state IDs.`);

        // Now parse districts
        // Format: (1, 'Anakapalli', 'AP-01', 1, 1, ...)
        // Regex: (ID, 'Name', 'Code', StateID, Status, ...
        // We capture Name (group 1) and StateID (group 2)
        const districtRegex = /\((\d+),\s*'([^']+)',\s*'[^']+',\s*(\d+),\s*\d+,/g;
        const districts = [];
        let distMatch;
        let distCount = 0;

        while ((distMatch = districtRegex.exec(sqlContent)) !== null) {
            districts.push({
                name: distMatch[2],
                external_state_id: parseInt(distMatch[3])
            });
            distCount++;
        }
        console.log(`Found ${districts.length} districts.`);

        if (districts.length === 0) {
            console.log("DEBUG: Snippet of SQL Content for Districts:");
            const distIndex = sqlContent.indexOf('INSERT INTO `districts`');
            if (distIndex > -1) {
                console.log(sqlContent.substring(distIndex, distIndex + 1000));
            } else {
                console.log("Could not find INSERT INTO `districts`");
            }
        }

        // --- Database Operations ---

        // 1. Ensure District Table Exists with Correct Constraints
        // DROP first to ensure we have the Unique Constraint for ON CONFLICT
        await pool.query(`DROP TABLE IF EXISTS district CASCADE;`);

        await pool.query(`
            CREATE TABLE district (
                district_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                state_id INTEGER REFERENCES state(state_id) ON DELETE CASCADE,
                CONSTRAINT district_name_state_unique UNIQUE(name, state_id)
            );
        `);
        console.log("Re-created district table.");

        // 2. Insert States (Upsert)
        console.log("Upserting states...");
        for (const state of states) {
            await pool.query(`
                INSERT INTO state (name, code) 
                VALUES ($1, $2)
                ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;
            `, [state.name, state.code]);
        }

        // 3. Insert Districts
        console.log("Inserting districts...");
        // First, get all our internal states to map name -> internal_id
        const stateRes = await pool.query('SELECT state_id, name FROM state');
        const internalStateMap = new Map(); // Name -> Internal_ID
        stateRes.rows.forEach(row => internalStateMap.set(row.name, row.state_id));

        let insertedCount = 0;
        for (const dist of districts) {
            const stateName = externalStateMap.get(dist.external_state_id);
            if (!stateName) {
                console.warn(`Unknown external state ID ${dist.external_state_id} for district ${dist.name}`);
                continue;
            }

            const internalStateId = internalStateMap.get(stateName);
            if (!internalStateId) {
                console.warn(`State '${stateName}' not found in local DB for district ${dist.name}`);
                continue;
            }

            try {
                await pool.query(`
                    INSERT INTO district (name, state_id)
                    VALUES ($1, $2)
                    ON CONFLICT (name, state_id) DO NOTHING;
                `, [dist.name, internalStateId]);
                insertedCount++;
            } catch (e) {
                console.error(`Failed to insert ${dist.name}:`, e.message);
            }
        }

        console.log(`Successfully populated ${insertedCount} districts.`);
        process.exit(0);

    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

run();
