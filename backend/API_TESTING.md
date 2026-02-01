# API Testing Guide

## Prerequisites
- Backend running on http://localhost:3000
- Database seeded with sample data

---

## 1. Test Nearest Stores (PostGIS)

### Find stores near Bangalore center (12.9716, 77.5946)
```bash
curl "http://localhost:3000/api/stores/nearby?lat=12.9716&lng=77.5946&radius=10"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "store_id": 1,
      "store_name": "QuickMart Indiranagar",
      "latitude": 12.9784,
      "longitude": 77.6408,
      "distance_meters": 5234,
      "distance_km": "5.23",
      "delivery_possible": true
    },
    ...
  ],
  "message": "Found 3 store(s) nearby"
}
```

### Find stores near Mumbai (19.0760, 72.8777)
```bash
curl "http://localhost:3000/api/stores/nearby?lat=19.0760&lng=72.8777&radius=10"
```

---

## 2. Get Store Details

```bash
curl "http://localhost:3000/api/stores/1"
```

---

## 3. Get Products at a Store

```bash
curl "http://localhost:3000/api/stores/1/products"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "product_id": 1,
      "product_name": "Fresh Milk (1L)",
      "category": "Dairy",
      "base_price": "60.00",
      "stock_quantity": 45,
      "available_stock": 45,
      "in_stock": true
    },
    ...
  ]
}
```

---

## 4. Create an Order (Requires Authentication)

First, you need to login to get a JWT token.

### 4a. Login (if you have a user)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"customer@example.com\",\"password\":\"your_password\"}"
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Copy the `token` value.

### 4b. Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{
    \"customerId\": 1,
    \"hubId\": 1,
    \"items\": [
      {\"productId\": 1, \"quantity\": 2},
      {\"productId\": 2, \"quantity\": 1}
    ],
    \"delivery\": {
      \"street\": \"123 Main Street\",
      \"area\": \"Indiranagar\",
      \"city\": \"Bangalore\",
      \"pincode\": \"560038\",
      \"latitude\": 12.9784,
      \"longitude\": 77.6408,
      \"phone\": \"+919876543210\"
    },
    \"paymentMethod\": \"COD\"
  }"
```

---

## 5. Test Cache (Redis)

Run the same nearest stores query twice:

**First time:**
```bash
curl "http://localhost:3000/api/stores/nearby?lat=12.9716&lng=77.5946&radius=10"
# Check backend logs: should see "Executing PostGIS query..."
```

**Second time (within 60 seconds):**
```bash
curl "http://localhost:3000/api/stores/nearby?lat=12.9716&lng=77.5946&radius=10"
# Check backend logs: should see "✅ Cache hit for nearest stores"
```

---

## 6. Test Rate Limiting

Run this command 6 times quickly:
```bash
curl http://localhost:3000/api/stores/1
curl http://localhost:3000/api/stores/1
curl http://localhost:3000/api/stores/1
curl http://localhost:3000/api/stores/1
curl http://localhost:3000/api/stores/1
curl http://localhost:3000/api/stores/1
...
```

After ~100 requests in 15 minutes, you should get:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## 7. Test Inventory Locking (Concurrent Orders)

This requires a load testing tool. If you have `ab` (Apache Bench):

```bash
# Create 10 concurrent order requests
ab -n 10 -c 10 -T "application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -p order_payload.json \
  http://localhost:3000/api/orders
```

Check database - stock should be correctly deducted without overselling!

---

## 8. Check Order Status

```bash
curl http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. View Order History

```bash
curl http://localhost:3000/api/orders/customer/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues

### "Redis connection failed"
- Make sure Redis is running: `redis-cli ping` should return `PONG`
- Check `.env` file has correct Redis settings

### "PostGIS function not found"
- Run seed script again: `node seed_data.js`
- Verify PostGIS: `psql` → `SELECT PostGIS_Version();`

### "No stores found"
- Run seed script: `node seed_data.js`
- Check if hubs have locations: `SELECT hub_id, name, location FROM hub;`

### "Validation failed"
- Check request body format
- Ensure lat/lng are valid numbers (-90 to 90, -180 to 180)
