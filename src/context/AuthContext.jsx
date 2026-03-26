import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Separate states for user and admin
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    const [admin, setAdmin] = useState(null);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load regular user
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Load admin user
        const storedAdmin = localStorage.getItem('admin');
        if (adminToken && storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
        
        setLoading(false);
    }, [token, adminToken]);

    const userLogin = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const userLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const adminLogin = (newToken, adminData) => {
        setAdminToken(newToken);
        setAdmin(adminData);
        localStorage.setItem('adminToken', newToken);
        localStorage.setItem('admin', JSON.stringify(adminData));
    };

    const adminLogout = () => {
        setAdminToken(null);
        setAdmin(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
    };

    return (
        <AuthContext.Provider value={{ 
            user, token, userLogin, userLogout, 
            admin, adminToken, adminLogin, adminLogout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
