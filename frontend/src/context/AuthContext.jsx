import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Setup base URL for axios based on Laravel API
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
            delete axios.defaults.headers.common['Authorization'];
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await axios.get('/me'); 
            // Ambil nested data jika ada (misal res.data.data), atau langsung res.data
            setUser(res.data?.data || res.data);
        } catch (err) {
            console.error("Gagal load user:", err);
            // Jangan langsung delete token kalo errornya bukan 401
            if (err.response && err.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            if (token) await axios.post('/logout'); // panggil API logout jika ada
        } catch (e) {
             console.error(e);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const updateUserState = (newData) => {
        setUser((prev) => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUserState }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
