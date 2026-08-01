import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden" id="beranda">
      {/* Background image layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-100"
        style={{ backgroundImage: "url('https://as2.ftcdn.net/jpg/09/05/00/55/1000_F_905005503_yzsxQV76TLxuvKlzXXADdlNUXin54gcr.jpg')" }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-text-primary/40 to-text-primary/80" />
      <div className="absolute inset-0 z-10 backdrop-blur-[1px]" />

      {/* Main Content */}
      <div className="relative z-20 max-w-3xl animate-fade-in pt-16 flex flex-col items-center">
      <span className="text-white uppercase tracking-[0.4em] text-[9px] md:text-[11px] font-bold mb-5 block font-sans drop-shadow-md">
        Kualitas Jahitan Terbaik
      </span>
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-[1.05] mb-6 drop-shadow-2xl">
        Menciptakan <span className="italic font-light">Karakter</span><br />
        Busana Anda
      </h1>
        <p className="text-white/70 text-sm md:text-base font-body max-w-xl mb-8 leading-relaxed drop-shadow-lg">
          Di Era Jahit, kami mendefinisikan ulang kemewahan melalui jahitan tangan yang presisi, mengubah visi busana Anda menjadi karya yang menginspirasi
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/gallery" className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest group">
            Jelajahi Portofolio <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link to="/contact" className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest shadow-xl">
            Hubungi Kami
          </Link>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
