'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    checkAuth: async () => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

    const checkAuth = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            let res = await fetch(`${baseUrl}/api/auth/profile/me`, {
                credentials: 'include'
            });

            if (res.status === 401) {
                // Try to refresh token
                const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (refreshRes.ok) {
                    // Retry original request
                    res = await fetch(`${baseUrl}/api/auth/profile/me`, {
                        credentials: 'include'
                    });
                }
            }

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            await fetch(`${baseUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = publicRoutes.includes(pathname);
            if (!user && !isPublicRoute) {
                router.push('/login');
            } else if (user && isPublicRoute) {
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
