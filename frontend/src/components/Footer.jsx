import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative mt-16">
            {/* CTA Banner Section */}
            <div className="relative h-[280px] md:h-[340px] flex items-center justify-center text-center px-6 overflow-hidden mx-4 md:mx-16 rounded-[2rem] mb-[-70px] z-10 shadow-2xl group">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://as2.ftcdn.net/jpg/09/05/00/55/1000_F_905005503_yzsxQV76TLxuvKlzXXADdlNUXin54gcr.jpg')" }}
                />
                <div className="absolute inset-0 z-10 bg-primary/40 backdrop-blur-[2px]" />
                <div className="relative z-20 max-w-4xl animate-fade-in flex flex-col items-center px-6">
                    <span className="text-white uppercase tracking-[0.5em] text-[10px] font-bold mb-3 font-sans drop-shadow-lg">Mari Ciptakan Karya Terbaik</span>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-white leading-tight mb-6 drop-shadow-2xl">
                        Mewujudkan Visi Busana <br /> Anda Menjadi Nyata
                    </h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact" className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-all flex items-center gap-2 shadow-2xl font-sans text-xs uppercase tracking-widest">
                            Hubungi Sekarang <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="bg-primary text-white pt-[110px] pb-10">
                <div className="container mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-4 mb-5 group">
                            <div className="h-14 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <img src="/logo.png" alt="Era Jahit Logo" className="h-full w-auto object-contain drop-shadow-md rounded-2xl" />
                            </div>
                        </Link>
                        <p className="text-white/40 font-body leading-relaxed mb-6 text-sm max-w-xs">
                            Meningkatkan kepercayaan diri melalui busana yang dijahit dengan presisi dan kualitas premium.
                        </p>
                        <div className="flex gap-3">
                            {[Instagram, Facebook, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center hover:border-white hover:text-white hover:bg-white/10 transition-all group text-white/70">
                                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-5">Studio</h4>
                        <ul className="space-y-3 text-white/60 font-body text-sm">
                            <li><Link to="/#about" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Tentang Kami</Link></li>
                            <li><Link to="/#services" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Layanan Kami</Link></li>
                            <li><Link to="/#gallery" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Portofolio</Link></li>
                            <li><Link to="/#contact" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Kontak</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-5">Keahlian</h4>
                        <ul className="space-y-3 text-white/60 font-body text-sm">
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Busana Pria & Wanita</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Seragam Perusahaan</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Kebaya & Gaun Pesta</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all"></span> Jahit Custom</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-5">Hubungi Kami</h4>
                        <ul className="space-y-4 text-white/70 font-body text-sm">
                            <li className="flex items-start gap-4 group">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <span className="pt-1">Era Jahit Jl.Sungai Balang,<br />Kota Padang Sumatera Barat</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
                                    <Phone className="w-4 h-4 text-white" />
                                </div>
                                <span>+6281267976080</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
                                    <Mail className="w-4 h-4 text-white" />
                                </div>
                                <span>erajahit@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-16 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/20 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                        © 2026 Era Jahit — Penjahit & Konveksi Profesional.
                    </p>
                    <div className="flex gap-10 text-white/40 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                        <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

