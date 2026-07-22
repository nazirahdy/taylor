import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Save, User, Search, ArrowLeft } from 'lucide-react';

const ManageProfile = () => {
    const { user, updateUserState } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone_wa, setPhone_wa] = useState('');
    const [alamat, setAlamat] = useState('');
    
    const [msgMode, setMsgMode] = useState('');
    const [msgText, setMsgText] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone_wa(user.phone_wa || '');
            setAlamat(user.alamat || '');
        }
    }, [user]);

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

    const inputClass = "w-full bg-white border border-border px-6 py-4 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-body text-text-primary placeholder:text-text-muted/50";
    const labelClass = "block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 font-sans";

    return (
        <div className="min-h-screen bg-white text-text-primary py-32">
            <div className="container mx-auto px-4 max-w-3xl">
                
                <div className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-8 font-sans">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Akun Saya</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">Kelola Profil</h1>
                    <p className="text-text-secondary font-body">Perbarui data pribadi dan informasi kontak Anda agar kami dapat memberikan layanan terbaik.</p>
                </div>

                <div className="bg-surface border border-border p-8 md:p-12 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                        <User className="w-6 h-6 text-primary" />
                        <h2 className="text-lg font-bold text-text-primary font-display">Data Pribadi</h2>
                    </div>

                    {msgMode.startsWith('profile-') && (
                        <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm ${msgMode.endsWith('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {msgMode.endsWith('success') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-body font-medium">{msgText}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div>
                            <label className={labelClass}>Nama Lengkap</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Alamat Email (Tidak bisa diubah)</label>
                            <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-50 opacity-70 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className={labelClass}>Nomor WhatsApp</label>
                            <input type="tel" value={phone_wa} onChange={(e) => setPhone_wa(e.target.value)} placeholder="0812xxx" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Alamat Lengkap</label>
                            <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="4" className={`${inputClass} resize-none`} />
                        </div>
                        
                        <div className="pt-6 border-t border-border mt-8">
                            <button type="submit" disabled={isLoadingProfile} className="w-full py-5 bg-primary text-white font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all flex justify-center items-center gap-3 rounded-2xl shadow-xl shadow-primary/20 font-sans">
                                {isLoadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4"/> Simpan Perubahan Profil</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageProfile;
