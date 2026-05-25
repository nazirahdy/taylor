import React from 'react';
import { Calendar, CreditCard, Layers, Ruler, Clock } from 'lucide-react';

const OrderInfo = ({ order }) => {
    if (!order) return null;

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-surface text-text-muted border-border',
            'dp_uploaded': 'bg-primary/5 text-primary border-primary/20',
            'confirmed': 'bg-primary text-white border-primary/20',
            'in_progress': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
            'completed': 'bg-green-500/10 text-green-600 border-green-500/20',
            'rejected': 'bg-red-500/10 text-red-600 border-red-500/20',
        };
        return colors[status] || 'bg-surface text-text-muted border-border';
    };

    return (
        <div className="bg-surface rounded-[2.5rem] p-10 md:p-14 border border-border shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-0"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 relative z-10">
                <div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary mb-3">Nomor Pesanan EJ-{order.id}</h2>
                    <div className="flex items-center gap-3 text-text-muted text-[11px] font-bold uppercase tracking-widest font-sans">
                        <Calendar className="w-4 h-4" />
                        Dimulai pada {new Date(order.created_at || order.order_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] border font-sans shadow-sm ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' ? 'Menunggu' : 
                     order.status === 'dp_uploaded' ? 'Validasi DP' : 
                     order.status === 'confirmed' ? 'Dikonfirmasi' : 
                     order.status === 'in_progress' ? 'Pengerjaan' : 
                     order.status === 'completed' ? 'Selesai' : 
                     order.status === 'rejected' ? 'Ditolak' : order.status}
                </div>
            </div>

            {order.method === 'home_service' && order.status === 'pending' && (
                <div className="mb-12 relative z-10">
                    {(!order.estimated_price || Number(order.estimated_price) <= 0) ? (
                        <div className="p-8 bg-surface border border-border rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-text-primary font-display font-bold text-lg mb-1">Menunggu Peninjauan Estimasi Harga & DP</h4>
                                    <p className="text-text-secondary text-sm font-body">Penjahit kami sedang mempelajari desain dan lokasi Anda untuk menghitung estimasi biaya dan nominal DP.</p>
                                </div>
                            </div>
                            <span className="px-5 py-2.5 bg-amber-500/10 text-amber-700 rounded-xl font-bold uppercase tracking-widest text-[10px] font-sans border border-amber-500/20 shrink-0">Menunggu Tinjauan</span>
                        </div>
                    ) : !order.dp_proof_path ? (
                        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-text-primary font-display font-bold text-lg mb-1">Estimasi Harga & DP Telah Ditentukan!</h4>
                                    <p className="text-text-secondary text-sm font-body">
                                        Total Estimasi: <strong className="text-text-primary">Rp {Number(order.estimated_price).toLocaleString('id-ID')}</strong>. 
                                        Diperlukan DP sebesar: <strong className="text-primary text-lg">Rp {Number(order.dp_amount).toLocaleString('id-ID')}</strong>.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = `/pesanan/${order.id}/upload-dp`}
                                className="px-8 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 font-sans shrink-0 flex items-center gap-2"
                            >
                                Bayar & Unggah Bukti DP
                            </button>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans"><Layers className="w-4 h-4"/> Metode Layanan</span>
                    <p className="text-text-primary font-bold font-sans">{order.method === 'home_service' ? 'Home Service' : 'In-Store'}</p>
                </div>
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans"><CreditCard className="w-4 h-4"/> Status Pembayaran</span>
                    <p className="text-text-primary font-bold font-sans">{order.status === 'confirmed' || order.status === 'in_progress' || order.status === 'completed' ? 'DP Terbayar' : 'Menunggu DP'}</p>
                </div>
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans">Total Biaya</span>
                    <p className="text-primary font-bold text-2xl font-display">Rp {order.estimated_price ? Number(order.estimated_price).toLocaleString('id-ID') : 'Menghitung...'}</p>
                </div>
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans">Target Selesai</span>
                    <p className="text-text-primary font-bold font-sans">
                        {order.quota_date 
                            ? new Date(order.quota_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                            : 'Menjadwalkan...'}
                    </p>
                </div>
            </div>

            <div className="mt-16 pt-16 border-t border-border relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <Ruler className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.3em] font-sans">Spesifikasi Ukuran & Detail Teknis</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5 mb-10">
                    {order.measurements ? Object.entries(order.measurements).map(([key, val]) => (
                        val && !['id', 'user_id', 'created_at', 'updated_at', 'notes'].includes(key) ? (
                            <div key={key} className="bg-white p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all group">
                                <span className="text-[9px] text-text-muted uppercase font-bold block mb-2 truncate font-sans group-hover:text-primary">{key.replace('_', ' ')}</span>
                                <span className="text-lg font-bold text-text-primary font-display">{val}<span className="text-[10px] ml-1 text-text-muted font-sans font-bold">CM</span></span>
                            </div>
                        ) : null
                    )) : (
                        <div className="col-span-full py-8 text-text-muted text-sm italic font-body">
                            Belum ada data ukuran untuk pesanan ini.
                        </div>
                    )}
                </div>
                
                {order.design_notes && (
                    <div className="bg-white p-8 rounded-[1.5rem] border border-border text-sm text-text-secondary font-body leading-relaxed italic shadow-sm relative">
                        <span className="absolute -top-3 left-6 bg-white px-3 text-[10px] text-primary font-bold uppercase tracking-widest font-sans">Catatan Desain</span>
                        "{order.design_notes}"
                    </div>
                )}

                {order.financial_breakdown && order.financial_breakdown.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-border relative z-10 animate-fade-in">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.3em] font-sans">Rincian Estimasi Keuangan</h4>
                        </div>
                        
                        <div className="bg-white border border-border rounded-[2rem] p-8 md:p-10 shadow-sm max-w-3xl">
                            <div className="space-y-4 mb-8">
                                {order.financial_breakdown.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-body border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                                        <span className="text-text-secondary">{item.name}</span>
                                        <span className="text-text-primary font-bold font-sans">Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/30 p-6 rounded-2xl">
                                <div>
                                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest font-sans block mb-1">Total Estimasi Harga</span>
                                    <span className="text-2xl font-bold text-text-primary font-display">Rp {Number(order.estimated_price).toLocaleString('id-ID')}</span>
                                </div>
                                {order.dp_amount > 0 && (
                                    <div className="sm:text-right">
                                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest font-sans block mb-1">Komitmen DP (30%)</span>
                                        <span className="text-2xl font-bold text-primary font-display">Rp {Number(order.dp_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderInfo;

