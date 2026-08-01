import React from 'react';
import { Settings, Ruler, MapPin, Star } from 'lucide-react';

const HighlightSection = () => {
  return (
    <section className="bg-white py-20 px-4 md:px-20" id="gallery">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 animate-fade-in">
          <div className="max-w-xl">
            <span className="text-primary uppercase tracking-[0.2em] text-[13px] font-bold mb-4 block">Karya Kami</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
              Galeri Desain
            </h2>
          </div>
          <p className="text-text-secondary text-lg max-w-md font-body leading-relaxed">
            Jelajahi pilihan model jahitan berkualitas tinggi, dirancang khusus untuk kenyamanan dan kepercayaan diri Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="text-center p-6">
                  <h3 className="text-white font-display text-2xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {item.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-primary mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightSection;
