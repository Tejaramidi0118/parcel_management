// Main server file
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import parcelRoutes from "./routes/parcel.js";
import trackingRoutes from "./routes/tracking.js";
import hubRoutes from "./routes/hub.js";
import vehicleRoutes from "./routes/vehicle.js";
import cityRoutes from "./routes/city.js";
import userRoutes from "./routes/user.js";
import auditRoutes from "./routes/audit.js";
import statsRoutes from "./routes/stats.js";
import fareRoutes from "./routes/fare.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS configuration
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || true, 
  credentials: true 
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    new Date().toISOString(),
    req.method,
    req.originalUrl,
    "from",
    req.headers.origin || "no-origin"
  );
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (_req, res) => {
  res.json({ 
    ok: true, 
    service: "Courier Management System API",
    version: "1.0.0"
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/parcel", requireAuth, parcelRoutes);
app.use("/tracking", trackingRoutes); // Some endpoints are public
app.use("/hub", hubRoutes); // Some endpoints are public
app.use("/vehicle", vehicleRoutes);
app.use("/city", cityRoutes); // Some endpoints are public
app.use("/user", requireAuth, userRoutes);
app.use("/audit", requireAuth, auditRoutes);
app.use("/stats", requireAuth, statsRoutes);
app.use("/fare", fareRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});
