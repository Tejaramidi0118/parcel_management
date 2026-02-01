// Test script for Quick-Commerce APIs
// Run with: node test_apis.js

const BASE_URL = 'http://localhost:3000';

async function testAPI(name, url, options = {}) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`   ✅ SUCCESS (${response.status})`);
            console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500));
            return data;
        } else {
            console.log(`   ❌ FAILED (${response.status})`);
            console.log(`   Error:`, JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests...\n');
    console.log('='.repeat(60));

    // Test 1: Health check (get store by ID)
    await testAPI(
        'Get Store by ID',
        `${BASE_URL}/api/stores/1`
    );

    // Test 2: Nearest stores
    await testAPI(
        'Find Nearest Stores (Bangalore)',
        `${BASE_URL}/api/stores/nearby?lat=12.9716&lng=77.5946&radius=10`
    );

    // Test 3: Store products
    await testAPI(
        'Get Products at Store 1',
        `${BASE_URL}/api/stores/1/products`
    );

    // Test 4: Nearest stores (Mumbai)
    await testAPI(
        'Find Nearest Stores (Mumbai)',
        `${BASE_URL}/api/stores/nearby?lat=19.0760&lng=72.8777&radius=10`
    );

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Tests completed!');
    console.log('\nIf all tests passed, your quick-commerce backend is working!');
}

// Run tests
runTests().catch(console.error);
