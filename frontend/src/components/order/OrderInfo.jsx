import React from 'react';
import { Calendar, CreditCard, Layers, Ruler, Clock } from 'lucide-react';
import { STORAGE_URL } from '../../config';

const OrderInfo = ({ order }) => {
    if (!order) return null;

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-surface text-text-muted border-border',
            'dp_uploaded': 'bg-primary/5 text-primary border-primary/20',
            'confirmed': 'bg-primary text-white border-primary/20',
            'pola_pemotongan': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            'pola_penjahitan': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
            'proses_menjahit': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
            'finishing': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            'selesai_penyerahan': 'bg-green-500/10 text-green-600 border-green-500/20',
            'rejected': 'bg-red-500/10 text-red-600 border-red-500/20',
        };
        return colors[status] || 'bg-surface text-text-muted border-border';
    };

    return (
        <div className="bg-surface rounded-[1.75rem] p-6 md:p-8 border border-border shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-0"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-display font-bold text-text-primary mb-3">Nomor Pesanan EJ-{order.id}</h2>
                    <div className="flex items-center gap-3 text-text-muted text-[11px] font-bold uppercase tracking-widest font-sans">
                        <Calendar className="w-4 h-4" />
                        Dimulai pada {new Date(order.created_at || order.order_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] border font-sans shadow-sm ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' ? 'Menunggu Konfirmasi' : 
                     order.status === 'dp_uploaded' ? 'Validasi DP' : 
                     order.status === 'confirmed' ? 'Dikonfirmasi' : 
                     order.status === 'pola_pemotongan' ? 'Pola dan Pemotongan' : 
                     order.status === 'pola_penjahitan' ? 'Pola Penjahitan' : 
                     order.status === 'proses_menjahit' ? 'Proses Menjahit' : 
                     order.status === 'finishing' ? 'Finishing' : 
                     order.status === 'selesai_penyerahan' ? 'Selesai & Penyerahan' : 
                     order.status === 'rejected' ? 'Ditolak' : order.status}
                </div>
            </div>

            {order.method === 'home_service' && order.status === 'pending' && (
                <div className="mb-7 relative z-10">
                    {(!order.estimated_price || Number(order.estimated_price) <= 0) ? (
                        <div className="p-8 bg-surface border border-border rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
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
                        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[1.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative z-10">
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans"><Layers className="w-4 h-4"/> Metode Layanan</span>
                    <p className="text-text-primary font-bold font-sans">{order.method === 'home_service' ? 'Home Service' : 'In-Store'}</p>
                </div>
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans"><CreditCard className="w-4 h-4"/> Status Pembayaran</span>
                    <p className="text-text-primary font-bold font-sans">{order.status === 'confirmed' || ['pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing', 'selesai_penyerahan'].includes(order.status) ? 'DP Terbayar' : 'Menunggu DP'}</p>
                </div>
                <div className="space-y-3">
                    <span className="flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-widest font-sans">Total Biaya</span>
                    <p className="text-primary font-bold text-2xl font-display">{order.estimated_price && Number(order.estimated_price) > 0 ? `Rp ${Number(order.estimated_price).toLocaleString('id-ID')}` : 'Belum ada'}</p>
                </div>
            </div>

            <div className="mt-8 pt-16 border-t border-border relative z-10">
                {order.design_image_path ? (
                    <div className="bg-white p-8 rounded-[1.5rem] border border-border shadow-sm flex flex-col items-center gap-6 max-w-xl mx-auto">
                        <span className="text-[11px] font-bold text-text-primary uppercase tracking-[0.3em] font-sans">Foto Referensi Desain</span>
                        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-md hover:shadow-lg transition-all duration-300">
                            <img 
                                src={order.design_image_path.includes('http') 
                                    ? order.design_image_path.replace('http://localhost/storage', STORAGE_URL) 
                                    : `${STORAGE_URL}/${order.design_image_path}`} 
                                alt="Referensi Desain" 
                                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-[1.5rem] border border-border shadow-sm text-center text-text-muted italic text-sm font-body max-w-xl mx-auto">
                        Belum ada foto referensi desain untuk pesanan ini.
                    </div>
                )}

                {order.financial_breakdown && order.financial_breakdown.length > 0 && (
                    <div className="mt-8 pt-16 border-t border-border relative z-10 animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-[0.3em] font-sans">Rincian Estimasi Keuangan</h4>
                        </div>
                        
                        <div className="bg-white border border-border rounded-[1.5rem] p-8 md:p-6 shadow-sm max-w-3xl">
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

