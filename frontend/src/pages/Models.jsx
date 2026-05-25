import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ruler, ShoppingBag, X, Check, Loader2, Info, Star } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const Models = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        measurements: {
            size: 'L',
            dada: '',
            pinggang: '',
            panjang: ''
        },
        notes: ''
    });

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await axios.get('/models');
                setModels(res.data?.data || res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const handleOrder = async (e) => {
        e.preventDefault();
        if (!user) return alert('Silakan login terlebih dahulu untuk memesan.');

        setIsSubmitting(true);
        try {
            const res = await axios.post('http://localhost:8001/api/orders', {
                fashion_model_id: selectedModel.id,
                measurements: formData.measurements,
                notes: formData.notes
            });

            // Open WA link in new tab
            window.open(res.data.whatsapp_link, '_blank');
            setSelectedModel(null);
            alert('Pesanan berhasil dibuat! Anda akan dialihkan ke WhatsApp untuk konfirmasi.');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal membuat pesanan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
        </div>
    );

    return (
        <div className="bg-surface/50 min-h-screen py-20">
            <div className="container mx-auto px-4">
                <header className="text-center mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-display font-black tracking-tight mb-4"
                    >
                        Katalog <span className="text-accent italic">Eksklusif.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 max-w-xl mx-auto font-medium"
                    >
                        Pilih model favorit Anda dan sesuaikan dengan ukuran tubuh Anda untuk hasil yang sempurna.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {models.map((model) => (
                        <motion.div
                            key={model.id}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 border border-gray-100 group"
                        >
                            <div className="relative h-96 overflow-hidden">
                                <img
                                    src={(model.image_url || '').replace('http://localhost/storage', 'http://localhost:8000/storage')}
                                    alt={model.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <button
                                        onClick={() => setSelectedModel(model)}
                                        className="w-full bg-white text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all scale-90 group-hover:scale-100 transition-transform duration-500"
                                    >
                                        Pesan Model Ini
                                    </button>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-display font-bold mb-2">{model.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{model.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-accent">Estimasi Rp300k+</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Order Modal */}
            <AnimatePresence>
                {selectedModel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedModel(null)}
                            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
                        >
                            <div className="md:w-1/2 bg-gray-100 h-64 md:h-auto">
                                <img
                                    src={(selectedModel.image_url || '').replace('http://localhost/storage', 'http://localhost:8000/storage')}
                                    alt={selectedModel.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:w-1/2 p-8 md:p-12 h-[80vh] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedModel(null)}
                                    className="absolute top-6 right-6 p-2 bg-surface rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>

                                <h2 className="text-3xl font-display font-black mb-2">Pesan {selectedModel.name}</h2>
                                <p className="text-gray-500 mb-8 border-l-4 border-l-accent pl-4">Silakan lengkapi detail ukuran Anda.</p>

                                <form onSubmit={handleOrder} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-gray-400">Pilih Size</label>
                                            <select
                                                className="w-full bg-surface border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-accent"
                                                value={formData.measurements.size}
                                                onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, size: e.target.value } })}
                                            >
                                                <option>S</option>
                                                <option>M</option>
                                                <option>L</option>
                                                <option>XL</option>
                                                <option>Custom</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-gray-400">Lingkar Dada (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-surface border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-accent"
                                                placeholder="Contoh: 110"
                                                required
                                                onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, dada: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-gray-400">Lingkar Pinggang (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-surface border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-accent"
                                                placeholder="Contoh: 90"
                                                required
                                                onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, pinggang: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-gray-400">Panjang Baju (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-surface border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-accent"
                                                placeholder="Contoh: 75"
                                                required
                                                onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, panjang: e.target.value } })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-gray-400">Catatan Khusus</label>
                                        <textarea
                                            className="w-full bg-surface border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-accent h-32"
                                            placeholder="Contoh: Tambahkan 2 kantong dada..."
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="bg-accent/5 p-6 rounded-2xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-accent mt-1" />
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            Pesanan Anda akan diverifikasi oleh tim Era Jahit. Anda akan dialihkan ke WhatsApp untuk tahap pembayaran DP.
                                        </p>
                                    </div>

                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                                        Kirim Pesanan Sekarang
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper components

export default Models;
