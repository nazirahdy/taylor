import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, KeyRound, ArrowLeft } from 'lucide-react';

const ManagePassword = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [msgMode, setMsgMode] = useState('');
    const [msgText, setMsgText] = useState('');
    const [isLoadingPw, setIsLoadingPw] = useState(false);

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMsgMode('pw-error');
            setMsgText('Konfirmasi password tidak cocok.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const inputClass = "w-full bg-white border border-border px-6 py-4 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-body text-text-primary placeholder:text-text-muted/50";
    const labelClass = "block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 font-sans";

    return (
        <div className="min-h-screen bg-white text-text-primary pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                
                <div className="mb-7">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-8 font-sans">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Keamanan</span>
                    <h1 className="text-3xl md:text-2xl font-display font-bold text-text-primary mb-4">Pengaturan Sandi</h1>
                    <p className="text-text-secondary font-body">Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun</p>
                </div>

                <div className="bg-surface border border-border p-8 md:p-12 rounded-[1.75rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                        <KeyRound className="w-6 h-6 text-primary" />
                        <h2 className="text-lg font-bold text-text-primary font-display">Ubah Kata Sandi</h2>
                    </div>
                    
                    {msgMode.startsWith('pw-') && (
                        <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm ${msgMode.endsWith('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {msgMode.endsWith('success') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-body font-medium">{msgText}</span>
                        </div>
                    )}

                    <form onSubmit={handleSavePassword} className="space-y-6">
                        <div>
                            <label className={labelClass}>Kata Sandi Saat Ini</label>
                            <input type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan kata sandi lama" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Kata Sandi Baru</label>
                            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Masukkan kata sandi baru" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Konfirmasi Kata Sandi Baru</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang kata sandi baru" className={inputClass} />
                        </div>
                        
                        <div className="pt-6 border-t border-border mt-8">
                            <button type="submit" disabled={isLoadingPw} className="w-full py-5 bg-primary text-white font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all flex justify-center items-center gap-3 rounded-2xl shadow-xl shadow-primary/20 font-sans">
                                {isLoadingPw ? <Loader2 className="w-5 h-5 animate-spin" /> : "Perbarui Kata Sandi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManagePassword;
