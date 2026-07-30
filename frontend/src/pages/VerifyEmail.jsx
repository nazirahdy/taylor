import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('pending'); // pending, success, error
    const [message, setMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const id = searchParams.get('id');
    const hash = searchParams.get('hash');

    useEffect(() => {
        if (id && hash) {
            verifyToken(id, hash);
        }
    }, [id, hash]);

    const verifyToken = async (userId, tokenHash) => {
        setStatus('pending');
        try {
            const response = await axios.get(`/email/verify/${userId}/${tokenHash}`);
            setStatus('success');
            setMessage(response.data?.message || 'Email berhasil diverifikasi!');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Tautan verifikasi tidak valid atau telah kadaluwarsa.');
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMessage('');
        try {
            const res = await axios.post('/email/resend');
            setResendMessage(res.data?.message || 'Email verifikasi baru berhasil dikirim.');
        } catch (err) {
            setResendMessage(err.response?.data?.message || 'Gagal mengirim email verifikasi. Pastikan Anda sudah masuk.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-border max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-400 to-primary"></div>

                {id && hash ? (
                    // Token verification mode
                    status === 'pending' ? (
                        <div>
                            <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto mb-6" />
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Memverifikasi Email...</h2>
                            <p className="text-sm text-text-secondary">Sedang memeriksa keabsahan tautan verifikasi Anda.</p>
                        </div>
                    ) : status === 'success' ? (
                        <div>
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Email Terverifikasi!</h2>
                            <p className="text-sm text-text-secondary mb-8">{message}</p>
                            <Link
                                to="/"
                                className="block w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-105 transition-all text-sm uppercase tracking-wider"
                            >
                                Masuk ke Beranda
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Verifikasi Gagal</h2>
                            <p className="text-sm text-text-secondary mb-8">{message}</p>
                            <Link
                                to="/login"
                                className="block w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-105 transition-all text-sm uppercase tracking-wider mb-3"
                            >
                                Halaman Login
                            </Link>
                        </div>
                    )
                ) : (
                    // Status view mode (Notice to check email)
                    <div>
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Cek Email Anda</h2>
                        <p className="text-sm text-text-secondary leading-relaxed mb-6">
                            Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan klik tautan tersebut untuk mengaktifkan akun secara penuh.
                        </p>

                        {user?.email_verified_at && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                                ✓ Email Anda ({user.email}) sudah terverifikasi!
                            </div>
                        )}

                        {resendMessage && (
                            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-semibold">
                                {resendMessage}
                            </div>
                        )}

                        {!user?.email_verified_at && user && (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-105 transition-all text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2"
                            >
                                {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Ulang Email Verifikasi'}
                            </button>
                        )}

                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary uppercase tracking-widest transition-colors mt-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
