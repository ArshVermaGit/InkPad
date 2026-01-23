import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';



interface User {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    name: string;
    picture: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('inkpad_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    // Show modal on first entry if not logged in
    useEffect(() => {
        if (!user) {
            const timer = setTimeout(() => setAuthModalOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info using the access token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                
                setUser(userInfo);
                localStorage.setItem('inkpad_user', JSON.stringify(userInfo));
                setAuthModalOpen(false);
            } catch (error) {
                console.error('Login Failed', error);
            }
        },
        onError: (error) => console.log('Login Failed:', error)
    });

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('inkpad_user');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            login, 
            logout,
            isAuthModalOpen,
            setAuthModalOpen
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
