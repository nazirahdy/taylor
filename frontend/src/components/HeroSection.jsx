import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden" id="beranda">
      {/* Background image layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 hover:scale-100"
        style={{ backgroundImage: "url('https://i.pinimg.com/1200x/51/50/aa/5150aa0e03c7c51bf976d34063befec0.jpg')" }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-text-primary/40 to-text-primary/80" />
      <div className="absolute inset-0 z-10 backdrop-blur-[1px]" />

      {/* Main Content */}
      <div className="relative z-20 max-w-5xl animate-fade-in pt-20 flex flex-col items-center">
      <span className="text-white uppercase tracking-[0.5em] text-[10px] md:text-[12px] font-bold mb-8 block font-sans drop-shadow-md">
        Kualitas Jahitan Terbaik
      </span>
      <h1 className="text-3xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[0.9] mb-10 drop-shadow-2xl">
        Menciptakan <span className="italic font-light">Karakter</span><br />
        Busana Anda.
      </h1>
        <p className="text-white/70 text-lg md:text-xl font-body max-w-2xl mb-14 leading-relaxed drop-shadow-lg">
          Di Era Jahit, kami mendefinisikan ulang kemewahan melalui jahitan tangan yang presisi, mengubah visi busana Anda menjadi karya yang menginspirasi.
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/gallery" className="px-12 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 font-sans text-[11px] uppercase tracking-widest group">
            Jelajahi Portofolio <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          <Link to="/contact" className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-3 font-sans text-[11px] uppercase tracking-widest shadow-xl">
            Hubungi Kami
          </Link>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
