// frontend/src/components/shared/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";
import type { UserRole } from "@/types";

interface Props {
  allowedRoles?: UserRole[]; // e.g. ['admin']
  children: ReactNode;
}

/**
 * Usage (your routes.tsx style):
 * element: (
 *   <ProtectedRoute allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * )
 */
export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, isLoading } = useAuth();

  // while auth state is being checked, don't redirect (show nothing or spinner)
  if (isLoading) return null;

  // if not authenticated -> go to login
  if (!user) return <Navigate to="/login" replace />;

  // if allowedRoles set and user's role not included -> redirect to their dashboard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    const roleRedirect = (role?: string) => {
      switch (role) {
        case "admin":
          return "/admin/dashboard";
        case "courier":
          return "/courier/dashboard";
        case "customer":
        default:
          return "/customer/dashboard";
      }
    };
    return <Navigate to={roleRedirect(user.role)} replace />;
  }

  // permitted -> render children
  return <>{children}</>;
}
