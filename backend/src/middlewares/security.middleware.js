import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ===== HELMET SECURITY HEADERS =====
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
});

// ===== RATE LIMITING =====

// General API rate limit
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Checkout rate limit (prevent cart spam)
export const checkoutLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // 3 checkouts per minute
    message: 'Too many checkout attempts, please wait before trying again.',
    standardHeaders: true,
    legacyHeaders: false,
});

// ===== REQUEST SANITIZATION =====

/**
 * Middleware to sanitize request body and prevent injection
 */
export function sanitizeRequest(req, res, next) {
    // Remove potentially dangerous characters from string inputs
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        // Remove HTML tags and basic SQL injection patterns
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[';\"]/g, ''); // Remove quotes for basic SQL injection prevention
    };

    const sanitizeObjectInPlace = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObjectInPlace(obj[key]);
            }
        }
    };

    // Sanitize in place (don't reassign)
    if (req.body && typeof req.body === 'object') {
        sanitizeObjectInPlace(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        sanitizeObjectInPlace(req.query);
    }

    next();
}

// ===== CORS CONFIGURATION (Enhanced) =====

export const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from allowed origins
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            process.env.FRONTEND_URL // Production frontend URL from env
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'], // For pagination
    maxAge: 86400, // 24 hours
};
