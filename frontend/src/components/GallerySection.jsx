import React, { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STORAGE_URL } from '../config';

const GallerySection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const handleImageClick = (item) => {
        setSelectedImage(item);
        setCurrentPhotoIndex(0);
    };

    const allPhotos = selectedImage ? (selectedImage.images && selectedImage.images.length > 0 ? selectedImage.images : [selectedImage.image_path]) : [];

    const nextPhoto = (e) => {
        e.stopPropagation();
        setCurrentPhotoIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1));
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        setCurrentPhotoIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1));
    };

    const handleOrderClick = () => {
        if (user) {
            navigate('/pesanan/buat', { state: { galleryItem: selectedImage } });
        } else {
            navigate('/register');
        }
    };

    const categories = ['Semua', ...new Set(models.map(m => m.kategori || m.category || 'Eksklusif'))];
    const PREVIEW_LIMIT = 4;

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

    const handleCategoryClick = (cat) => {
        setActiveFilter(cat);
        navigate('/gallery', { state: { category: cat } });
    };

    const filteredModels = (activeFilter === 'Semua'
        ? models
        : models.filter(m => (m.kategori || m.category || 'Eksklusif') === activeFilter)
    ).slice(0, PREVIEW_LIMIT);

    return (
        <section className="bg-white py-25 scroll-mt-8" id="gallery">
            <div className="container mx-auto px-4 md:px-12 text-center mb-6 animate-fade-in">
                <span className="text-primary uppercase tracking-[0.2em] text-[13px] font-bold mb-6 block">Portofolio Kami</span>
                <h2 className="text-3xl md:text-3xl font-display font-bold mb-8 leading-tight text-text-primary">Galeri Karya</h2>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed font-body">
                    Jelajahi koleksi busana pilihan dari Era Jahit. 
                    Setiap karya mencerminkan dedikasi kami pada kualitas dan keindahan.
                </p>
            </div>

            <div className="container mx-auto px-4 md:px-12">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 animate-fade-in">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
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
                    <div className="w-full flex flex-col items-center justify-center py-8 text-text-muted gap-6">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-sans uppercase tracking-[0.4em] text-[11px] font-bold">Memuat Koleksi...</p>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-8 text-text-muted bg-surface border border-dashed border-border rounded-[1.5rem]">
                        <p className="font-body italic text-sm tracking-widest">Belum ada karya untuk kategori ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {filteredModels.map((item, i) => (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-[1.5rem] bg-surface p-4 border border-border cursor-zoom-in aspect-[4/5] animate-slide-up shadow-sm hover:shadow-2xl transition-all duration-700"
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => handleImageClick(item)}
                            >
                                <img
                                    src={(item.images && item.images.length > 0 ? item.images[0] : item.image_path || '').includes('http') ? (item.images && item.images.length > 0 ? item.images[0] : item.image_path) : `${STORAGE_URL}/${item.images && item.images.length > 0 ? item.images[0] : item.image_path}`}
                                    alt={item.title || 'Koleksi Era Jahit'}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover rounded-[1.5rem] transition-all duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/90 via-text-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
                                    <div className="translate-y-8 group-hover:translate-y-0 transition-all duration-700">
                                        <span className="text-primary text-[10px] uppercase tracking-widest mb-1 block font-bold font-sans">{item.category || 'Koleksi Eksklusif'}</span>
                                        <h3 className="text-white text-3xl font-display font-bold mb-2">{item.title || `Galeri ${item.id}`}</h3>
                                        <div className="flex items-center gap-3 text-white/70 text-[11px] uppercase tracking-widest font-bold font-sans">
                                            <Maximize2 className="w-4 h-4 text-primary" /> Lihat Detail
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-10">
                    <button
                        onClick={() => navigate('/gallery')}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white uppercase tracking-widest text-[11px] font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                    >
                        Lihat Semua Koleksi <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-text-primary/40 backdrop-blur-md cursor-zoom-out animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-white border border-border rounded-[1.75rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] cursor-default overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className="w-full md:w-3/5 h-[40vh] md:h-auto bg-text-primary/5 relative group/modal">
                            <img
                                src={(allPhotos[currentPhotoIndex] || '').includes('http') ? allPhotos[currentPhotoIndex] : `${STORAGE_URL}/${allPhotos[currentPhotoIndex]}`}
                                alt={selectedImage.title || 'Preview'}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain transition-opacity duration-300"
                            />
                            
                            {allPhotos.length > 1 && (
                                <>
                                    <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/modal:opacity-100 transition-all z-10 border border-border">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/modal:opacity-100 transition-all z-10 border border-border">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md">
                                        {allPhotos.map((_, idx) => (
                                            <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white w-5' : 'bg-white/60 cursor-pointer hover:bg-white/80'}`} onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col relative bg-white">
                            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 w-12 h-12 bg-surface text-text-muted flex items-center justify-center rounded-xl hover:bg-primary hover:text-white transition-all border border-border group">
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                            
                            <div className="mt-4 mb-auto">
                                <span className="text-primary text-[11px] uppercase tracking-[0.4em] block mb-2 font-bold font-sans">{selectedImage.category || 'Koleksi Eksklusif'}</span>
                                <h3 className="text-2xl font-display font-bold mb-4 leading-tight text-text-primary">{selectedImage.title || `Galeri ${selectedImage.id}`}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed mb-8 font-body">
                                    {selectedImage.description || 'Sebuah karya busana premium yang memadukan desain kontemporer dengan keahlian jahit tradisional untuk menghadirkan tampilan yang elegan dan berkesan.'}
                                </p>
                            </div>
                            
                            <div className="mt-8">
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
