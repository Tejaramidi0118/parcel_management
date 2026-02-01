import express from "express";
import cors from "cors";

import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import {
    securityHeaders,
    apiLimiter,
    sanitizeRequest,
    corsOptions
} from "./middlewares/security.middleware.js";

// Legacy/Core Routes
import authRoutes from "./routes/auth.routes.js";
import cityRoutes from "./routes/city.routes.js";
import hubRoutes from "./routes/hub.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import userRoutes from "./routes/user.routes.js";
import locationRoutes from "./modules/location/location.routes.js";
import orderRoutes from "./modules/order/order.routes.js";

// New Feature Routes
import parcelRoutes from "./routes/parcel.routes.js";
import storeRoutes from "./routes/store.routes.js";
import productRoutes from "./routes/product.routes.js";
import districtRoutes from "./routes/district.routes.js";
import addressRoutes from "./routes/address.routes.js";
import stateRoutes from "./routes/state.routes.js";

const app = express();

// ===== Security Middleware (must be first) =====
app.use(securityHeaders); // Helmet security headers
app.use(cors(corsOptions)); // CORS with strict origin check

// ===== Body Parsing =====
app.use(express.json({ limit: '10mb' })); // Prevent huge payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Request Sanitization =====
app.use(sanitizeRequest);

// ===== Rate Limiting =====
app.use('/api/', apiLimiter); // General API rate limit

// ===== Routes =====
// Auth routes
app.use("/auth", authRoutes); // Legacy route (no /api prefix)
app.use("/api/auth", authRoutes); // Standard route

// Core routes
app.use("/city", cityRoutes);
app.use("/hub", hubRoutes);
app.use("/vehicle", vehicleRoutes);
app.use("/user", userRoutes); // Includes /user/me
app.use("/api/locations", locationRoutes);
app.use("/api/orders", orderRoutes);

// Feature routes
app.use("/parcel", parcelRoutes);
app.use("/store", storeRoutes);
app.use("/product", productRoutes);
app.use("/district", districtRoutes);
app.use("/state", stateRoutes);
app.use("/address", addressRoutes);

// ===== Error Handling =====
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
