
import { ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedServices = () => {
  const categories = [
    { name: 'Klasik', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Modern', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
    { name: 'Minimalis', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop' },
    { name: 'Kontemporer', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop' }
  ];

  return (
    <section className="bg-white py-8 px-6 md:px-16" id="categories">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12 animate-fade-in">
          <div className="max-w-2xl">
            <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-6 block font-sans">Keahlian Kami</span>
            <h2 className="text-3xl md:text-3xl font-display font-bold text-text-primary leading-tight">
              Gaya <span className="italic font-light">Busana</span> Pilihan untuk Anda
            </h2>
          </div>
          <p className="text-text-secondary text-lg max-w-sm font-body leading-relaxed border-l border-border pl-8">
            Setiap kategori mewakili filosofi busana yang unik, dirancang khusus untuk mencerminkan kepribadian Anda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item, i) => (
            <div key={i} className="group cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] mb-8 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-700">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
                    <span className="text-white font-display font-bold text-xl">{item.name}</span>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-primary" />
                    </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                  <h3 className="text-[11px] font-sans font-bold text-text-muted uppercase tracking-[0.3em] group-hover:text-primary transition-colors">
                    {item.name} Koleksi
                  </h3>
                  <div className="w-0 group-hover:w-12 h-[1px] bg-primary mt-3 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;


