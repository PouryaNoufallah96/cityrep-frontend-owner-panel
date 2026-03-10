import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    children: ReactNode;
}

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
);

/** Redirects unauthenticated users to /login */
export function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

/** Redirects authenticated users away from login */
export function GuestRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

/** 
 * For pages that require a gym (dashboard, profile, schedule, etc.)
 * - Not authenticated → /login
 * - Authenticated but hasGym not yet checked → show loading
 * - Authenticated but no gym → /register
 * - Authenticated and has gym → render children
 */
export function GymOwnerRoute({ children }: Props) {
    const { isAuthenticated, isLoading, hasGym } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Still checking gyms
    if (hasGym === null) {
        return <LoadingSpinner />;
    }

    if (!hasGym) {
        return <Navigate to="/register" replace />;
    }

    return <>{children}</>;
}

/**
 * For the /register page only
 * - Not authenticated → /login
 * - Authenticated and already has a gym → /dashboard
 * - Authenticated and no gym → render register page
 */
export function RegisterRoute({ children }: Props) {
    const { isAuthenticated, isLoading, hasGym } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Still checking gyms
    if (hasGym === null) {
        return <LoadingSpinner />;
    }

    if (hasGym) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
