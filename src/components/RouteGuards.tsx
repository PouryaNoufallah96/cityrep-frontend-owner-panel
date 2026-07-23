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

export function GymOwnerRoute({ children }: Props) {
    const { isAuthenticated, isLoading, hasGym } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (hasGym === null) {
        return <LoadingSpinner />;
    }

    if (!hasGym) {
        return <Navigate to="/register" replace />;
    }

    return <>{children}</>;
}

export function RegisterRoute({ children }: Props) {
    const { isAuthenticated, isLoading, hasGym } = useAuth();
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (hasGym === null) {
        return <LoadingSpinner />;
    }

    if (hasGym) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
