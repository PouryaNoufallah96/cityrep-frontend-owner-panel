import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type GymOwnerData } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    gymOwner: GymOwnerData | null;
    isLoading: boolean;
    login: (accessToken: string, refreshToken?: string) => void;
    logout: () => void;
    setGymOwner: (data: GymOwnerData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'xfit_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gymOwner, setGymOwner] = useState<GymOwnerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            authService.getGymOwnerData()
                .then((data) => {
                    setGymOwner(data);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    setIsAuthenticated(false);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (accessToken: string, refreshToken?: string) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem('xfit_refresh_token', refreshToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setGymOwner(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, gymOwner, isLoading, login, logout, setGymOwner }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
