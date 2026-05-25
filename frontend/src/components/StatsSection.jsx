import React from 'react';
import { Scissors, Users, Shirt } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { value: '8K+', label: 'Pesanan Selesai', sublabel: 'Menghasilkan busana yang memuaskan pelanggan.' },
    { value: '15+', label: 'Tahun Pengalaman', sublabel: 'Menguasai keahlian dan inovasi jahitan.' },
    { value: '10K+', label: 'Pelanggan Puas', sublabel: 'Membangun hubungan jangka panjang dengan pelanggan.' },
    { value: '99%', label: 'Tingkat Kepuasan', sublabel: 'Melampaui ekspektasi setiap pelanggan.' },
  ];

  return (
    <section className="bg-surface py-24 px-4 md:px-20" id="stats">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center divide-y lg:divide-y-0 lg:divide-x divide-border">
          {stats.map((stat, i) => (
            <div key={i} className="pt-12 lg:pt-0 lg:px-6 group animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <h3 className="text-6xl md:text-7xl font-display font-bold text-primary mb-4 transition-transform group-hover:scale-105 duration-500">
                {stat.value}
              </h3>
              <p className="text-text-primary text-sm font-bold uppercase tracking-widest mb-2 font-sans">
                {stat.label}
              </p>
              <p className="text-text-muted text-[13px] font-body leading-relaxed max-w-[200px] mx-auto">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
