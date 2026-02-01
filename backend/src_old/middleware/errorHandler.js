// Error handling middleware
import { AppError } from "../utils/errors.js";

export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // Zod validation errors
  if (err?.issues) {
    return res.status(400).json({
      error: "Validation error",
      details: err.issues
    });
  }

  // Default error
  return res.status(500).json({
    error: err.message || "Internal server error"
  });
}

