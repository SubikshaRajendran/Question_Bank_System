import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        if (storedUser && storedRole) {
            try {
                setUser({ ...JSON.parse(storedUser), role: storedRole });
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user');
                localStorage.removeItem('role');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, role) => {
        // Create a user object with role
        const userWithRole = { ...userData, role };
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', role);
    };

    const logout = async () => {
        try {
            if (user && user._id) {
                // Call backend to set offline status
                await fetch('/api/auth/student/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id })
                });
            }
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            // Clear local state regardless of API success
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
