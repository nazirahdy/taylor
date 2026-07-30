import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            handleGoogleToken(token);
        } else {
            setError('Token autentikasi Google tidak ditemukan.');
        }
    }, [searchParams]);

    const handleGoogleToken = async (token) => {
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get('/me');
            const user = res.data?.data || res.data;
            login(token, user);

            if (user.role === 'owner' || user.role === 'admin') {
                navigate('/');
            } else if (!user.phone_wa || !user.alamat) {
                navigate('/complete-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Gagal memproses data akun Google.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-border max-w-md w-full text-center">
                {error ? (
                    <>
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-display font-bold text-text-primary mb-2">Autentikasi Gagal</h2>
                        <p className="text-sm text-text-secondary mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-105 transition-all"
                        >
                            Kembali ke Halaman Login
                        </button>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-display font-bold text-text-primary mb-2">Memproses Login Google...</h2>
                        <p className="text-sm text-text-secondary">Mohon tunggu sebentar, kami sedang menyiapkan sesi Anda.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default GoogleCallback;
