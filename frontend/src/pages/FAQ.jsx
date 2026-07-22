import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircleQuestion, HelpCircle, ArrowRight } from 'lucide-react';

const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border-b border-border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-surface/50' : ''}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left py-10 md:py-12 flex justify-between items-center focus:outline-none group px-8"
            >
                <div className="flex items-start gap-8">
                    <span className="text-primary font-display font-bold text-xs mt-1 opacity-40 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
                    <h3 className={`text-xl md:text-2xl font-display font-bold leading-tight pr-8 transition-colors ${isOpen ? 'text-primary' : 'text-text-primary'}`}>
                        {question}
                    </h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 border ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'bg-surface border-border text-text-muted'}`}>
                    <ChevronDown className="w-5 h-5"/>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 md:px-24 pb-12 text-text-secondary leading-relaxed text-sm font-body">
                    <p className="max-w-3xl">{answer}</p>
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    const faqData = [
        {
            q: "Berapa lama waktu pengerjaan busana di Era Jahit?",
            a: "Waktu pengerjaan standar berkisar antara 2 hingga 4 minggu, tergantung jenis busana dan kerumitan desain. Ini mencakup proses konsultasi, pemotongan pola, menjahit, dan fitting. Desainer Anda akan memberikan estimasi waktu yang lebih detail saat sesi pertama."
        },
        {
            q: "Bagaimana cara kerja layanan 'Home Service'?",
            a: "Penjahit ahli kami akan datang ke lokasi Anda untuk melakukan pengukuran presisi dan konsultasi desain langsung. Sesi ini sangat penting untuk memastikan hasil akhir busana yang sempurna. Uang muka (DP) diperlukan untuk mengkonfirmasi jadwal kunjungan."
        },
        {
            q: "Apakah tersedia layanan desain busana sepenuhnya kustom?",
            a: "Tentu saja. Kami bangga menciptakan busana kustom yang sepenuhnya disesuaikan dengan selera dan ukuran Anda. Tim kami bekerja sama dengan klien untuk merancang busana yang mencerminkan gaya dan kebutuhan unik masing-masing pelanggan."
        },
        {
            q: "Bagaimana saya bisa memantau progres jahitan saya?",
            a: "Melalui portal pesanan Era Jahit, Anda memiliki akses langsung ke dashboard pesanan. Di sana, Anda bisa memantau setiap tahapan pengerjaan, mulai dari konsultasi, pemilihan bahan, hingga fitting pertama, serta berkomunikasi langsung dengan tim jahit via fitur chat."
        },
        {
            q: "Bahan apa saja yang tersedia di Era Jahit?",
            a: "Kami menyediakan beragam pilihan bahan premium, mulai dari katun berkualitas, linen, batik, hingga kain sutra dan bahan formal eksklusif. Koleksi bahan kami diperbarui secara berkala sesuai tren busana terkini."
        },
        {
            q: "Apakah ada garansi untuk hasil jahitan?",
            a: "Ya, kami memberikan garansi perbaikan selama 30 hari setelah busana diserahkan. Jika ada bagian yang perlu disesuaikan atau diperbaiki, kami siap menanganinya tanpa biaya tambahan. Kepuasan Anda adalah prioritas utama kami."
        }
    ];

    return (
        <div className="bg-white min-h-screen text-text-primary">
            
            {/* Header FAQ */}
            <section className="pt-48 pb-32 relative overflow-hidden bg-surface border-b border-border">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="container mx-auto px-4 md:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <div className="max-w-3xl animate-fade-in">
                            <span className="text-primary uppercase tracking-[0.4em] text-[13px] font-bold mb-6 block">Pusat Informasi</span>
                            <h1 className="text-6xl md:text-8xl font-display font-bold leading-none mb-8 text-text-primary">Pertanyaan Umum</h1>
                            <div className="h-1.5 w-24 bg-primary rounded-full mb-8"></div>
                            <p className="text-text-secondary text-lg leading-relaxed max-w-xl font-body">
                                Temukan jawaban atas pertanyaan umum seputar layanan, proses, dan pemesanan busana di Era Jahit.
                            </p>
                        </div>
                        <div className="hidden lg:block animate-fade-in delay-400">
                            <HelpCircle className="w-40 h-40 text-primary/5" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Accordion Lists */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-12 max-w-6xl">
                    <div className="border-t border-border animate-slide-up">
                        {faqData.map((item, index) => (
                            <FAQItem key={index} index={index} question={item.q} answer={item.a} />
                        ))}
                    </div>

                    {/* Support CTA */}
                    <div className="mt-32 p-12 md:p-20 bg-surface border border-border rounded-[2.5rem] relative overflow-hidden group animate-slide-up delay-400">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -z-0 group-hover:bg-primary/10 transition-colors duration-700"></div>
                        
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 italic text-text-primary">Masih punya pertanyaan?</h2>
                            <p className="text-text-secondary text-lg mb-12 font-body leading-relaxed">
                                Jika pertanyaan Anda belum terjawab di sini, tim Era Jahit siap membantu Anda secara langsung melalui halaman kontak kami.
                            </p>
                            
                            <Link 
                                to="/contact" 
                                className="inline-flex items-center gap-4 bg-primary text-white font-bold px-10 py-5 rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                            >
                                Hubungi Kami <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
