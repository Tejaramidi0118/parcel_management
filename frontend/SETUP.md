# Frontend Setup Guide

## Quick Start

After the project restructuring, follow these steps:

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npx vite --host 127.0.0.1
```

### 3. Access the Application

Open your browser at: `http://127.0.0.1:5173`

## Project Structure

All frontend code is now in this `frontend/` directory:

- `src/` - Source code
- `public/` - Static assets
- `index.html` - Entry HTML file
- Configuration files (vite.config.ts, tsconfig.json, etc.)

## Notes

- Dependencies need to be reinstalled in this folder
- All paths are relative and should work as before
- The application uses mock data (no backend connection required)

