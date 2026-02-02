import jwt from "jsonwebtoken";
import pool from "../config/db.config.js";
import { generateAccessToken } from "../utils/token.js";
import { registerUser, loginUser, changePassword as changePasswordService } from "../services/auth.service.js";

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
    }

    await changePasswordService(req.user.id, oldPassword, newPassword);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await loginUser(req.body);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required"
    });
  }

  let payload;

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }

  const tokenResult = await pool.query(
    `SELECT user_id, refresh_token FROM user_auth WHERE user_id = $1`,
    [payload.id]
  );

  if (
    tokenResult.rows.length === 0 ||
    tokenResult.rows[0].refresh_token !== refreshToken
  ) {
    return res.status(401).json({
      success: false,
      message: "Token revoked"
    });
  }

  // Fetch user to get role
  const userResult = await pool.query(
    `SELECT user_id as id, role FROM app_user WHERE user_id = $1`,
    [payload.id]
  );

  const user = userResult.rows[0];

  const validAccessToken = generateAccessToken({
    id: user.id,
    role: user.role
  });

  return res.json({
    success: true,
    accessToken: validAccessToken
  });
};

export const logout = async (req, res) => {
  await pool.query(
    `UPDATE user_auth SET refresh_token = NULL WHERE user_id = $1`,
    [req.user.id]
  );

  return res.json({
    success: true,
    message: "Logged out successfully"
  });
};
