import pool from './src/config/db.config.js';

async function seedData() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting data seeding...\n');

        // Step 1: Enable PostGIS (already done, but safe to re-run)
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
        console.log('✅ PostGIS extension verified');

        // Step 2: Ensure we have at least one state (or cities will fail)
        await client.query(`
      INSERT INTO state (name, code)
      VALUES ('Karnataka', 'KA'), ('Maharashtra', 'MH'), ('Delhi', 'DL')
      ON CONFLICT (name) DO NOTHING
    `);
        console.log('✅ States ensured');

        // Step 3: Insert sample cities
        const cityInsertions = [
            ['Bangalore', 1, 12.9716, 77.5946],
            ['Mumbai', 2, 19.0760, 72.8777],
            ['Delhi', 3, 28.7041, 77.1025],
        ];

        for (const [name, state_id, lat, lng] of cityInsertions) {
            await client.query(`
        INSERT INTO city (name, state_id, latitude, longitude)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [name, state_id, lat, lng]);
        }
        console.log('✅ Sample cities added');

        // Step 4: Insert hubs/stores with GPS locations
        const hubs = [
            {
                name: 'QuickMart Indiranagar',
                city: 'Bangalore',
                lat: 12.9784,
                lng: 77.6408,
                radius: 5.0
            },
            {
                name: 'QuickMart Koramangala',
                city: 'Bangalore',
                lat: 12.9352,
                lng: 77.6245,
                radius: 5.0
            },
            {
                name: 'QuickMart Whitefield',
                city: 'Bangalore',
                lat: 12.9698,
                lng: 77.7499,
                radius: 5.0
            },
            {
                name: 'QuickMart Andheri',
                city: 'Mumbai',
                lat: 19.1136,
                lng: 72.8697,
                radius: 5.0
            },
            {
                name: 'QuickMart Connaught Place',
                city: 'Delhi',
                lat: 28.6315,
                lng: 77.2167,
                radius: 5.0
            },
        ];

        for (const hub of hubs) {
            const cityResult = await client.query(
                'SELECT city_id FROM city WHERE name = $1 LIMIT 1',
                [hub.city]
            );

            if (cityResult.rows.length > 0) {
                await client.query(`
          INSERT INTO hub (name, city_id, location, capacity, contact, radius_km, is_active)
          VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), 100, '+91-1234567890', $5, true)
          ON CONFLICT DO NOTHING
        `, [hub.name, cityResult.rows[0].city_id, hub.lng, hub.lat, hub.radius]);

                console.log(`✅ Added store: ${hub.name}`);
            }
        }

        // Step 4: Insert sample products
        const products = [
            { name: 'Fresh Milk (1L)', description: 'Full cream fresh milk', category: 'Dairy', price: 60.00, unit: '1 liter' },
            { name: 'Bread - White', description: 'Freshly baked white bread', category: 'Bakery', price: 40.00, unit: 'pack' },
            { name: 'Eggs (12 pcs)', description: 'Farm fresh eggs', category: 'Dairy', price: 80.00, unit: 'pack' },
            { name: 'Orange Juice (1L)', description: 'Fresh squeezed orange juice', category: 'Beverages', price: 120.00, unit: '1 liter' },
            { name: 'Tomato (1kg)', description: 'Fresh red tomatoes', category: 'Vegetables', price: 50.00, unit: 'kg' },
            { name: 'Onion (1kg)', description: 'Fresh onions', category: 'Vegetables', price: 40.00, unit: 'kg' },
            { name: 'Rice (5kg)', description: 'Premium basmati rice', category: 'Grains', price: 350.00, unit: '5 kg' },
            { name: 'Sugar (1kg)', description: 'White sugar', category: 'Groceries', price: 45.00, unit: 'kg' },
            { name: 'Cooking Oil (1L)', description: 'Refined sunflower oil', category: 'Groceries', price: 140.00, unit: '1 liter' },
            { name: 'Biscuits', description: 'Assorted sweet biscuits', category: 'Snacks', price: 30.00, unit: 'pack' },
        ];

        for (const product of products) {
            await client.query(`
        INSERT INTO products (name, description, category, base_price, unit, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT DO NOTHING
      `, [product.name, product.description, product.category, product.price, product.unit]);
        }
        console.log('✅ Sample products added\n');

        // Step 5: Add inventory for all hubs
        const hubsResult = await client.query('SELECT hub_id FROM hub WHERE is_active = true');
        const productsResult = await client.query('SELECT product_id FROM products WHERE is_active = true');

        for (const hub of hubsResult.rows) {
            for (const product of productsResult.rows) {
                const stockQuantity = Math.floor(Math.random() * 50) + 20; // Random stock 20-70

                await client.query(`
          INSERT INTO inventory (hub_id, product_id, stock_quantity, reserved_quantity)
          VALUES ($1, $2, $3, 0)
          ON CONFLICT (hub_id, product_id) DO UPDATE
          SET stock_quantity = $3
        `, [hub.hub_id, product.product_id, stockQuantity]);
            }
        }
        console.log('✅ Inventory stocked for all stores\n');

        // Step 6: Show summary
        const hubCount = await client.query('SELECT COUNT(*) FROM hub WHERE is_active = true');
        const productCount = await client.query('SELECT COUNT(*) FROM products WHERE is_active = true');
        const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory');

        console.log('📊 Seeding Summary:');
        console.log(`   - Stores: ${hubCount.rows[0].count}`);
        console.log(`   - Products: ${productCount.rows[0].count}`);
        console.log(`   - Inventory Entries: ${inventoryCount.rows[0].count}`);
        console.log('\n🎉 Database ready for testing!\n');

        // Step 7: Show sample query
        console.log('📍 Sample Query - Find stores near Bangalore center:');
        const nearbyStores = await client.query(`
      SELECT 
        hub_id,
        name,
        ROUND(ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography
        )) as distance_meters
      FROM hub
      WHERE is_active = true
        AND location IS NOT NULL
      ORDER BY distance_meters
      LIMIT 3
    `);

        nearbyStores.rows.forEach(store => {
            console.log(`   - ${store.name}: ${store.distance_meters}m away`);
        });

    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedData()
    .then(() => {
        console.log('\n✅ Seeding complete! Now start the server with: npm run dev');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
