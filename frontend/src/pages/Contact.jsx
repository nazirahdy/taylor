import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Map, PhoneCall, Clock, Send, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
    const { user } = useAuth();
    const [nama, setNama] = useState('');
    const [nomorWa, setNomorWa] = useState('');
    const [pesan, setPesan] = useState('');

    useEffect(() => {
        if (user) {
            setNama((prev) => prev || user.name || '');
            setNomorWa((prev) => prev || user.phone_wa || '');
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formatWa = `6281267976080`;
        const textEnc = encodeURIComponent(`Halo, saya *${nama}* (${nomorWa}). \n\n${pesan}`);
        window.open(`https://wa.me/${formatWa}?text=${textEnc}`, '_blank');
    };

    return (
        <div className="bg-white min-h-screen text-text-primary">

            {/* HERO SECTION CONTACT */}
            <section className="relative pt-16 pb-16 overflow-hidden bg-surface">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="container mx-auto px-4 md:px-12 relative z-10 text-center animate-fade-in">
                    <span className="text-primary uppercase tracking-[0.4em] text-[13px] font-bold mb-6 block">Hubungi Kami</span>
                    <h1 className="text-3xl md:text-3xl font-display font-bold mb-8 leading-tight text-text-primary">
                        Konsultasi Gratis
                    </h1>
                    <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed font-body">
                        Ada pertanyaan soal jenis bahan, desain, atau estimasi harga?
                        Tim Era Jahit siap membantu Anda melalui saluran komunikasi kami
                    </p>
                </div>
            </section>

            <div className="py-12">
                <div className="container mx-auto px-4 md:px-12">
                    <div className="grid lg:grid-cols-5 gap-16">

                        {/* Info Column */}
                        <div className="lg:col-span-2 space-y-10 animate-slide-up">
                            <div>
                                <h3 className="text-3xl font-display font-bold mb-6 text-text-primary">Informasi Studio</h3>
                                <p className="text-text-secondary leading-relaxed mb-6 font-body">
                                    Kunjungi studio kami untuk konsultasi langsung dan melihat koleksi bahan pilihan bersama tim penjahit kami
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="space-y-6">
                                <div className="bg-surface p-8 rounded-[1.5rem] border border-border flex items-start gap-6 group hover:shadow-xl transition-all duration-700">
                                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-display font-bold mb-2">Lokasi Studio</h4>
                                        <p className="text-text-secondary text-sm leading-relaxed mb-4 font-body">Jl. Sungai Balang, Cupak Tangah, Kec. Pauh, Kota Padang, Sumatera Barat</p>
                                        <a href="https://www.google.com/maps/place/Kantor+Camat+Pauh/@-0.9392632,100.4337847,94a,75y,261.95h,65.63t/data=!3m7!1e1!3m5!1szCgzPeCeTO156NQHVpPS2w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D24.370000000000005%26panoid%3DzCgzPeCeTO156NQHVpPS2w%26yaw%3D261.95!7i16384!8i8192!4m16!1m8!3m7!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!2sKantor+Camat+Pauh!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd!3m6!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd?entry=ttu&g_ep=EgoyMDI2MDcyOC4wIKXMDSoASAFQAw%3D%3D" className="text-primary font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:gap-3 transition-all font-sans" target="_blank" rel="noreferrer">
                                            <Map className="w-4 h-4" /> Buka di Maps <ChevronRight className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-surface p-8 rounded-[1.5rem] border border-border flex items-start gap-6 group hover:shadow-xl transition-all duration-700">
                                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                        <PhoneCall className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-display font-bold mb-2">Kontak Langsung</h4>
                                        <p className="text-text-primary font-bold mb-1 font-sans">+62 812-6797-6080</p>
                                        <p className="text-text-secondary text-sm font-body">erajahit@gmail.com</p>
                                    </div>
                                </div>

                                <div className="bg-surface p-8 rounded-[1.5rem] border border-border flex items-start gap-6 group hover:shadow-xl transition-all duration-700">
                                    <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-display font-bold mb-2">Jam Operasional</h4>
                                        <div className="text-text-secondary text-sm space-y-1 font-body">
                                            <p className="flex justify-between gap-6"><span>Sen - Kam:</span> <span className="font-bold text-text-primary">09:00 - 17:00</span></p>
                                            <p className="flex justify-between gap-6"><span>Jumat:</span> <span className="font-bold text-text-primary">09:00 - 11:30</span></p>
                                            <p className="flex justify-between gap-6"><span>Sabtu:</span> <span className="font-bold text-text-primary">09:00 - 15:00</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-3 bg-surface p-6 md:p-8 rounded-[1.75rem] border border-border animate-fade-in delay-200 shadow-sm">
                            <h2 className="text-3xl font-display font-bold mb-6">Kirim Pesan</h2>
                            <p className="text-text-secondary mb-7 leading-relaxed font-body">
                                Gunakan formulir ini untuk konsultasi cepat. Pesan Anda akan diteruskan langsung ke WhatsApp admin Era Jahit.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Nama Lengkap</label>
                                        <input
                                            type="text" required
                                            value={nama} onChange={(e) => setNama(e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary font-body placeholder:text-text-muted/50"
                                            placeholder="Nama Anda"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Nomor WhatsApp</label>
                                        <input
                                            type="tel" required
                                            value={nomorWa} onChange={(e) => setNomorWa(e.target.value)}
                                            className="w-full px-6 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary font-body placeholder:text-text-muted/50"
                                            placeholder="+62 812..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Deskripsi Kebutuhan</label>
                                    <textarea
                                        rows="5" required
                                        value={pesan} onChange={(e) => setPesan(e.target.value)}
                                        className="w-full px-6 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary font-body resize-none placeholder:text-text-muted/50"
                                        placeholder="Ceritakan kebutuhan busana Anda, jenis acara, atau desain yang diinginkan..."
                                    />
                                </div>

                                <button type="submit" className="w-full md:w-fit px-12 py-5 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                    <MessageCircle className="w-5 h-5" /> Kirim via WhatsApp
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="w-full h-[600px] relative mt-10 border-t border-border">
                <iframe
                    src="https://maps.google.com/maps?q=-0.9394053,100.4339543&t=&z=17&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Lokasi Studio Era Jahit"
                ></iframe>
            </div>
        </div>
    );
};

export default Contact;
