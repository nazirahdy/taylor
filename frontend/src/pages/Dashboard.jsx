import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, CheckCircle2, Package, Eye, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ aktif: 0, selesai: 0, pending: 0 });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/orders');
                const data = res.data?.data || res.data || [];
                setOrders(data);
                
                // Hitung stats
                setStats({
                    aktif: data.filter(o => ['confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing'].includes(o.status)).length,
                    selesai: data.filter(o => o.status === 'selesai_penyerahan').length,
                    pending: data.filter(o => ['pending', 'dp_uploaded'].includes(o.status)).length
                });
            } catch (err) {
                console.error("Gagal memuat pesanan", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    const getStatusBadge = (status) => {
        const badges = {
            'pending': <span className="px-3 py-1 rounded-lg bg-surface text-text-muted text-[10px] font-bold uppercase tracking-widest border border-border">Menunggu Konfirmasi</span>,
            'dp_uploaded': <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Validasi DP</span>,
            'confirmed': <span className="px-3 py-1 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest border border-primary/20">Dikonfirmasi</span>,
            'pola_pemotongan': <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">Pola & Pemotongan</span>,
            'pola_penjahitan': <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-widest border border-orange-500/20">Pola Penjahitan</span>,
            'proses_menjahit': <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-600 text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">Proses Menjahit</span>,
            'finishing': <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Finishing</span>,
            'selesai_penyerahan': <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Selesai & Penyerahan</span>,
            'rejected': <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Ditolak</span>,
            'cancelled': <span className="px-3 py-1 rounded-lg bg-surface text-text-muted/50 text-[10px] font-bold uppercase tracking-widest border border-border">Dibatalkan</span>,
        };
        return badges[status] || badges['pending'];
    };

    return (
        <div className="min-h-screen bg-white text-text-primary py-32">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div className="animate-fade-in">
                        <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Portal Pesanan</span>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-text-primary mb-2">Selamat Datang, {user?.name?.split(' ')[0] || 'Pelanggan'}</h1>
                        <p className="text-text-secondary font-body text-sm">Pantau progres jahitan Anda dan kelola konsultasi desain busana Anda</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 animate-fade-in">
                        <Link to="/profile/edit" className="px-6 py-4 border border-border text-text-primary rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surface transition-all font-sans">
                            Kelola Profil
                        </Link>
                        <Link to="/pesanan/buat" className="px-8 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 font-sans">
                            <Plus className="w-5 h-5" /> Pesanan Baru
                        </Link>
                    </div>
                </div>

                {/* Profile Incomplete Warning */}
                {(!user?.phone_wa || !user?.alamat) && (
                    <div className="mb-12 p-8 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-red-900 font-bold mb-1 uppercase tracking-widest text-xs font-sans">Perlu Tindakan: Profil Belum Lengkap</h4>
                                <p className="text-red-700 text-sm font-body leading-relaxed">Harap lengkapi nomor WhatsApp dan alamat Anda untuk dapat melakukan pemesanan</p>
                            </div>
                        </div>
                        <Link to="/profile/edit" className="px-6 py-3 bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all font-sans shadow-lg shadow-red-200">Lengkapi Profil</Link>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-slide-up">
                    {[
                        { icon: <Clock className="w-6 h-6" />, label: "Pesanan Aktif", value: stats.aktif, color: "text-primary", bg: "bg-primary/10" },
                        { icon: <Package className="w-6 h-6" />, label: "Menunggu Review", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
                        { icon: <CheckCircle2 className="w-6 h-6" />, label: "Selesai", value: stats.selesai, color: "text-green-600", bg: "bg-green-50" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-surface p-10 border border-border rounded-[2rem] hover:shadow-xl transition-all group duration-700">
                            <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-8 border border-border group-hover:scale-110 transition-transform duration-500`}>
                                {stat.icon}
                            </div>
                            <p className="text-text-muted font-bold text-[11px] uppercase tracking-[0.2em] mb-3 font-sans">{stat.label}</p>
                            <h3 className="text-5xl font-display font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden animate-slide-up delay-200 shadow-sm">
                    <div className="p-10 border-b border-border flex justify-between items-center bg-surface/30">
                        <h2 className="text-2xl font-display font-bold text-text-primary">Riwayat Pesanan</h2>
                        <span className="text-[11px] text-text-muted uppercase tracking-widest font-sans font-bold">Total: {orders.length} Data</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="text-[11px] text-text-muted uppercase tracking-widest border-b border-border font-sans bg-surface/10">
                                    <th className="p-8 font-bold">Nomor Pesanan</th>
                                    <th className="p-8 font-bold">Tanggal Sesi</th>
                                    <th className="p-8 font-bold">Tipe Layanan</th>
                                    <th className="p-8 font-bold text-center">Status Saat Ini</th>
                                    <th className="p-8 font-bold text-right">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-body">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-text-muted">
                                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
                                            <span className="text-[11px] uppercase tracking-widest font-sans font-bold">Memuat Data...</span>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-text-muted italic">
                                            Belum ada riwayat pesanan. Mulai pesanan busana Anda di atas
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b border-border hover:bg-surface/50 transition-colors group">
                                            <td className="p-8 font-bold text-text-primary group-hover:text-primary transition-colors font-sans">EJ-{order.order_number || order.id}</td>
                                            <td className="p-8 text-text-secondary">
                                                {order.quota_date ? new Date(order.quota_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="p-8 text-text-secondary uppercase tracking-widest text-[10px] font-bold font-sans">
                                                {order.method === 'home_service' ? 'Home Service' : 'In-Store'}
                                            </td>
                                            <td className="p-8 text-center">{getStatusBadge(order.status)}</td>
                                            <td className="p-8 text-right">
                                                <button 
                                                    onClick={() => navigate(`/pesanan/${order.id}`)}
                                                    className="inline-flex items-center gap-2 px-6 py-2 bg-surface text-text-primary hover:bg-primary hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all border border-border font-sans group-hover:shadow-md"
                                                >
                                                    Lihat Detail <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

