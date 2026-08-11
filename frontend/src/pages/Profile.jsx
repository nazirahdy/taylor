import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Save, KeyRound, User, Ruler, LogOut, Search, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user, updateUserState, logout } = useAuth();
    const navigate = useNavigate();

    // State Profil Utama
    const [name, setName] = useState('');
    const [phone_wa, setPhone_wa] = useState('');
    const [alamat, setAlamat] = useState('');
    
    // State Ukuran Badan
    const [measurements, setMeasurements] = useState({
        lingkar_badan: '',
        lingkar_pinggang: '',
        lingkar_pinggul: '',
        lingkar_pangkal_lengan: '',
        panjang_tangan: '',
        panjang_baju: '',
        panjang_rok: '',
        lebar_dada: '',
        lebar_punggung: '',
        lebar_bahu: '',
        tinggi_badan: '',
        notes: ''
    });

    // State Ganti Password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // State Notifikasi
    const [msgMode, setMsgMode] = useState('');
    const [msgText, setMsgText] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPw, setIsLoadingPw] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone_wa(user.phone_wa || '');
            setAlamat(user.alamat || '');
            fetchMeasurements();
        }
    }, [user]);

    const fetchMeasurements = async () => {
        try {
            const res = await axios.get('/measurements');
            if (res.data) {
                const data = res.data.data || res.data;
                setMeasurements({
                    ...data,
                    panjang_tangan: data.panjang_tangan ?? data.panjang_lengan ?? ''
                });
            }
        } catch (err) {
            console.error("Gagal memuat ukuran:", err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMsgMode('');
        setIsLoadingProfile(true);
        try {
            const cleanNoWA = phone_wa.replace(/\D/g, '');
            await axios.put('/profile', { name, phone_wa: cleanNoWA, alamat });
            updateUserState({ name, phone_wa: cleanNoWA, alamat });
            setMsgMode('profile-success');
            setMsgText('Profil berhasil diubah.');
        } catch (err) {
            setMsgMode('profile-error');
            setMsgText(err.response?.data?.message || 'Gagal mengubah profil.');
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMsgMode('pw-error');
            setMsgText('Konfirmasi password tidak cocok.');
            return;
        }
        setIsLoadingPw(true);
        try {
            await axios.put('/profile/password', {
                old_password: oldPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setMsgMode('pw-success');
            setMsgText('Password berhasil diperbarui.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMsgMode('pw-error');
            setMsgText(err.response?.data?.message || 'Gagal mengubah password.');
        } finally {
            setIsLoadingPw(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const inputClass = "w-full bg-white border border-border px-6 py-4 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-body text-text-primary placeholder:text-text-muted/50";
    const labelClass = "block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 font-sans";

    return (
        <div className="min-h-screen bg-white text-text-primary pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-5 text-center md:text-left">
                    <div>
                        <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Akun Saya</span>
                        <h1 className="text-3xl md:text-2xl font-display font-bold text-text-primary mb-4">Profil & Data Ukuran</h1>
                        <p className="text-text-secondary font-body max-w-2xl mx-auto md:mx-0">Kelola data pribadi, ukuran badan, dan keamanan akun Anda</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link 
                            to="/dashboard"
                            className="px-8 py-4 bg-surface border border-border text-text-primary text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:shadow-lg transition-all flex items-center gap-3 font-sans"
                        >
                            <Search className="w-4 h-4" /> Dashboard
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="px-8 py-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-3 font-sans shadow-lg shadow-red-100"
                        >
                            <LogOut className="w-4 h-4" /> Keluar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* PERSONAL INFORMATION */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-surface border border-border p-6 rounded-[1.5rem] shadow-sm">
                            <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                                <User className="w-5 h-5 text-primary" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary font-sans">Data Pribadi</h2>
                            </div>

                            {msgMode.startsWith('profile-') && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-xs ${msgMode.endsWith('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {msgMode.endsWith('success') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span className="font-body">{msgText}</span>
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div>
                                    <label className={labelClass}>Nama Lengkap</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Alamat Email</label>
                                    <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-surface opacity-50 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Nomor WhatsApp</label>
                                    <input type="tel" value={phone_wa} onChange={(e) => setPhone_wa(e.target.value)} placeholder="812xxx" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Alamat Lengkap</label>
                                    <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" className={`${inputClass} resize-none`} />
                                    <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                                     Alamat ini disimpan sebagai data profil Anda. Saat melakukan pemesanan Home Service, Anda akan diminta mengisi ulang alamat kunjungan secara terpisah
                                    </p>
                                </div>
                                <button type="submit" disabled={isLoadingProfile} className="w-full py-5 bg-primary text-white font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all flex justify-center items-center gap-2 rounded-xl shadow-xl shadow-primary/20 font-sans">
                                    {isLoadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4"/> Simpan Profil</>}
                                </button>
                            </form>
                        </div>

                        {/* SECURITY */}
                        <div className="bg-surface border border-border p-6 rounded-[1.5rem] shadow-sm">
                            <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                                <KeyRound className="w-5 h-5 text-primary" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary font-sans">Keamanan Akun</h2>
                            </div>
                            
                            {msgMode.startsWith('pw-') && (
                                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-xs ${msgMode.endsWith('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <span className="font-body">{msgText}</span>
                                </div>
                            )}

                            <form onSubmit={handleSavePassword} className="space-y-6">
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Kata Sandi Saat Ini" className={inputClass} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Kata Sandi Baru" className={inputClass} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Kata Sandi Baru" className={inputClass} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <button type="submit" disabled={isLoadingPw} className="w-full py-5 border border-border text-text-primary font-bold uppercase tracking-widest text-[11px] hover:bg-white hover:shadow-md transition-all rounded-xl font-sans">
                                    {isLoadingPw ? <Loader2 className="w-5 h-5 animate-spin" /> : "Perbarui Kata Sandi"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* MEASUREMENTS (FR-04) */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface border border-border p-6 md:p-8 rounded-[1.75rem] shadow-sm h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-7 border-b border-border pb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                            <Ruler className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-bold text-text-primary">Ukuran Badan</h2>
                                            <p className="text-[11px] text-text-muted uppercase tracking-[0.2em] font-bold font-sans">Satuan Centimeter (CM)</p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <span className="text-[11px] text-text-muted uppercase tracking-widest font-sans font-bold">Dikelola oleh Admin</span>
                                    </div>
                                </div>

                                <div className="mt-4 mb-8 p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800 leading-relaxed font-body">
                                        <strong className="block mb-1">Informasi Ukuran Badan:</strong>
                                        Seluruh data ukuran badan Anda dikelola secara eksklusif oleh pihak Admin/Penjahit Era Jahit untuk menjamin presisi pakaian. Pelanggan tidak dapat mengubah data ini secara mandiri.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: 'lingkar_badan', label: 'Lingkar Badan' },
                                        { id: 'lingkar_pinggang', label: 'Lingkar Pinggang' },
                                        { id: 'lingkar_pinggul', label: 'Lingkar Pinggul' },
                                        { id: 'lingkar_pangkal_lengan', label: 'Lingkar Pangkal Lengan' },
                                        { id: 'panjang_tangan', label: 'Panjang Tangan' },
                                        { id: 'panjang_baju', label: 'Panjang Baju' },
                                        { id: 'panjang_rok', label: 'Panjang Rok' },
                                        { id: 'lebar_dada', label: 'Lebar Dada' },
                                        { id: 'lebar_punggung', label: 'Lebar Punggung' },
                                        { id: 'lebar_bahu', label: 'Lebar Bahu' },
                                        { id: 'tinggi_badan', label: 'Tinggi Badan' },
                                    ].map((field) => {
                                        const value = measurements[field.id];
                                        const hasVal = value !== undefined && value !== null && value !== '' && !isNaN(parseFloat(value));
                                        return (
                                            <div key={field.id} className="p-6 bg-white border border-border/80 rounded-2xl hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center justify-between group">
                                                <div>
                                                    <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 font-sans">{field.label}</span>
                                                    <span className={`text-xl font-display font-bold ${hasVal ? 'text-text-primary' : 'text-text-muted/60 italic text-sm'}`}>
                                                        {hasVal ? `${parseFloat(value)} cm` : 'Belum diukur'}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 bg-surface border border-border/60 rounded-xl flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                    <Ruler className="w-4 h-4" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;


