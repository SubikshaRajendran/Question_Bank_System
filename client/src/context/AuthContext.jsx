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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
