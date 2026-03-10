import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type GymOwnerData } from '../services/authService';
import { gymService } from '../services/gymService';

interface AuthContextType {
    isAuthenticated: boolean;
    gymOwner: GymOwnerData | null;
    hasGym: boolean | null; // null = not yet checked, true/false = checked
    isLoading: boolean;
    login: (accessToken: string, refreshToken?: string) => void;
    logout: () => void;
    setGymOwner: (data: GymOwnerData) => void;
    recheckGyms: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'xfit_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gymOwner, setGymOwner] = useState<GymOwnerData | null>(null);
    const [hasGym, setHasGym] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkGyms = async () => {
        try {
            const response = await gymService.getAllGyms();
            const gyms = (response?.data?.data || []);
            console.log("heer")
            setHasGym(gyms.length > 0);
        } catch {
            console.log("heer2")
            setHasGym(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            Promise.all([
                authService.getGymOwnerData(),
                gymService.getAllGyms(),
            ])
                .then(([ownerData, gymsResponse]) => {
                    setGymOwner(ownerData);
                    setIsAuthenticated(true);
                    const gyms = (gymsResponse?.data?.data || []);
                    setHasGym(gyms.length > 0);
                })
                .catch(() => {
                    localStorage.removeItem(TOKEN_KEY);
                    setIsAuthenticated(false);
                    setHasGym(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    // Auto-check gyms when user becomes authenticated (post-login flow)
    useEffect(() => {
        if (isAuthenticated && hasGym === null && !isLoading) {
            checkGyms();
        }
    }, [isAuthenticated, hasGym, isLoading]);

    const login = (accessToken: string, refreshToken?: string) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) localStorage.setItem('xfit_refresh_token', refreshToken);
        setIsAuthenticated(true);
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setGymOwner(null);
        setHasGym(null);
    };

    const recheckGyms = async () => {
        await checkGyms();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, gymOwner, hasGym, isLoading, login, logout, setGymOwner, recheckGyms }}>
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
