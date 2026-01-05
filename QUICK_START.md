# Quick Start Guide

## 🚀 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm start
```

The backend will run on: **http://localhost:3000**

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will run on: **http://127.0.0.1:5173**

### 3. Access the Application

Open your browser and go to: **http://127.0.0.1:5173**

## ✅ Verify Everything is Working

### Backend Health Checks

- **API Health**: http://localhost:3000/api/health
- **Database Health**: http://localhost:3000/api/health/db

### Test Authentication

1. **Register a new account**:
   - Go to the signup page
   - Fill in the form
   - Submit

2. **Login**:
   - Use your credentials
   - Should redirect to dashboard

## 📝 Important Notes

### Backend Configuration

Make sure `backend/.env` has your PostgreSQL password:
```env
DB_PASSWORD=your_actual_password
```

### Frontend Configuration

The frontend is configured to connect to:
- API URL: `http://localhost:3000/api` (default)

If you need to change it, create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file has correct password
- Check if port 3000 is available

### Frontend won't start
- Make sure you're in the `frontend` directory
- Run `npm install` if dependencies are missing
- Check if port 5173 is available

### Connection errors
- Make sure backend is running first
- Check CORS settings in backend
- Verify API URL in frontend

## 📊 Current Status

✅ Database: Connected  
✅ Backend API: Running  
✅ Frontend: Running  
✅ Authentication: Working  

## 🎯 Next Steps

- Test user registration and login
- Create more API endpoints
- Update DataContext to use API
- Add more features


