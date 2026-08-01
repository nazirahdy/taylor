import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Loader2, ArrowLeft, Mail, CheckCircle2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const response = await axios.post('/forgot-password', { email });
            setMessage(response.data?.message || 'Tautan reset kata sandi telah dikirim ke email Anda.');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim tautan reset kata sandi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-primary bg-white">
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden border-r border-border">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                <div className="relative z-10 max-w-lg px-10 text-center">
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-5 block font-sans">Pemulihan Akun</span>
                    <h1 className="text-4xl font-display font-bold mb-6 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <p className="text-text-secondary leading-relaxed text-sm font-body max-w-sm mx-auto">
                        Jangan khawatir, kami akan membantu Anda mengakses kembali akun Anda
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

                <div className="flex-1 flex items-center justify-center px-8 sm:px-12 py-10">
                    <div className="w-full max-w-md animate-fade-in">
                        <div className="mb-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <KeyRound className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-display font-bold mb-5 text-text-primary">Lupa Kata Sandi?</h2>
                            <p className="text-text-secondary text-sm font-body">Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi</p>
                        </div>

                        {error && (
                            <div className="mb-10 p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-4 text-[13px] font-body shadow-sm">
                                <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="mb-10 p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-4 text-[13px] font-body shadow-sm">
                                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary font-bold ml-1 font-sans">
                                    <Mail className="w-4 h-4" /> Alamat Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-5 py-3.5 bg-surface border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-text-muted/30 font-body"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    : 'Kirim Tautan Reset'
                                }
                            </button>
                        </form>

                        <p className="mt-10 text-center text-text-muted text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
                            Ingat kata sandi Anda?{' '}
                            <Link to="/login" className="text-primary hover:text-text-primary transition-colors ml-2 underline underline-offset-8">
                                Masuk
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
