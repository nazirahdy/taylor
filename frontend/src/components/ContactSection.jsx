import React, { useState, useEffect } from 'react';
import { MapPin, Map, PhoneCall, Clock, MessageCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ContactSection = () => {
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
        <section className="bg-white py-12 scroll-mt-8" id="contact">
            <div className="container mx-auto px-4 md:px-12">
                <div className="text-center mb-8 animate-fade-in">
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-4 block font-sans">Hubungi Kami</span>
                    <h2 className="text-3xl md:text-2xl font-display font-bold mb-5 leading-tight text-text-primary">
                        Konsultasi Gratis
                    </h2>
                    <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed font-body">
                        Ada pertanyaan soal jenis bahan, desain, atau estimasi harga? Tim Era Jahit siap membantu Anda.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">

                    {/* Info Column */}
                    <div className="lg:col-span-2 space-y-6 animate-slide-up">
                        <div>
                            <h3 className="text-2xl font-display font-bold mb-3 text-text-primary">Informasi Studio</h3>
                            <p className="text-text-secondary leading-relaxed text-sm mb-5 font-body">
                                Kunjungi studio kami untuk konsultasi langsung dan melihat koleksi bahan pilihan bersama tim penjahit kami.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface p-6 rounded-[1.5rem] border border-border flex items-start gap-5 group hover:shadow-xl transition-all duration-700">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-display font-bold mb-1.5">Lokasi Studio</h4>
                                    <p className="text-text-secondary text-sm leading-relaxed mb-3 font-body">Jl. Sungai Balang, Cupak Tangah, Kec. Pauh, Kota Padang, Sumatera Barat</p>
                                    <a href="https://www.google.com/maps/place/Kantor+Camat+Pauh/@-0.9392632,100.4337847,94a,75y,261.95h,65.63t/data=!3m7!1e1!3m5!1szCgzPeCeTO156NQHVpPS2w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D24.370000000000005%26panoid%3DzCgzPeCeTO156NQHVpPS2w%26yaw%3D261.95!7i16384!8i8192!4m16!1m8!3m7!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!2sKantor+Camat+Pauh!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd!3m6!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd?entry=ttu&g_ep=EgoyMDI2MDcyOC4wIKXMDSoASAFQAw%3D%3D" className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all font-sans" target="_blank" rel="noreferrer">
                                        <Map className="w-3 h-3" /> Buka di Maps <ChevronRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-surface p-6 rounded-[1.5rem] border border-border flex items-start gap-5 group hover:shadow-xl transition-all duration-700">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                    <PhoneCall className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-display font-bold mb-1.5">Kontak Langsung</h4>
                                    <p className="text-text-primary font-bold text-sm mb-1 font-sans">+62 812-6797-6080</p>
                                    <p className="text-text-secondary text-sm font-body">erajahit@gmail.com</p>
                                </div>
                            </div>

                            <div className="bg-surface p-6 rounded-[1.5rem] border border-border flex items-start gap-5 group hover:shadow-xl transition-all duration-700">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-display font-bold mb-1.5">Jam Operasional</h4>
                                    <div className="text-text-secondary text-sm space-y-1 font-body">
                                        <p className="flex justify-between gap-5"><span>Sen - Kam:</span> <span className="font-bold text-text-primary">09:00 - 17:00</span></p>
                                        <p className="flex justify-between gap-5"><span>Jumat:</span> <span className="font-bold text-text-primary">09:00 - 11:30</span></p>
                                        <p className="flex justify-between gap-5"><span>Sabtu:</span> <span className="font-bold text-text-primary">09:00 - 15:00</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="lg:col-span-3 bg-surface p-8 md:p-6 rounded-[1.5rem] border border-border animate-fade-in delay-200 shadow-sm">
                        <h2 className="text-2xl font-display font-bold mb-2">Kirim Pesan</h2>
                        <p className="text-text-secondary text-sm mb-8 leading-relaxed font-body">
                            Gunakan formulir ini untuk konsultasi cepat. Pesan Anda akan diteruskan langsung ke WhatsApp admin Era Jahit.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Nama Lengkap</label>
                                    <input
                                        type="text" required
                                        value={nama} onChange={(e) => setNama(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary text-sm font-body placeholder:text-text-muted/50"
                                        placeholder="Nama Anda"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Nomor WhatsApp</label>
                                    <input
                                        type="tel" required
                                        value={nomorWa} onChange={(e) => setNomorWa(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary text-sm font-body placeholder:text-text-muted/50"
                                        placeholder="+62 812..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 font-sans">Deskripsi Kebutuhan</label>
                                <textarea
                                    rows="5" required
                                    value={pesan} onChange={(e) => setPesan(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-white border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text-primary text-sm font-body resize-none placeholder:text-text-muted/50"
                                    placeholder="Ceritakan kebutuhan busana Anda, jenis acara, atau desain yang diinginkan..."
                                />
                            </div>

                            <button type="submit" className="w-full md:w-fit px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                                <MessageCircle className="w-4 h-4" /> Kirim via WhatsApp
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="w-full h-80 relative mt-8 border-t border-border">
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
        </section>
    );
};

export default ContactSection;