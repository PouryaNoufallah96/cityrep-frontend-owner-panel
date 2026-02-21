import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    children: ReactNode;
}

/** Redirects unauthenticated users to /login */
export function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

/** Redirects authenticated users away from login / register */
export function GuestRoute({ children }: Props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="inline-block w-8 h-8 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
