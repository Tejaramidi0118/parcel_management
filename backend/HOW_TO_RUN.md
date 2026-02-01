# 🚀 How to Run & Test the Quick-Commerce Backend

## Prerequisites Checklist
- ✅ PostgreSQL installed and running
- ✅ Database migration completed (you already did this!)
- ⏳ Redis (we'll install this now)
- ✅ Node.js installed

---

## Step 1: Install & Start Redis

### Option A: Windows Native Install (Recommended)

**1. Download Redis for Windows:**
```
Download from: https://github.com/MicrosoftArchive/redis/releases
Choose: Redis-x64-3.2.100.msi (or latest)
```

**2. Install Redis:**
- Run the installer
- Use default settings (Port: 6379)
- Check "Add to PATH"

**3. Verify Installation:**
```powershell
redis-cli --version
# Should show: redis-cli 3.2.100
```

**4. Start Redis:**
```powershell
# Open a NEW terminal window and run:
redis-server

# You should see:
# Server started, Redis version 3.2.100
# The server is now ready to accept connections on port 6379
```

**Leave this terminal open** - Redis must keep running!

---

### Option B: Manual Redis Download (If MSI fails)

**1. Download ZIP:**
```
https://github.com/tporadowski/redis/releases
Download: Redis-x64-5.0.14.zip
```

**2. Extract to a folder:**
```
Example: C:\Redis\
```

**3. Start Redis:**
```powershell
cd C:\Redis
.\redis-server.exe

# Keep this window open!
```

---

### Option C: Use Memurai (Redis-compatible for Windows)

**Download:** https://www.memurai.com/get-memurai
- Free for development
- Redis-compatible
- Better Windows support

---

## Step 2: Test Redis Connection

**Open a NEW terminal** (keep Redis running in the other one):

```powershell
redis-cli ping
# Should return: PONG
```

If you get `PONG`, Redis is working! ✅

---

## Step 3: Start the Backend

```powershell
cd "d:\Projects\Courier Management\backend"
npm run dev
```

**Expected Output:**
```
[dotenv@17.2.3] injecting .env file
✅ Redis connected
Server running on port 3000
```

If you see `✅ Redis connected`, everything is integrated! 🎉

---

## Step 4: Test the APIs

### Test 1: Check Server is Running

```powershell
curl http://localhost:3000/api/stores
```

### Test 2: Test Nearest Stores (PostGIS Query)

**First, you need to seed some store data with locations.**

Let me create a seed script for you...
