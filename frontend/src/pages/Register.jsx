import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2, Fingerprint, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_wa: '',
        alamat: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post('/register', formData);
            const { token, user } = response.data.data || response.data;
            login(token, user);
            navigate('/verify-email');
        } catch (err) {
            setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-primary bg-white">

            {/* Left Column (Branding) — foto disamakan dengan Login */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden border-r border-border">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                <div className="relative z-10 max-w-lg px-10 text-center">
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-6 block">Bergabung Bersama Kami</span>
                    <h1 className="text-7xl font-display font-bold mb-10 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <div className="space-y-6 text-left">
                        {[
                            "Konsultasi desain busana custom.",
                            "Pantau progres jahitan secara real-time.",
                            "Komunikasi langsung dengan penjahit ahli.",
                            "Kurasi bahan & aksesoris kualitas premium."
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 text-sm font-body text-text-secondary group">
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="group-hover:text-text-primary transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white">

                {/* Tombol kembali — di luar flow center */}
                <div className="px-8 sm:px-12 pt-8">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all font-sans text-[11px] uppercase tracking-widest font-bold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Login
                    </Link>
                </div>

                {/* Form — flex-1 + center agar pas satu layar */}
                <div className="flex-1 flex items-center justify-center px-8 sm:px-12 py-6">
                    <div className="w-full max-w-md animate-fade-in">

                        <div className="mb-8 text-center">
                            <h2 className="text-4xl font-display font-bold mb-3 text-text-primary">Buat Akun</h2>
                            <p className="text-text-secondary text-sm font-body">Masukkan detail Anda untuk memulai pengalaman menjahit premium</p>
                        </div>

                        {error && (
                            <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-xs font-body">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1">
                                    <Fingerprint className="w-3 h-3" /> Nama Lengkap
                                </label>
                                <input
                                    type="text" name="name" required
                                    className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm"
                                    placeholder="Nama Anda"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Alamat Email</label>
                                    <input
                                        type="email" name="email" required
                                        className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm"
                                        placeholder="nama@email.com"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Nomor WhatsApp</label>
                                    <input
                                        type="tel" name="phone_wa" required
                                        className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm"
                                        placeholder="0812..."
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Alamat Lengkap</label>
                                <textarea
                                    name="alamat" required
                                    className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm resize-none"
                                    placeholder="Alamat lengkap Anda..."
                                    rows="2"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Kata Sandi</label>
                                    <input
                                        type="password" name="password" required
                                        className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm"
                                        placeholder="Min. 8 Karakter"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Konfirmasi Sandi</label>
                                    <input
                                        type="password" name="password_confirmation" required
                                        className="w-full px-5 py-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body text-sm"
                                        placeholder="Ulangi Kata Sandi"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 bg-primary text-white uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex justify-center items-center disabled:opacity-50"
                            >
                                {isLoading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <div className="flex items-center gap-3">Daftar Sekarang <ShieldCheck className="w-4 h-4" /></div>
                                }
                            </button>

                            <div className="relative my-6 flex items-center justify-center">
                                <div className="border-t border-border w-full"></div>
                                <span className="bg-white px-4 text-[11px] uppercase tracking-widest font-bold text-text-muted shrink-0">atau</span>
                                <div className="border-t border-border w-full"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full py-4 bg-surface border border-border text-text-primary uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex justify-center items-center gap-3 shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                Daftar dengan Google
                            </button>
                        </form>

                        <p className="mt-6 text-center text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-primary hover:text-text-primary transition-colors ml-1">
                                Masuk
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;