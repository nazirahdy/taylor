import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Loader2, ArrowLeft, Key, CheckCircle2, KeyRound } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axios.post('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset kata sandi. Tautan mungkin sudah kedaluwarsa.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-border max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-display font-bold text-text-primary mb-2">Tautan Tidak Valid</h2>
                    <p className="text-sm text-text-secondary mb-6">Tautan reset kata sandi tidak lengkap atau tidak valid.</p>
                    <Link
                        to="/forgot-password"
                        className="block w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-105 transition-all"
                    >
                        Minta Tautan Baru
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex text-text-primary bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden border-r border-border">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                <div className="relative z-10 max-w-lg px-10 text-center">
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-5 block font-sans">Kata Sandi Baru</span>
                    <h1 className="text-2xl font-display font-bold mb-6 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <p className="text-text-secondary leading-relaxed text-sm font-body max-w-sm mx-auto">
                        Buat kata sandi baru yang kuat untuk melindungi akun Anda
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col bg-white">
                <div className="px-8 sm:px-12 pt-10">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all font-sans text-[11px] uppercase tracking-widest font-bold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Login
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-8 sm:px-12 py-6">
                    <div className="w-full max-w-md animate-fade-in">
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <KeyRound className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-5 text-text-primary">Reset Kata Sandi</h2>
                            <p className="text-text-secondary text-sm font-body">Masukkan kata sandi baru untuk akun <span className="font-bold text-text-primary">{email}</span></p>
                        </div>

                        {error && (
                            <div className="mb-6 p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-4 text-[13px] font-body shadow-sm">
                                <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success ? (
                            <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-4 text-[13px] font-body shadow-sm">
                                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
                                <span>Kata sandi berhasil direset! Mengarahkan Anda ke halaman login...</span>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                        <Key className="w-4 h-4" /> Kata Sandi Baru
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-5 py-3.5 bg-surface border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                        placeholder="Min. 8 Karakter"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                        <Key className="w-4 h-4" /> Konfirmasi Kata Sandi
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-5 py-3.5 bg-surface border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                        placeholder="Ulangi Kata Sandi Baru"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 mt-4 bg-primary text-white uppercase tracking-[0.2em] text-sm font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 flex justify-center items-center disabled:opacity-50 font-sans group"
                                >
                                    {isLoading
                                        ? <Loader2 className="w-6 h-6 animate-spin" />
                                        : 'Reset Kata Sandi'
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
