import React from 'react';
import { Target, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
    return (
        <section className="bg-surface py-32" id="about">
            <div className="container mx-auto px-4 md:px-12">
                
                {/* Header part */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-24 animate-fade-in">
                    <div className="max-w-2xl">
                        <span className="text-primary uppercase tracking-[0.4em] text-[13px] font-bold mb-6 block">Warisan Kami</span>
                        <h2 className="text-5xl md:text-7xl font-display font-bold leading-none mb-6 text-text-primary">Visi Kami</h2>
                        <div className="h-1.5 w-24 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-text-secondary text-lg max-w-md leading-relaxed font-body">
                        Sejak 2010, Era Jahit telah mendefinisikan ulang seni menjahit premium di Indonesia — memadukan keahlian tradisional dengan sentuhan modern.
                    </p>
                </div>

                {/* Main Story part */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative animate-slide-up">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white p-4 border border-border shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1616486341351-7025244f6714?q=80&w=1000&auto=format&fit=crop"
                                className="w-full h-full object-cover rounded-[1.5rem] grayscale hover:grayscale-0 transition-all duration-1000"
                                alt="Sejarah Era Jahit"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[2rem] border border-border shadow-2xl hidden md:block">
                            <div className="text-5xl font-display font-bold text-primary mb-2">15+</div>
                            <div className="text-[11px] uppercase tracking-widest font-bold text-text-muted font-sans">Tahun Pengalaman</div>
                        </div>
                    </div>
                    <div className="space-y-12 animate-fade-in">
                        <div className="flex items-center gap-6">
                            <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-primary whitespace-nowrap font-sans">Berdiri 2010</h2>
                            <div className="h-[1px] w-full bg-border"></div>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight text-text-primary">Merajut Busana Timeless dengan Presisi Tak Tertandingi.</h3>
                        <p className="text-text-secondary leading-relaxed text-lg font-body">
                            Era Jahit bukan sekadar penjahit; kami adalah studio busana yang bercerita melalui kain. Kami percaya kemewahan sejati terletak pada keselarasan antara desain dan kenyamanan.
                        </p>
                        <div className="p-10 bg-white rounded-[2rem] border border-border italic text-text-primary text-2xl font-display relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                            "Busana mencerminkan jiwa dan ambisi penggunanya."
                        </div>
                    </div>
                </div>

                {/* Values part */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            title: "Presisi Artistik",
                            desc: "Setiap detail dirancang dan dieksekusi dengan teliti, memastikan perpaduan sempurna antara desain dan kerapian.",
                            icon: <Target className="w-8 h-8" />
                        },
                        {
                            title: "Kurasi Modern",
                            desc: "Kami memadukan tren kontemporer dengan keahlian tradisional, menciptakan busana yang tetap relevan.",
                            icon: <Zap className="w-8 h-8" />
                        },
                        {
                            title: "Kemewahan Etis",
                            desc: "Komitmen kami pada bahan berkualitas dan mitra vendor terpercaya, memastikan keindahan tanpa kompromi.",
                            icon: <Shield className="w-8 h-8" />
                        }
                    ].map((value, i) => (
                        <div key={i} className="bg-white p-12 rounded-[2rem] border border-border hover:shadow-2xl transition-all duration-700 group text-center md:text-left">
                            <div className="text-primary mb-10 bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-500">
                                {value.icon}
                            </div>
                            <h4 className="text-2xl font-display font-bold mb-6 text-text-primary">{value.title}</h4>
                            <p className="text-text-secondary text-sm leading-relaxed font-body">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
