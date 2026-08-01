import React from 'react';
import { Target, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
    return (
        <section className="bg-surface py-20 scroll-mt-16" id="about">
            <div className="container mx-auto px-4 md:px-12">
                
                {/* Header part */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 animate-fade-in">
                    <div className="max-w-xl">
                        <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-4 block">Warisan Kami</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold leading-none mb-4 text-text-primary">Visi Kami</h2>
                        <div className="h-1.5 w-24 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-text-secondary text-lg max-w-md leading-relaxed font-body">
                        Sejak 2010, Era Jahit telah mendefinisikan ulang seni menjahit premium di Indonesia memadukan keahlian tradisional dengan sentuhan modern
                    </p>
                </div>

                {/* Main Story part */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
                    <div className="relative animate-slide-up flex justify-center">
                        <div className="aspect-[4/5] w-3/4 md:w-2/3 rounded-[2rem] overflow-hidden bg-white p-3 border border-border shadow-md">
                            <img
                                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop"
                                className="w-full h-full object-cover rounded-[1.5rem]"
                                alt="Sejarah Era Jahit"
                            />
                        </div>
                    </div>
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary whitespace-nowrap font-sans">Berdiri 2010</h2>
                            <div className="h-[1px] w-full bg-border"></div>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display font-bold leading-tight text-text-primary">Merajut Busana Timeless dengan Presisi Tak Tertandingi</h3>
                        <p className="text-text-secondary leading-relaxed text-lg font-body">
                            Era Jahit bukan sekadar penjahit; kami adalah studio busana yang bercerita melalui kain. Kami percaya kemewahan sejati terletak pada keselarasan antara desain dan kenyamanan
                        </p>
                        <div className="p-6 bg-white rounded-xl border border-border italic text-text-primary text-lg font-display relative overflow-hidden shadow-sm">
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
                            icon: <Zap className="w-6 h-6" />
                        },
                        {
                            title: "Kemewahan Etis",
                            desc: "Komitmen kami pada bahan berkualitas dan mitra vendor terpercaya, memastikan keindahan tanpa kompromi.",
                            icon: <Shield className="w-6 h-6" />
                        }
                    ].map((value, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] border border-border hover:shadow-2xl transition-all duration-700 group text-center md:text-left">
                            <div className="text-primary mb-8 bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-500">
                                {value.icon}
                            </div>
                            <h4 className="text-xl font-display font-bold mb-4 text-text-primary">{value.title}</h4>
                            <p className="text-text-secondary text-sm leading-relaxed font-body">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
