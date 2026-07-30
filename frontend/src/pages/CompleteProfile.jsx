import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Info } from 'lucide-react';

const CompleteProfile = () => {
    const { user, updateUserState } = useAuth();
    const navigate = useNavigate();

    const [phone_wa, setPhone_wa] = useState(user?.phone_wa || '');
    const [alamat, setAlamat] = useState(user?.alamat || '');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Kalo user secara tak sengaja kembali ke halaman ini padahal profil sdh lengkap
    if (user && user.phone_wa && user.alamat) {
        navigate('/dashboard');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!phone_wa || !alamat) {
            setError('Nomor WhatsApp dan Alamat wajib diisi.');
            return;
        }

        const cleanNoWA = phone_wa.replace(/\D/g, ''); 
        if (cleanNoWA.length < 10) {
            setError('Format nomor WhatsApp tidak valid. Masukkan minimal 10 angka');
            return;
        }

        setIsLoading(true);

        try {
            await axios.put('/profile', { 
                phone_wa: cleanNoWA, 
                alamat 
            });
            
            // Update Context State
            updateUserState({ phone_wa: cleanNoWA, alamat });
            
            // Redirect ke dashboard
            navigate('/dashboard');
            
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Gagal melengkapi profil. Pastikan koneksi dan format benar');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-surface flex justify-center items-center">
            <div className="w-full max-w-lg px-4">
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <h2 className="text-2xl font-black font-display text-gray-900 mb-2">Selangkah Lagi</h2>
                        <p className="text-gray-500 font-medium">Lengkapi biodata kontak dan pengiriman Anda sebelum melakukan pemesanan pertama</p>
                    </div>

                    <div className="p-8">
                        {/* ALERT KHUSUS INFO WHATSAPP */}
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 text-blue-700 flex items-start gap-3 border border-blue-100">
                            <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                            <span className="text-sm font-medium leading-relaxed">
                                <b>Sistem Notifikasi:</b> Berikan Nomor WhatsApp aktif karena seluruh notifikasi tahapan status pesanan jahitan Anda akan dikirim ke nomor tersebut
                            </span>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 border border-red-100">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Panggilan Anda</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={user?.name || ''}
                                    disabled
                                />
                                <span className="text-xs text-gray-400 mt-1 block">Ini diambil dari data pendaftaran Anda</span>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor WhatsApp <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 border-r pr-3 border-gray-200">+62</span>
                                    <input 
                                        type="tel" 
                                        className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white"
                                        placeholder="81234567890"
                                        value={phone_wa.startsWith('62') || phone_wa.startsWith('0') ? phone_wa : phone_wa} // Simplifikasi handling visual
                                        onChange={(e) => setPhone_wa(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Pengiriman/Kunjungan <span className="text-red-500">*</span></label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 focus:bg-white resize-y"
                                    placeholder="Jl. Raya Utama No.1 RT 02/03, Kel. Suka Jaya, Kec. Raya..."
                                    rows="4"
                                    value={alamat}
                                    onChange={(e) => setAlamat(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full py-4 mt-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all flex justify-center items-center shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Profil & Lanjutkan"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
