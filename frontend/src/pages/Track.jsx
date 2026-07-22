import React, { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, Box, ShieldCheck, History } from 'lucide-react';
import {AnimatePresence } from 'framer-motion';

const Track = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const res = await axios.get(`/orders/track/${orderNumber}`);
            setOrder(res.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Nomor pesanan tidak ditemukan. Pastikan format penulisan sudah benar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-bg min-h-screen text-white pb-24">
            
            {/* HERO SECTION TRACKING */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full -z-10"></div>
                <div className="container mx-auto px-4 md:px-12 relative z-10 text-center animate-fade-in">
                    <span className="text-primary uppercase tracking-[0.4em] text-[10px] font-bold mb-6 block">Pantau Pesanan</span>
                    <h1 className="text-5xl md:text-8xl font-display font-bold mb-8 leading-tight">Lacak Pesanan</h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed font-light">
                        Pantau setiap tahapan pengerjaan busana Anda secara real-time melalui sistem pelacakan pesanan Era Jahit.
                    </p>
                </div>
            </section>

            <div className="container mx-auto max-w-4xl px-4">
                
                {/* Search Form */}
                <form onSubmit={handleTrack} className="relative max-w-2xl mx-auto mb-32 animate-fade-in">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Masukkan nomor pesanan (contoh: EJ-001)"
                            className="w-full bg-dark-mid border border-white/5 py-6 pl-16 pr-40 rounded-sm focus:outline-none focus:border-primary transition-all font-light text-white placeholder:text-white/10 text-sm tracking-widest"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            required
                        />
                        <button
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-darkest px-8 py-3.5 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-primary-dark transition-all flex items-center gap-3 shadow-2xl shadow-primary/20 disabled:opacity-30"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4"/> Cari Pesanan</>}
                        </button>
                    </div>
                </form>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/5 text-red-400 p-8 border border-red-500/20 flex items-center justify-center gap-4 font-light max-w-2xl mx-auto rounded-sm"
                        >
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest font-bold">{error}</span>
                        </motion.div>
                    )}

                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-dark-mid border border-white/5 p-8 md:p-16 rounded-md shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Box className="w-32 h-32" />
                            </div>

                            {/* Header Order */}
                            <div className="flex flex-col md:flex-row justify-between gap-10 mb-16 relative z-10 border-b border-white/5 pb-16">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                                            {order.status === 'pending' ? 'Menunggu Konfirmasi' :
                                             order.status === 'confirmed' ? 'Dikonfirmasi' :
                                             order.status === 'pola_pemotongan' ? 'Pola & Pemotongan' :
                                             order.status === 'pola_penjahitan' ? 'Pola Penjahitan' :
                                             order.status === 'proses_menjahit' ? 'Proses Menjahit' :
                                             order.status === 'finishing' ? 'Finishing' :
                                             order.status === 'selesai_penyerahan' ? 'Selesai & Penyerahan' :
                                             order.status === 'rejected' ? 'Ditolak' :
                                             order.status?.replace('_', ' ')}
                                        </span>
                                        <span className="text-white/20 font-bold text-[10px] uppercase tracking-widest">Ref: #{order.order_number}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-display text-white mb-6 leading-tight">{order.fashion_model?.name || 'Busana Kustom'}</h2>
                                    <div className="flex items-center gap-4 text-white/40 text-xs font-light tracking-wide">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>Studio Era Jahit, Padang</span>
                                    </div>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-3">Target Selesai</p>
                                    <p className="text-3xl font-display text-primary">{order.estimated_finish_at ? new Date(order.estimated_finish_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Menunggu Konfirmasi'}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-20">
                                <div className="flex justify-between items-end mb-8">
                                    <p className="font-bold text-white/20 uppercase tracking-widest text-[10px]">Progres Pengerjaan</p>
                                    <p className="text-6xl font-display text-white leading-none">
                                        {(() => {
                                            if (order.status === 'pending' || order.status === 'dp_uploaded' || order.status === 'rejected') return 0;
                                            if (order.status === 'selesai_penyerahan') return 100;
                                            
                                            const STAGES_ORDER = ['confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing', 'selesai_penyerahan'];
                                            const currentIdx = STAGES_ORDER.indexOf(order.status);
                                            if (currentIdx === -1) return 0;
                                            return Math.min(100, Math.round(((currentIdx + 1) / STAGES_ORDER.length) * 100));
                                        })()}
                                        <span className="text-primary text-2xl ml-1">%</span>
                                    </p>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(() => {
                                            if (order.status === 'pending' || order.status === 'dp_uploaded' || order.status === 'rejected') return 0;
                                            if (order.status === 'selesai_penyerahan') return 100;
                                            
                                            const STAGES_ORDER = ['confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing', 'selesai_penyerahan'];
                                            const currentIdx = STAGES_ORDER.indexOf(order.status);
                                            if (currentIdx === -1) return 0;
                                            return Math.min(100, Math.round(((currentIdx + 1) / STAGES_ORDER.length) * 100));
                                        })()}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-primary shadow-[0_0_20px_rgba(200,151,63,0.5)]"
                                    />
                                </div>
                            </div>

                            {/* Timeline & Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Timeline */}
                                <div className="space-y-10">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-primary flex items-center gap-3">
                                        <History className="w-4 h-4" /> Riwayat Tahapan
                                    </h3>
                                    <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                                        
                                        {[
                                            { key: 'confirmed', label: 'Dikonfirmasi', desc: 'Pesanan telah dikonfirmasi dan disetujui oleh admin.' },
                                            { key: 'pola_pemotongan', label: 'Pola & Pemotongan', desc: 'Proses pembuatan pola dan pemotongan bahan kain.' },
                                            { key: 'pola_penjahitan', label: 'Pola Penjahitan', desc: 'Tahap perancangan pola jahitan detail.' },
                                            { key: 'proses_menjahit', label: 'Proses Menjahit', desc: 'Pekerjaan menjahit kain sedang dilakukan.' },
                                            { key: 'finishing', label: 'Finishing', desc: 'Tahap penyelesaian akhir dan quality check.' },
                                            { key: 'selesai_penyerahan', label: 'Selesai & Penyerahan', desc: 'Busana selesai dan siap diserahkan kepada pelanggan.' }
                                        ].map((stage, idx) => {
                                            const STAGES_ORDER = ['confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing', 'selesai_penyerahan'];
                                            const currentIdx = STAGES_ORDER.indexOf(order.status);
                                            const stageIdx = STAGES_ORDER.indexOf(stage.key);
                                            const isDone = currentIdx >= stageIdx && order.status !== 'rejected';
                                            const log = (order.progress_logs || []).find(l => {
                                                const logStage = (l.stage || '').toLowerCase();
                                                if (stage.key === 'confirmed' && logStage.includes('konfirm')) return true;
                                                if (stage.key === 'pola_pemotongan' && (logStage.includes('pemotongan') || logStage.includes('potong'))) return true;
                                                if (stage.key === 'pola_penjahitan' && logStage.includes('penjahitan')) return true;
                                                if (stage.key === 'proses_menjahit' && logStage.includes('menjahit')) return true;
                                                if (stage.key === 'finishing' && logStage.includes('finishing')) return true;
                                                if (stage.key === 'selesai_penyerahan' && logStage.includes('penyerahan')) return true;
                                                return false;
                                            });
                                            const displayDesc = log && log.description ? log.description : stage.desc;

                                            return (
                                                <div key={idx} className={`relative pl-12 group ${!isDone ? 'opacity-30 grayscale' : ''}`}>
                                                    <div className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-darkest border ${isDone ? 'border-primary shadow-[0_0_10px_rgba(200,151,63,0.3)]' : 'border-white/10'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                        {isDone && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                                    </div>
                                                    <p className="font-bold text-white text-sm tracking-wide">{stage.label}</p>
                                                    <p className="text-xs text-white/40 mt-2 font-light leading-relaxed">{displayDesc}</p>
                                                    {log && log.notified_at && (
                                                        <span className="text-[9px] text-primary mt-2 block font-bold tracking-widest uppercase">
                                                            Diupdate pada: {new Date(log.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-darkest/40 p-10 space-y-10 rounded-sm border border-white/5 self-start">
                                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-primary border-b border-white/5 pb-4">Ringkasan Pembayaran</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
                                            <span className="text-white/20">Total Biaya</span>
                                            <span className="text-white">{order.total_price && Number(order.total_price) > 0 ? `Rp ${order.total_price.toLocaleString('id-ID')}` : 'Belum ada'}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
                                            <span className="text-white/20">DP Terbayar</span>
                                            <span className="text-primary">Rp {order.dp_paid?.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="pt-10 border-t border-white/5 mt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="font-display text-white/40 text-lg uppercase tracking-widest">Sisa Bayar</span>
                                                <span className="font-display text-3xl text-white">Rp {order.balance_remaining?.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm italic">
                                                <p className="text-[9px] text-primary/60 uppercase tracking-widest leading-relaxed">* Pelunasan dilakukan saat pengambilan busana di studio.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Track;
