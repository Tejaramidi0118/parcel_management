import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
export default function ProtectedRoute({ children, allowedRoles, }) {
    const { user, isAuthenticated, initializing, isLoading } = useAuth();

    // Show loading state while checking session
    if (initializing || (isLoading && !user)) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
