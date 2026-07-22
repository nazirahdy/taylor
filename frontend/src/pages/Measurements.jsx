import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Ruler, ArrowLeft } from 'lucide-react';

const Measurements = () => {
    const navigate = useNavigate();
    
    const [measurements, setMeasurements] = useState({
        lingkar_badan: '',
        lingkar_pinggang: '',
        lingkar_pinggul: '',
        panjang_baju: '',
        panjang_lengan: '',
        lebar_bahu: '',
        panjang_rok: '',
        tinggi_badan: ''
    });

    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                const res = await axios.get('/measurements');
                if (res.data) {
                    setMeasurements(res.data.data || res.data);
                }
            } catch (err) {
                console.error("Gagal memuat ukuran:", err);
            }
        };
        fetchMeasurements();
    }, []);

    return (
        <div className="min-h-screen bg-white text-text-primary py-32">
            <div className="container mx-auto px-4 max-w-4xl">
                
                <div className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-8 font-sans">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Data Fisik</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">Ukuran Badan</h1>
                    <p className="text-text-secondary font-body">Data ukuran badan yang tersimpan dari hasil pengukuran di Era Jahit.</p>
                </div>

                <div className="bg-surface border border-border p-8 md:p-14 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center justify-between mb-12 border-b border-border pb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                <Ruler className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-text-primary">Data Pengukuran</h2>
                                <p className="text-[11px] text-text-muted uppercase tracking-[0.2em] font-bold font-sans mt-1">Satuan Centimeter (CM)</p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <span className="text-[11px] text-text-muted uppercase tracking-widest font-sans font-bold">Dikelola oleh Admin</span>
                        </div>
                    </div>

                    <div className="mb-10 p-6 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 leading-relaxed font-body">
                            <strong className="block mb-2 text-amber-900">Informasi Ukuran Badan:</strong>
                            Seluruh data ukuran badan Anda dikelola secara eksklusif oleh pihak Penjahit Era Jahit untuk menjamin presisi pakaian. Pelanggan tidak dapat mengubah data ini secara mandiri. Hubungi kami jika ada perubahan ukuran fisik.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { id: 'lingkar_badan', label: 'Lingkar Badan' },
                            { id: 'lingkar_pinggang', label: 'Lingkar Pinggang' },
                            { id: 'lingkar_pinggul', label: 'Lingkar Pinggul' },
                            { id: 'panjang_baju', label: 'Panjang Baju' },
                            { id: 'panjang_lengan', label: 'Panjang Lengan' },
                            { id: 'lebar_bahu', label: 'Lebar Bahu' },
                            { id: 'panjang_rok', label: 'Panjang Rok / Celana' },
                            { id: 'tinggi_badan', label: 'Tinggi Badan' },
                        ].map((field) => {
                            const value = measurements[field.id];
                            const hasVal = value !== undefined && value !== null && value !== '' && !isNaN(parseFloat(value));
                            return (
                                <div key={field.id} className="p-6 bg-white border border-border/80 rounded-2xl hover:shadow-md hover:border-primary/20 transition-all duration-300 flex items-center justify-between group">
                                    <div>
                                        <span className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 font-sans">{field.label}</span>
                                        <span className={`text-2xl font-display font-bold ${hasVal ? 'text-text-primary' : 'text-text-muted/60 italic text-lg'}`}>
                                            {hasVal ? `${parseFloat(value)} cm` : 'Belum diukur'}
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 bg-surface border border-border/60 rounded-xl flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                        <Ruler className="w-5 h-5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Measurements;
