import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2, UserPlus, Fingerprint, ShieldCheck } from 'lucide-react';

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
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Initialization failed. Please retry the protocol.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-primary bg-white">
            
            {/* Left Column (Branding) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center overflow-hidden border-r border-border">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616486341351-7025244f6714?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                <div className="relative z-10 max-w-lg px-10 text-center">
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-6 block">Bergabung Bersama Kami</span>
                    <h1 className="text-7xl font-display font-bold mb-10 tracking-tight text-text-primary">ERA<span className="text-primary">.</span>JAHIT</h1>
                    <div className="space-y-8 text-left">
                        {[
                            "Konsultasi desain busana custom.",
                            "Pantau progres jahitan secara real-time.",
                            "Komunikasi langsung dengan penjahit ahli.",
                            "Kurasi bahan & aksesoris kualitas premium."
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-6 text-sm font-body text-text-secondary group">
                                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span className="group-hover:text-text-primary transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white relative overflow-y-auto custom-scrollbar">
                <Link to="/login" className="absolute top-12 left-12 flex items-center gap-2 text-text-muted hover:text-primary transition-all font-sans text-[11px] uppercase tracking-widest font-bold group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Kembali ke Login
                </Link>
                
                <div className="w-full max-w-md py-20 animate-fade-in">
                    <div className="mb-12">
                        <h2 className="text-4xl font-display font-bold mb-4 text-text-primary">Buat Akun</h2>
                        <p className="text-text-secondary text-sm font-body">Masukkan detail Anda untuk memulai pengalaman menjahit premium.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-6 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-4 text-xs font-body">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1">
                                <Fingerprint className="w-3 h-3" /> Nama Lengkap
                            </label>
                            <input 
                                type="text" name="name" required
                                className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                placeholder="Nama Anda"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Alamat Email</label>
                                <input 
                                    type="email" name="email" required
                                    className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                    placeholder="nama@email.com"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Nomor WhatsApp</label>
                                <input 
                                    type="tel" name="phone_wa" required
                                    className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                    placeholder="0812..."
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Alamat Lengkap</label>
                            <textarea 
                                name="alamat" required
                                className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                placeholder="Alamat lengkap Anda..."
                                rows="3"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Kata Sandi</label>
                            <input 
                                type="password" name="password" required
                                className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                placeholder="Min. 8 Karakter"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold ml-1 block">Konfirmasi Kata Sandi</label>
                            <input 
                                type="password" name="password_confirmation" required
                                className="w-full px-6 py-5 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/50 font-body"
                                placeholder="Ulangi Kata Sandi"
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-5 mt-4 bg-primary text-white uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex justify-center items-center disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="flex items-center gap-3">Daftar Sekarang <ShieldCheck className="w-4 h-4"/></div>}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold">
                        Sudah punya akun? <Link to="/login" className="text-primary hover:text-text-primary transition-colors ml-1">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

