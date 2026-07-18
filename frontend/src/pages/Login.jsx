import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, ArrowLeft, ShieldCheck, Key, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Credentials cannot be empty.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post('/login', { email, password });
            const { token, user } = response.data.data || response.data;
            login(token, user);
            
            // Owner dan Admin langsung ke dashboard, tidak perlu isi profil
            if (user.role === 'owner' || user.role === 'admin') {
                navigate('/');
            } else if (!user.phone_wa || !user.alamat) {
                // Customer baru dengan profil belum lengkap
                navigate('/complete-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authorization failed. Verify your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-primary bg-white">
            
            {/* Left Column (Branding) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden border-r border-border">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                <div className="relative z-10 max-w-lg px-10 text-center">
                    <span className="text-primary uppercase tracking-[0.5em] text-[12px] font-bold mb-8 block font-sans">Akses Masuk</span>
                    <h1 className="text-8xl font-display font-bold mb-10 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <p className="text-text-secondary leading-relaxed text-sm font-body max-w-sm mx-auto">
                        Masuk ke dashboard pesanan eksklusif Anda dan pantau progres jahitan Anda secara real-time.
                    </p>
                </div>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white relative">
                <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 text-text-muted hover:text-primary transition-all font-sans text-[11px] uppercase tracking-widest font-bold group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Kembali ke Beranda
                </Link>
                
                <div className="w-full max-w-md animate-fade-in">
                    <div className="mb-14">
                        <h2 className="text-5xl font-display font-bold mb-5 text-text-primary">Selamat Datang</h2>
                        <p className="text-text-secondary text-sm font-body">Silakan masukkan email dan kata sandi Anda untuk mengakses portal.</p>
                    </div>

                    {error && (
                        <div className="mb-10 p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-4 text-[13px] font-body shadow-sm">
                            <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                <User className="w-4 h-4" /> Alamat Email
                            </label>
                            <input 
                                type="email" 
                                className="w-full px-8 py-6 bg-surface border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                <Key className="w-4 h-4" /> Kata Sandi
                            </label>
                            <input 
                                type="password" 
                                className="w-full px-8 py-6 bg-surface border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center text-[11px] uppercase tracking-widest font-bold font-sans">
                            <label className="flex items-center gap-3 cursor-pointer text-text-muted hover:text-text-primary transition-colors group">
                                <input type="checkbox" className="w-5 h-5 rounded-lg border-border bg-surface text-primary focus:ring-0 transition-all cursor-pointer" />
                                <span>Ingat Saya</span>
                            </label>
                            <a href="#" className="text-text-muted hover:text-primary transition-colors">Lupa kata sandi?</a>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-6 mt-6 bg-primary text-white uppercase tracking-[0.2em] text-sm font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 flex justify-center items-center disabled:opacity-50 font-sans group"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <div className="flex items-center gap-4">Masuk Sekarang <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform"/></div>}
                        </button>
                    </form>
                    
                    <p className="mt-16 text-center text-text-muted text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
                        Belum punya akun? <Link to="/register" className="text-primary hover:text-text-primary transition-colors ml-2 underline underline-offset-8">Daftar Sekarang</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

