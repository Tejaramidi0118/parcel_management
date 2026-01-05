// Role-based access control middleware
import { ForbiddenError } from "../utils/errors.js";

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireCourier = requireRole('courier', 'admin');
export const requireCustomer = requireRole('customer', 'courier', 'admin');

