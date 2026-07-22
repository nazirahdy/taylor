import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative mt-32">
            {/* CTA Banner Section */}
            <div className="relative h-[600px] flex items-center justify-center text-center px-6 overflow-hidden mx-4 md:mx-16 rounded-[3.5rem] mb-[-120px] z-10 shadow-2xl group">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://as2.ftcdn.net/jpg/09/05/00/55/1000_F_905005503_yzsxQV76TLxuvKlzXXADdlNUXin54gcr.jpg')" }}
                />
                <div className="absolute inset-0 z-10 bg-primary/40 backdrop-blur-[2px]" />
                <div className="relative z-20 max-w-4xl animate-fade-in flex flex-col items-center px-6">
                    <span className="text-white uppercase tracking-[0.5em] text-[12px] font-bold mb-6 font-sans drop-shadow-lg">Mari Ciptakan Karya Terbaik</span>
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-12 drop-shadow-2xl">
                        Mewujudkan Visi Busana <br /> Anda Menjadi Nyata
                    </h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact" className="px-12 py-5 bg-white text-primary font-bold rounded-2xl hover:bg-surface transition-all flex items-center gap-3 shadow-2xl font-sans text-sm uppercase tracking-widest">
                            Hubungi Sekarang <ArrowUpRight className="w-5 h-5" />
                        </Link>
                        <a href="tel:+62751456789" className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-3 font-sans text-sm uppercase tracking-widest">
                            Telepon Studio <ArrowUpRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="bg-text-primary text-white pt-[240px] pb-16">
                <div className="container mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-4 mb-10 group">
                            <div className="h-20 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <img src="/logo.png" alt="Era Jahit Logo" className="h-full w-auto object-contain drop-shadow-md rounded-2xl" />
                            </div>
                        </Link>
                        <p className="text-white/40 font-body leading-relaxed mb-10 text-sm max-w-xs">
                            Meningkatkan kepercayaan diri melalui busana yang dijahit dengan presisi dan kualitas premium.
                        </p>
                        <div className="flex gap-5">
                            {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 border border-white/10 rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-sans text-[12px] font-bold uppercase tracking-[0.3em] text-primary mb-10">Studio</h4>
                        <ul className="space-y-5 text-white/40 font-body text-sm">
                            <li><Link to="/#about" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Tentang Kami</Link></li>
                            <li><Link to="/#services" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Layanan Kami</Link></li>
                            <li><Link to="/#gallery" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Portofolio</Link></li>
                            <li><Link to="/#contact" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Kontak</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans text-[12px] font-bold uppercase tracking-[0.3em] text-primary mb-10">Keahlian</h4>
                        <ul className="space-y-5 text-white/40 font-body text-sm">
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Busana Pria & Wanita</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Seragam Perusahaan</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Kebaya & Gaun Pesta</li>
                            <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-4 h-[1px] bg-primary transition-all"></span> Jahit Custom</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans text-[12px] font-bold uppercase tracking-[0.3em] text-primary mb-10">Hubungi Kami</h4>
                        <ul className="space-y-8 text-white/40 font-body text-sm">
                            <li className="flex items-start gap-5 group">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <span className="pt-1">Era Jahit HQ, Jl. Jend. Sudirman,<br />Jakarta Pusat, ID</span>
                            </li>
                            <li className="flex items-center gap-5 group">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                                    <Phone className="w-4 h-4 text-primary" />
                                </div>
                                <span>+62 21 539 2525</span>
                            </li>
                            <li className="flex items-center gap-5 group">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                                    <Mail className="w-4 h-4 text-primary" />
                                </div>
                                <span>info@erajahit.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-16 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/20 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                        © 2026 Era Jahit — Penjahit & Konveksi Profesional.
                    </p>
                    <div className="flex gap-10 text-white/20 font-sans text-[10px] uppercase tracking-[0.2em] font-bold">
                        <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

