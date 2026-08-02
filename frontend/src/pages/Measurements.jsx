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
        lingkar_pangkal_lengan: '',
        panjang_tangan: '',
        panjang_baju: '',
        panjang_rok: '',
        lebar_dada: '',
        lebar_punggung: '',
        lebar_bahu: '',
        tinggi_badan: ''
    });

    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                const res = await axios.get('/measurements');
                if (res.data) {
                    const data = res.data.data || res.data;
                    setMeasurements({
                        ...data,
                        panjang_tangan: data.panjang_tangan ?? data.panjang_lengan ?? ''
                    });
                }
            } catch (err) {
                console.error("Gagal memuat ukuran:", err);
            }
        };
        fetchMeasurements();
    }, []);

    const fields = [
        { id: 'lingkar_badan', label: 'Lingkar Badan' },
        { id: 'lingkar_pinggang', label: 'Lingkar Pinggang' },
        { id: 'lingkar_pinggul', label: 'Lingkar Pinggul' },
        { id: 'lingkar_pangkal_lengan', label: 'Lingkar Pangkal Lengan' },
        { id: 'panjang_tangan', label: 'Panjang Tangan' },
        { id: 'panjang_baju', label: 'Panjang Baju' },
        { id: 'panjang_rok', label: 'Panjang Rok' },
        { id: 'lebar_dada', label: 'Lebar Dada' },
        { id: 'lebar_punggung', label: 'Lebar Punggung' },
        { id: 'lebar_bahu', label: 'Lebar Bahu' },
        { id: 'tinggi_badan', label: 'Tinggi Badan' },
    ];

    return (
        <div className="min-h-screen bg-white text-text-primary flex items-center justify-center pt-24 pb-10 px-4">
            <div className="container mx-auto max-w-4xl">
                
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-4 font-sans">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <span className="text-primary uppercase tracking-[0.4em] text-[11px] font-bold mb-2 block font-sans">Data Fisik</span>
                    <h1 className="text-3xl md:text-2xl font-display font-bold text-text-primary mb-2">Ukuran Badan</h1>
                    <p className="text-sm text-text-secondary font-body">Data ukuran badan yang tersimpan dari hasil pengukuran di Era Jahit</p>
                </div>

                <div className="bg-surface border border-border p-5 md:p-8 rounded-[1.5rem] shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                <Ruler className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display font-bold text-text-primary">Data Pengukuran</h2>
                                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold font-sans mt-0.5">Satuan Centimeter (CM)</p>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <span className="text-[10px] text-text-muted uppercase tracking-widest font-sans font-bold">Dikelola oleh Admin</span>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 leading-relaxed font-body">
                            <strong className="block mb-1 text-amber-900">Informasi Ukuran Badan:</strong>
                            Seluruh data ukuran badan Anda dikelola secara eksklusif oleh pihak Penjahit Era Jahit untuk menjamin presisi pakaian. Pelanggan tidak dapat mengubah data ini secara mandiri. Hubungi kami jika ada perubahan ukuran fisik
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                        {fields.map((field) => {
                            const value = measurements[field.id];
                            const hasVal = value !== undefined && value !== null && value !== '' && !isNaN(parseFloat(value));
                            return (
                                <div key={field.id} className="p-3.5 bg-white border border-border/80 rounded-xl hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col items-start gap-1.5 group">
                                    <div className="w-7 h-7 bg-surface border border-border/60 rounded-md flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                        <Ruler className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5 font-sans leading-tight">{field.label}</span>
                                        <span className={`text-sm font-display font-bold ${hasVal ? 'text-text-primary' : 'text-text-muted/60 italic text-xs'}`}>
                                            {hasVal ? `${parseFloat(value)} cm` : 'Belum diukur'}
                                        </span>
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
