import React from 'react';

import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    { number: '01', question: 'Apakah Era Jahit menerima bahan dari pelanggan?', answer: 'Ya, kami menerima jahitan dengan bahan yang Anda sediakan sendiri maupun bahan berkualitas dari koleksi kami.' },
    { number: '02', question: 'Bagaimana cara melakukan pengukuran?', answer: 'Kami menyediakan layanan Home Service untuk pengukuran langsung di lokasi Anda atau Anda dapat menyetorkan data ukuran secara mandiri.' },
    { number: '03', question: 'Berapa lama estimasi waktu pengerjaan?', answer: 'Estimasi pengerjaan berkisar antara 1 hingga 3 minggu, tergantung pada tingkat kerumitan desain dan antrean produksi.' },
    { number: '04', question: 'Apakah ada garansi jika hasil jahitan tidak pas?', answer: 'Tentu, kami memberikan garansi satu kali revisi (permak) gratis jika hasil jahitan belum sesuai dengan ukuran yang disepakati.' }
  ];

  return (
    <section className="bg-white py-32 px-4 md:px-20" id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20 animate-fade-in">
          <span className="text-primary uppercase tracking-[0.2em] text-[13px] font-bold mb-4 block">Pusat Bantuan</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary">
            Ada Pertanyaan?
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border-b border-border py-6 cursor-pointer">
              <summary className="flex items-center justify-between list-none">
                <div className="flex items-center gap-6">
                  <span className="text-primary font-body font-bold text-lg">{faq.number}.</span>
                  <h3 className="text-lg md:text-xl font-body font-bold text-text-primary group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown className="w-5 h-5 text-text-muted group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-6 pl-12">
                <p className="text-text-secondary text-lg font-body leading-relaxed max-w-2xl">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
