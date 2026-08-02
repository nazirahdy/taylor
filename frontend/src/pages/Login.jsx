import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, ArrowLeft, ShieldCheck, Key, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [needsRegister, setNeedsRegister] = useState(false);
    const [resendStatus, setResendStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleResendVerification = async () => {
        setResendStatus('sending');
        try {
            await axios.post('/email/resend-public', { email });
            setResendStatus('sent');
        } catch (err) {
            setResendStatus('error');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const response = await axios.get('/auth/google');
            if (response.data?.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            setError('Gagal menghubungkan ke layanan Google OAuth.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNeedsVerification(false);
        setNeedsRegister(false);
        setResendStatus('');
        if (!email || !password) {
            setError('Credentials cannot be empty.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post('/login', { email, password });
            const { token, user } = response.data.data || response.data;
            login(token, user);

            if (user.role === 'owner' || user.role === 'admin') {
                navigate('/');
            } else if (!user.phone_wa || !user.alamat) {
                navigate('/profile/edit');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authorization failed. Verify your credentials.');
            if (err.response?.data?.error_code === 'EMAIL_NOT_VERIFIED') {
                setNeedsVerification(true);
            }
            if (err.response?.data?.error_code === 'EMAIL_NOT_REGISTERED') {
                setNeedsRegister(true);
            }
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
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-5 block font-sans">Akses Masuk</span>
                    <h1 className="text-2xl font-display font-bold mb-6 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <p className="text-text-secondary leading-relaxed text-sm font-body max-w-sm mx-auto">
                        Masuk ke dashboard pesanan eksklusif Anda dan pantau progres jahitan Anda secara real-time
                    </p>
                </div>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white">

                {/* Tombol kembali — di luar flow center */}
                <div className="px-8 sm:px-12 pt-10">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all font-sans text-[11px] uppercase tracking-widest font-bold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Form — flex-1 + flex center agar konten benar-benar di tengah sisa ruang */}
                <div className="flex-1 flex items-center justify-center px-8 sm:px-12 py-12">
                    <div className="w-full max-w-md animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-3xl font-display font-bold mb-3 text-text-primary">Selamat Datang</h2>
                            <p className="text-text-secondary text-sm font-body">Silakan masukkan email dan kata sandi Anda untuk mengakses portal</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex flex-col gap-3 text-[13px] font-body shadow-sm">
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                                {needsVerification && (
                                    <div className="pl-10">
                                        {resendStatus === 'sent' ? (
                                            <span className="text-green-600 font-bold text-xs">Email verifikasi baru sudah dikirim, silakan cek inbox Anda.</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendVerification}
                                                disabled={resendStatus === 'sending'}
                                                className="text-primary font-bold text-xs uppercase tracking-widest underline underline-offset-4 disabled:opacity-50"
                                            >
                                                {resendStatus === 'sending' ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {needsRegister && (
                                    <div className="pl-10">
                                        <Link
                                            to="/register"
                                            className="text-primary font-bold text-xs uppercase tracking-widest underline underline-offset-4"
                                        >
                                            Daftar Sekarang
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                    <User className="w-4 h-4" /> Alamat Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-3.5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                    <Key className="w-4 h-4" /> Kata Sandi
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full px-5 py-3.5 pr-12 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold font-sans">
                                <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-text-primary transition-colors group">
                                    <input type="checkbox" className="w-4 h-4 rounded-lg border-border bg-surface text-primary focus:ring-0 transition-all cursor-pointer" />
                                    <span>Ingat Saya</span>
                                </label>
                                <Link to="/forgot-password" className="text-text-muted hover:text-primary transition-colors">Lupa kata sandi?</Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-4 bg-primary text-white uppercase tracking-[0.2em] text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 flex justify-center items-center disabled:opacity-50 font-sans group"
                            >
                                {isLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <div className="flex items-center gap-3">Masuk Sekarang <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" /></div>
                                }
                            </button>

                            <div className="relative my-5 flex items-center justify-center">
                                <div className="border-t border-border w-full"></div>
                                <span className="bg-white px-4 text-[10px] uppercase tracking-widest font-bold text-text-muted shrink-0 font-sans">atau</span>
                                <div className="border-t border-border w-full"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full py-3.5 bg-surface border border-border text-text-primary uppercase tracking-[0.15em] text-[11px] font-bold rounded-xl hover:bg-slate-100 transition-all flex justify-center items-center gap-3 font-sans shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                Masuk dengan Google
                            </button>
                        </form>

                        <p className="mt-10 text-center text-text-muted text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
                            Belum punya akun?{' '}
                            <Link to="/register" className="text-primary hover:text-text-primary transition-colors ml-2 underline underline-offset-8">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;