import React, { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, Maximize2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GallerySection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [selectedImage, setSelectedImage] = useState(null);

    const handleOrderClick = () => {
        if (user) {
            navigate('/pesanan/buat', { state: { galleryItem: selectedImage } });
        } else {
            navigate('/register');
        }
    };

    const categories = ['Semua', ...new Set(models.map(m => m.kategori || m.category || 'Eksklusif'))];

    useEffect(() => {
        const fetchGallery = async () => {
            setLoading(true);
            try {
                const res = await axios.get('/gallery');
                setModels(res.data?.data || res.data || []);
            } catch (error) {
                console.error("Gagal memuat galeri:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const filteredModels = activeFilter === 'Semua' 
        ? models 
        : models.filter(m => (m.kategori || m.category || 'Eksklusif') === activeFilter);

    return (
        <section className="bg-white py-32" id="gallery">
            <div className="container mx-auto px-4 md:px-12 text-center mb-20 animate-fade-in">
                <span className="text-primary uppercase tracking-[0.2em] text-[13px] font-bold mb-6 block">Portofolio Kami</span>
                <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight text-text-primary">Galeri Karya</h2>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed font-body">
                    Jelajahi koleksi busana pilihan dari Era Jahit. 
                    Setiap karya mencerminkan dedikasi kami pada kualitas dan keindahan.
                </p>
            </div>

            <div className="container mx-auto px-4 md:px-12">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-24 animate-fade-in">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-8 py-3 rounded-xl text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-500 border ${
                                activeFilter === cat 
                                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' 
                                : 'bg-surface text-text-muted border-border hover:border-primary hover:text-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="w-full flex flex-col items-center justify-center py-40 text-text-muted gap-6">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-sans uppercase tracking-[0.4em] text-[11px] font-bold">Memuat Koleksi...</p>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-40 text-text-muted bg-surface border border-dashed border-border rounded-[2rem]">
                        <p className="font-body italic text-sm tracking-widest">Belum ada karya untuk kategori ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredModels.map((item, i) => (
                            <div 
                                key={item.id} 
                                className="group relative overflow-hidden rounded-[2rem] bg-surface p-4 border border-border cursor-zoom-in aspect-[4/5] animate-slide-up shadow-sm hover:shadow-2xl transition-all duration-700" 
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => setSelectedImage(item)}
                            >
                                    <img 
                                    src={(item.image_path || '').includes('http') ? item.image_path : `http://localhost:8000/storage/${item.image_path}`} 
                                    alt={item.title || 'Koleksi Era Jahit'} 
                                    className="w-full h-full object-cover rounded-[1.5rem] transition-all duration-1000 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/90 via-text-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-12">
                                    <div className="translate-y-8 group-hover:translate-y-0 transition-all duration-700">
                                        <span className="text-primary text-[10px] uppercase tracking-widest mb-3 block font-bold font-sans">{item.category || 'Koleksi Eksklusif'}</span>
                                        <h3 className="text-white text-3xl font-display font-bold mb-6">{item.title || `Galeri ${item.id}`}</h3>
                                        <div className="flex items-center gap-3 text-white/70 text-[11px] uppercase tracking-widest font-bold font-sans">
                                            <Maximize2 className="w-4 h-4 text-primary" /> Lihat Detail
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-text-primary/40 backdrop-blur-md cursor-zoom-out animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-white border border-border rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] cursor-default overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-surface relative">
                            <img 
                                src={(selectedImage.image_path || '').includes('http') ? selectedImage.image_path : `http://localhost:8000/storage/${selectedImage.image_path}`} 
                                alt={selectedImage.title || 'Preview'} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        
                        <div className="w-full md:w-2/5 p-10 md:p-14 flex flex-col relative bg-white">
                            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 w-12 h-12 bg-surface text-text-muted flex items-center justify-center rounded-xl hover:bg-primary hover:text-white transition-all border border-border group">
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                            
                            <div className="mt-4 mb-auto">
                                <span className="text-primary text-[11px] uppercase tracking-[0.4em] block mb-6 font-bold font-sans">{selectedImage.category || 'Koleksi Eksklusif'}</span>
                                <h3 className="text-4xl font-display font-bold mb-10 leading-tight text-text-primary">{selectedImage.title || `Galeri ${selectedImage.id}`}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed mb-12 font-body">
                                    {selectedImage.description || 'Sebuah karya busana premium yang memadukan desain kontemporer dengan keahlian jahit tradisional untuk menghadirkan tampilan yang elegan dan berkesan.'}
                                </p>
                            </div>
                            
                            <div className="mt-16">
                                <button onClick={handleOrderClick} className="w-full flex items-center justify-center gap-4 py-5 bg-primary text-white uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                                    Pesan Busana Ini <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;
