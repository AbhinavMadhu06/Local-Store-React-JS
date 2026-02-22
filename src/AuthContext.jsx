import React, { createContext, useState, useEffect } from 'react';
import api from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // In a real app, we'd have a /me/ endpoint. For now, we'll try to fetch users.
                    // Since we need the current user's profile, let's just decode the token or fetch profiles.
                    // Let's create a small hack to get current user if we don't have a /api/users/me/ endpoint:
                    // We can fetch /api/users/ and find the one that matches our token (too slow).
                    // For this MVP, we will rely on Login response to set the user state initially.
                    // Or we can just set authenticated true if token exists.
                    setUser({ token });
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('token/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // After login, we might want to fetch user details. Let's just store token for now.
        setUser({ token: response.data.access });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
