import React from 'react';
import {
    User,
    Store,
    CheckCircle2,
    ArrowRight,
    MapPin,
    Clock,
    CreditCard,
    ChevronRight,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Services = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleOrderClick = (e, method) => {
        e.preventDefault();
        if (user) {
            navigate('/pesanan/buat', { state: { method } });
        } else {
            navigate('/register');
        }
    };
    return (
        <div className="bg-white min-h-screen text-text-primary pb-12">

            {/* HEADER SERVICES */}
            <section className="pt-28 pb-16 relative overflow-hidden bg-surface">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="container mx-auto px-4 md:px-12 text-center animate-fade-in relative z-10">
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-4 block font-sans">Keahlian Kami</span>
                    <h1 className="text-3xl md:text-3xl font-display font-bold mb-8 text-text-primary">Layanan Jahit</h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed font-body">
                        Kami menyediakan dua metode layanan yang dirancang sesuai kebutuhan Anda, memadukan keahlian tradisional dengan sentuhan modern untuk busana yang sempurna
                    </p>
                </div>
            </section>

            {/* TWO MAIN SERVICES */}
            <section className="py-8 container mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Method 1: Home Service */}
                    <div className="bg-surface p-8 md:p-6 rounded-[1.5rem] border border-border flex flex-col group hover:shadow-2xl transition-all duration-700 animate-slide-up">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4">Home Service</h2>
                        <p className="text-text-secondary mb-8 leading-relaxed text-base font-body">
                            Layanan penjahit kami di mana tukang jahit datang ke lokasi Anda untuk konsultasi dan pengukuran badan. Bedanya, pada Home Service penjahit yang datang, sedangkan pada kunjungan studio Anda datang ke toko
                        </p>

                        <div className="space-y-6 mb-6 flex-grow text-left">
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-primary border-b border-border pb-4 font-sans">Prosedur &amp; Proses</h4>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">DP Diperlukan</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Uang muka (DP) diperlukan untuk mengamankan jadwal kunjungan penjahit kami</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Cakupan Wilayah</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Tersedia untuk wilayah kota dan daerah tertentu sesuai kesepakatan</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={(e) => handleOrderClick(e, 'home_service')} className="w-full py-5 bg-primary text-white text-center rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                            Pesan Home Service <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Method 2: In-Store */}
                    <div className="bg-surface p-8 md:p-6 rounded-[1.5rem] border border-border flex flex-col group hover:shadow-2xl transition-all duration-700 animate-slide-up delay-200">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Store className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4">In-Store (Kunjungan Studio)</h2>
                        <p className="text-text-secondary mb-8 leading-relaxed text-base font-body">
                            Kunjungi studio kami untuk pengalaman desain kolaboratif dan pengukuran oleh penjahit kami di tempat. Bedanya, pada In-Store pelanggan datang ke toko, bukan penjahit yang datang ke rumah
                        </p>

                        <div className="space-y-6 mb-6 flex-grow text-left">
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-primary border-b border-border pb-4 font-sans">Prosedur &amp; Proses</h4>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Reservasi Prioritas</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Reservasi diperlukan untuk memastikan perhatian penuh dari tim penjahit utama kami</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Akses Koleksi Penuh</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Akses gratis ke seluruh koleksi bahan dan sampel kain eksklusif selama sesi Anda</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={(e) => handleOrderClick(e, 'visit')} className="w-full py-5 bg-white border border-border text-text-primary text-center rounded-xl font-bold uppercase tracking-widest text-xs hover:border-primary transition-all flex items-center justify-center gap-3">
                            Jadwalkan Kunjungan Studio <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </section>

            {/* COMPARISON */}
            <section className="py-12 bg-surface">
                <div className="container mx-auto px-4 md:px-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl md:text-2xl font-display font-bold mb-4 text-text-primary">Perbandingan Layanan</h3>
                            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                        </div>
                        <div className="bg-white rounded-[1.5rem] border border-border overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface/50 border-b border-border">
                                            <th className="p-8 font-bold text-[11px] uppercase tracking-widest text-text-muted font-sans">Aspek</th>
                                            <th className="p-8 font-bold text-[11px] uppercase tracking-widest text-center text-primary font-sans">Home Service</th>
                                            <th className="p-8 font-bold text-[11px] uppercase tracking-widest text-center text-primary font-sans">Kunjungan Studio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[
                                            { label: "Lokasi Pertemuan", home: "Lokasi Pelanggan", store: "Studio Era Jahit" },
                                            { label: "Uang Muka (DP)", home: "Diperlukan", store: "Tidak Diperlukan" },
                                            { label: "Akses Bahan", home: "Pilihan Terbatas", store: "Seluruh Koleksi" },
                                            { label: "Cocok Untuk", home: "Pengukuran di Lokasi", store: "Pilihan Desain & Bahan" }
                                        ].map((row, index) => (
                                            <tr key={index} className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors">
                                                <td className="p-8 font-bold text-text-primary uppercase tracking-tighter text-[11px] font-sans">{row.label}</td>
                                                <td className="p-8 text-center text-text-secondary font-body">{row.home}</td>
                                                <td className="p-8 text-center text-text-secondary font-body">{row.store}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );

};

export default Services;
