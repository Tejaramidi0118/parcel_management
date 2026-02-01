import bcrypt from "bcryptjs";
import pool from "../config/db.config.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

// Helper to get name from email if not provided
const getNameFromEmail = (email) => email.split("@")[0];

export const registerUser = async ({ email, password, name, username, phone, address_street, address_area, address_city, address_pincode }) => {
  const client = await pool.connect();

  try {
    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);
    const finalName = name || email.split('@')[0];

    // 1. Check if user exists (by email or username)
    const existingCheck = await client.query(
      `SELECT user_id FROM app_user WHERE email = $1 OR username = $2`,
      [email, finalUsername]
    );

    if (existingCheck.rows.length > 0) {
      throw new Error("User already exists with this email or username");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine Role based on Email Domain
    let role = "customer";  // Default from schema
    const emailLower = email.toLowerCase();

    if (emailLower.includes("admin")) role = "admin";
    else if (emailLower.includes("courier")) role = "courier";
    else if (emailLower.includes("store")) role = "store_owner"; // Matches 'mystore@gmail.com' etc.

    // Create user - includes address fields and phone
    const userResult = await client.query(
      `INSERT INTO app_user (
          username, password_hash, full_name, email, role, 
          phone, address_street, address_area, address_city, address_pincode
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING 
          user_id as id, 
          username, 
          email, 
          full_name as "fullName", 
          role,
          phone,
          address_street,
          address_city`,
      [
        finalUsername,
        hashedPassword,
        finalName,
        email,
        role,
        phone || null,
        address_street || null,
        address_area || null,
        address_city || null,
        address_pincode || null
      ]
    );

    const newUser = userResult.rows[0];

    // Generate tokens
    const refreshToken = generateRefreshToken({ id: newUser.id });
    const accessToken = generateAccessToken({
      id: newUser.id,
      role: newUser.role,
    });

    // Format response
    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    // Get user with password_hash from app_user table
    const result = await pool.query(
      `SELECT
        user_id as id,
        username,
        email,
        full_name as "fullName",
        role,
        password_hash
       FROM app_user
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = result.rows[0];
    const passwordHash = user.password_hash;
    delete user.password_hash; // Remove from user object

    const match = await bcrypt.compare(password, passwordHash);

    if (!match) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    // Format response
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw error;
  }
};
