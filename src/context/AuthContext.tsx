import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useToast } from '../hooks/useToast';



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
    // Show modal on first entry if not logged in
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('inkpad_welcome_seen');
        if (!user && !hasSeenWelcome) {
            // Push to next tick to avoid synchronous state update warning
            const timer = setTimeout(() => {
                setAuthModalOpen(true);
                localStorage.setItem('inkpad_welcome_seen', 'true');
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [user, setAuthModalOpen]);

    const { addToast } = useToast();

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
                addToast(`Welcome back, ${userInfo.given_name}!`, 'success');
            } catch (error) {
                console.error('Login Failed', error);
                addToast('Failed to sign in. Please try again.', 'error');
            }
        },
        onError: (error) => {
            console.log('Login Failed:', error);
            addToast('Login failed or was cancelled.', 'error');
        }
    });

    const logout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('inkpad_user');
        addToast('Successfully signed out.', 'info');
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
