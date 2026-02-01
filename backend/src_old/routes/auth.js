// backend/src/routes/auth.js
import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

/**
 * Validation schemas
 * - signupSchema expects split address fields (street, area, city, pincode) optionally.
 * - phone is optional and nullable.
 */
const signupSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7).max(30).optional().nullable(),
  address_street: z.string().min(1).optional().nullable(),
  address_area: z.string().min(1).optional().nullable(),
  address_city: z.string().min(1).optional().nullable(),
  address_pincode: z.string().min(3).max(20).optional().nullable()
});

const loginSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1)
});

/**
 * Helper: check if a table.column exists in the database
 * returns true/false
 */
async function hasColumn(table, column) {
  try {
    const q = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
      [table, column]
    );
    return q.rowCount > 0;
  } catch (e) {
    console.warn("hasColumn check failed:", e?.message || e);
    return false;
  }
}

/**
 * Verbose shared signup handler.
 * This is intentionally explicit and step-by-step to match your long-form style.
 */
async function handleSignup(req, res) {
  console.log(">>> received signup request at /auth (payload):", JSON.stringify(req.body));

  try {
    // Validate input using zod schema
    const data = signupSchema.parse(req.body);

    // Ensure username/email not already used
    const existingQ = await pool.query(
      `SELECT 1 FROM app_user WHERE username = $1 OR email = $2 LIMIT 1`,
      [data.username, data.email]
    );
    if (existingQ.rowCount) {
      console.log("signup: username or email already exists:", data.username, data.email);
      return res.status(409).json({ error: "Username or email already exists" });
    }

    // Determine role server-side (authoritative)
    const emailLower = (data.email || "").toLowerCase();
    let role = "customer";
    if (emailLower.endsWith("@swiftadmin.com")) {
      role = "admin";
    } else if (emailLower.endsWith("@swiftcourier.com")) {
      role = "courier";
    } else {
      role = "customer";
    }
    console.log("signup: assigned role =", role);

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Detect DB columns so we insert only what's present (robust to schema changes)
    const columnsToCheck = [
      "phone",
      "address",
      "address_street",
      "address_area",
      "address_city",
      "address_pincode",
    ];
    const colQuery = await pool.query(
      `SELECT column_name, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'app_user' AND column_name = ANY($1::text[])`,
      [columnsToCheck]
    );

    // Map of column -> is_nullable (YES/NO)
    const dbCols = {};
    for (const r of colQuery.rows) {
      dbCols[r.column_name] = r.is_nullable; // 'YES' or 'NO'
    }

    // Helper booleans
    const hasPhoneCol        = Boolean(dbCols["phone"]);
    const hasAddressCol      = Boolean(dbCols["address"]);
    const hasAddressStreet   = Boolean(dbCols["address_street"]);
    const hasAddressArea     = Boolean(dbCols["address_area"]);
    const hasAddressCity     = Boolean(dbCols["address_city"]);
    const hasAddressPincode  = Boolean(dbCols["address_pincode"]);

    // If DB requires phone and client didn't provide -> return 400
    if (dbCols["phone"] === "NO" && !data.phone) {
      console.warn("DB requires phone but payload missing phone");
      return res.status(400).json({ error: "Database requires phone; include phone in request" });
    }

    // If DB requires an address column (address or address_street) but payload did not provide any address pieces -> error
    const dbRequiresAddress = (dbCols["address"] === "NO") || (dbCols["address_street"] === "NO");
    const anyAddressProvided = Boolean(
      data.address_street || data.address_area || data.address_city || data.address_pincode
    );
    if (dbRequiresAddress && !anyAddressProvided) {
      console.warn("DB requires address but payload missing address pieces");
      return res.status(400).json({ error: "Database requires address fields; include address in request" });
    }

    // Build columns/values arrays dynamically (explicit ordering)
    const insertCols = ["username", "password_hash", "full_name", "email", "role"];
    const insertVals = [data.username, passwordHash, data.full_name, data.email, role];
    const placeholders = insertCols.map((_, i) => `$${i + 1}`);

    // Address insertion logic:
    // Prefer full 'address' column if present; otherwise insert split pieces if columns exist.
    if (hasAddressCol) {
      // If the DB has single 'address', combine pieces (if available) into one string
      const combinedAddress = [
        data.address_street,
        data.address_area,
        data.address_city,
        data.address_pincode
      ]
        .filter(Boolean)
        .join(", ");
      insertCols.push("address");
      insertVals.push(combinedAddress || null);
      placeholders.push(`$${placeholders.length + 1}`);
    } else {
      // Insert split columns only if they exist in DB
      if (hasAddressStreet) {
        insertCols.push("address_street");
        insertVals.push(data.address_street ?? null);
        placeholders.push(`$${placeholders.length + 1}`);
      }
      if (hasAddressArea) {
        insertCols.push("address_area");
        insertVals.push(data.address_area ?? null);
        placeholders.push(`$${placeholders.length + 1}`);
      }
      if (hasAddressCity) {
        insertCols.push("address_city");
        insertVals.push(data.address_city ?? null);
        placeholders.push(`$${placeholders.length + 1}`);
      }
      if (hasAddressPincode) {
        insertCols.push("address_pincode");
        insertVals.push(data.address_pincode ?? null);
        placeholders.push(`$${placeholders.length + 1}`);
      }
    }

    // Phone handling: insert phone column if present in DB
    if (hasPhoneCol) {
      insertCols.push("phone");
      const phoneVal = typeof data.phone !== "undefined" && data.phone !== null ? data.phone : null;
      insertVals.push(phoneVal);
      placeholders.push(`$${placeholders.length + 1}`);
    }

    // Final explicit query build
    const finalQuery = `
      INSERT INTO app_user (${insertCols.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING user_id, username, full_name, email, role, created_at
    `;

    console.log("signup: inserting user with columns:", insertCols);

    // Execute insertion
    const inserted = await pool.query(finalQuery, insertVals);
    const createdUser = inserted.rows[0];

    // ✅ NEW: insert into specialization table based on role
    try {
      if (role === "customer") {
        await pool.query(
          `INSERT INTO customer (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [createdUser.user_id]
        );
      } else if (role === "courier") {
        await pool.query(
          `INSERT INTO courier (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [createdUser.user_id]
        );
      } else if (role === "admin") {
        await pool.query(
          `INSERT INTO admin (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [createdUser.user_id]
        );
      }
    } catch (e) {
      console.warn("Warning: specialization insert failed:", e?.message || e);
    }

    // Optionally, if user_phone table exists and phone provided, insert into user_phone (non-fatal)
    if (data.phone) {
      try {
        const userPhoneExists = await hasColumn("user_phone", "phone");
        if (userPhoneExists) {
          await pool.query(
            `INSERT INTO user_phone (user_id, phone) VALUES ($1, $2)
             ON CONFLICT (user_id, phone) DO NOTHING`,
            [createdUser.user_id, data.phone]
          );
        }
      } catch (e) {
        console.warn("Warning: user_phone insert failed:", e?.message || e);
      }
    }

    // Return created user (safe fields only)
    return res.status(201).json({
      user: createdUser,
      message: "Account created. Please log in."
    });
  } catch (err) {
    if (err?.issues) {
      // zod validation error details available
      console.warn("Signup validation failed:", err.issues);
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    console.error("Signup error (stack):", err?.stack || err);
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * Expose both /signup and /register to be compatible with your frontend variants.
 * - /signup: intended default
 * - /register: alias/traditional
 */
router.post("/signup", async (req, res) => {
  await handleSignup(req, res);
});
router.post("/register", async (req, res) => {
  await handleSignup(req, res);
});

/**
 * Login endpoint
 * Accepts either username or email as 'id'
 */
router.post("/login", async (req, res) => {
  try {
    const { id, password } = loginSchema.parse(req.body);

    // Query user by username or email
    const q = await pool.query(
      `SELECT user_id, username, full_name, email, role, password_hash,
              address_street, address_area, address_city, address_pincode, phone
       FROM app_user
       WHERE username = $1 OR email = $1
       LIMIT 1`,
      [id]
    );

    if (!q.rowCount) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userRow = q.rows[0];

    // Compare password
    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { user_id: userRow.user_id, username: userRow.username, role: userRow.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Remove sensitive field before returning
    delete userRow.password_hash;

    // Return token + user
    return res.json({ token, user: userRow });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: "Invalid input", details: err.issues });
    console.error("Login error:", err?.stack || err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * /me endpoint - returns the current authenticated user based on Bearer token
 */
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.warn("Token verify failed:", e?.message || e);
      return res.status(401).json({ error: "Invalid token" });
    }

    // Fetch user by id in token
    const meQ = await pool.query(
      `SELECT user_id, username, full_name, email, role, created_at,
              address_street, address_area, address_city, address_pincode, phone
       FROM app_user WHERE user_id = $1 LIMIT 1`,
      [payload.user_id]
    );

    if (!meQ.rowCount) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json({ user: meQ.rows[0] });
  } catch (err) {
    console.error("Me endpoint error:", err?.stack || err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
