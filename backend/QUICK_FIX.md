# Quick Fix Guide

## If Cities Are Not Loading

### Step 1: Check Backend is Running
```bash
cd backend
npm run dev
```
You should see: `🚀 API running on http://localhost:3000`

### Step 2: Check Database Connection
Make sure your `.env` file in `backend/` has:
```
DATABASE_URL=postgresql://user:password@localhost:5432/courier_db
JWT_SECRET=your_secret_key
PORT=3000
```

### Step 3: Populate Cities
Run the SQL script to add Indian states and cities:
```bash
psql -U your_user -d courier_db -f backend/indian_states_cities.sql
```

### Step 4: Test the API
Open browser and go to: `http://localhost:3000/city`
You should see JSON with cities array.

### Step 5: Check Browser Console
Open browser DevTools (F12) and check Console tab for:
- `[DataContext] Attempting to load cities from backend...`
- `[DataContext] Cities API response:`
- Any error messages

### Step 6: If Still Not Working
The frontend will automatically use mock cities after 2 seconds if backend fails.
You can still use the app with mock cities, but they won't persist.

## Common Issues

1. **Backend not running**: Start it with `cd backend && npm run dev`
2. **Database not connected**: Check DATABASE_URL in .env
3. **No cities in database**: Run the SQL script
4. **CORS error**: Backend should allow all origins in dev mode
5. **Port mismatch**: Frontend expects backend on port 3000

