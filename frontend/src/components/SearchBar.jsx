import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <section className="bg-white py-16 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-2xl font-display font-bold text-dark-bg mb-2">
          Jelajahi Layanan Jahit Terbaik
        </h2>
        <p className="text-muted text-base mb-6">
          Koleksi pilihan pakaian berkualitas dari penjahit berpengalaman Era Jahit.
        </p>
        
        <div className="flex flex-col md:flex-row border border-border-light rounded-sm overflow-hidden shadow-sm">
          <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-border-light">
            <Search className="w-5 h-5 text-muted mr-3" />
            <input 
              type="text" 
              placeholder="Cari jenis pakaian..." 
              className="w-full bg-transparent text-dark-bg text-sm outline-none"
            />
          </div>
          
          <select className="px-6 py-4 bg-white text-dark-bg text-sm outline-none border-b md:border-b-0 md:border-r border-border-light cursor-pointer">
            <option>Jenis Pakaian</option>
            <option>Kebaya & Tradisional</option>
            <option>Pakaian Formal</option>
            <option>Seragam Kerja</option>
            <option>Gaun Pengantin</option>
          </select>
          
          <select className="px-6 py-4 bg-white text-dark-bg text-sm outline-none border-b md:border-b-0 md:border-r border-border-light cursor-pointer">
            <option>Metode Layanan</option>
            <option>Penjahit ke Rumah</option>
            <option>Datang ke Lokasi</option>
          </select>
          
          <button className="bg-primary text-white px-10 py-4 font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
            <Search className="w-5 h-5" />
            <span>Cari</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
