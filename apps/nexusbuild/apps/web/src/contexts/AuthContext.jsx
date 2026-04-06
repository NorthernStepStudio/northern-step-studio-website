import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from storage on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('authToken');
            if (userData && token) {
                setUser(JSON.parse(userData));
                try {
                    const freshUser = await authAPI.getMe();
                    if (freshUser) {
                        localStorage.setItem('user', JSON.stringify(freshUser));
                        setUser(freshUser);
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                }
            }
        } catch (err) {
            console.error('Error loading user:', err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authAPI.login(email, password);

            // Save token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authAPI.register(username, email, password);

            // Save token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setUser(data.user);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
