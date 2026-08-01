import React from 'react';
import {
    User, Store, CheckCircle2, ArrowRight,
    MapPin, Clock, CreditCard, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ServicesSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleOrderClick = (method) => {
        if (user) {
            navigate('/pesanan/buat', { state: { method } });
        } else {
            navigate('/register');
        }
    };

    return (
        <section className="bg-white py-24 scroll-mt-16" id="services">
            <div className="container mx-auto px-4 md:px-12 text-center mb-14 animate-fade-in">
                <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-4 block font-sans">Keahlian Kami</span>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-5 text-text-primary">Layanan Jahit</h2>
                <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed font-body">
                    Kami menyediakan dua metode layanan yang dirancang sesuai kebutuhan Anda, memadukan keahlian tradisional dengan sentuhan modern.
                </p>
            </div>

            <div className="container mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Home Service */}
                    <div className="bg-surface p-8 md:p-10 rounded-[2rem] border border-border flex flex-col group hover:shadow-2xl transition-all duration-700 animate-slide-up">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4">Home Service</h2>
                        <p className="text-text-secondary mb-8 leading-relaxed text-base font-body">
                            Layanan jahit kami di mana penjahit datang ke lokasi Anda untuk konsultasi dan pengukuran. Pada Home Service, penjahit yang ke tempat pelanggan.
                        </p>

                        <div className="space-y-6 mb-10 flex-grow text-left">
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-primary border-b border-border pb-4 font-sans">Prosedur &amp; Proses</h4>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">DP Diperlukan</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Uang muka (DP) diperlukan untuk mengamankan jadwal kunjungan</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Cakupan Wilayah</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Tersedia untuk wilayah kota Padang dan sekitarnya</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => handleOrderClick('home_service')} className="w-full py-5 bg-primary text-white text-center rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                            Pesan Home Service <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* In-Store */}
                    <div className="bg-surface p-8 md:p-10 rounded-[2rem] border border-border flex flex-col group hover:shadow-2xl transition-all duration-700 animate-slide-up delay-200">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Store className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-display font-bold mb-4">In-Store (Studio)</h2>
                        <p className="text-text-secondary mb-8 leading-relaxed text-base font-body">
                            Kunjungi studio kami untuk konsultasi dan pengukuran langsung oleh penjahit. Pada In-Store, pelanggan datang ke toko sementara penjahit menunggu di studio
                        </p>

                        <div className="space-y-6 mb-10 flex-grow text-left">
                            <h4 className="text-[11px] uppercase tracking-widest font-bold text-primary border-b border-border pb-4 font-sans">Prosedur &amp; Proses</h4>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Reservasi Prioritas</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Reservasi disarankan untuk memastikan perhatian penuh dari tim kami</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5">
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-text-primary font-bold font-sans">Akses Koleksi Penuh</p>
                                    <p className="text-text-muted text-sm mt-1 font-body">Akses ke seluruh koleksi bahan dan sampel kain eksklusif</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => handleOrderClick('visit')} className="w-full py-5 bg-white border border-border text-text-primary text-center rounded-xl font-bold uppercase tracking-widest text-xs hover:border-primary transition-all flex items-center justify-center gap-3">
                            Jadwalkan Kunjungan Studio <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ServicesSection;