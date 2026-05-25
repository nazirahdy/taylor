import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ArrowLeft, CheckCircle2, Home, Store, Calendar as CalendarIcon, Save, UploadCloud, MapPin, ExternalLink, Clock } from 'lucide-react';

const StepIndicator = ({ step, metode }) => {
    const activeSteps = [
        { num: 1, label: 'Layanan', icon: <Home className="w-5 h-5" /> },
        { num: 2, label: 'Desain', icon: <UploadCloud className="w-5 h-5" /> },
        ...(metode === 'home_service' ? [{ num: 3, label: 'Lokasi', icon: <MapPin className="w-5 h-5" /> }] : []),
        { num: 4, label: 'Jadwal', icon: <CalendarIcon className="w-5 h-5" /> },
        { num: 5, label: 'Konfirmasi', icon: <CheckCircle2 className="w-5 h-5" /> }
    ];

    const activeStepIndex = activeSteps.findIndex(s => s.num === step);
    const progressWidth = activeSteps.length > 1 ? (activeStepIndex / (activeSteps.length - 1)) * 100 : 0;

    return (
        <div className="flex items-center justify-between relative mb-20">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary -z-10 transition-all duration-700" style={{ width: `${progressWidth}%` }}></div>
            
            {activeSteps.map(s => (
                <div key={s.num} className="flex flex-col items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                        step >= s.num ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-surface border-border text-text-muted'
                    }`}>
                        {s.icon}
                    </div>
                    <span className={`text-[11px] font-sans font-bold uppercase tracking-widest hidden sm:block ${step >= s.num ? 'text-primary' : 'text-text-muted'}`}>{s.label}</span>
                </div>
            ))}
        </div>
    );
};

const OrderForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        if (user && (!user.phone_wa || !user.alamat)) {
            navigate('/complete-profile');
        }
    }, [user, navigate]);

    const [step, setStep] = useState(location.state?.method ? 2 : 1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        metode: location.state?.method || '',
        tanggal: '',
        catatan: location.state?.galleryItem ? `Pemesanan model: ${location.state.galleryItem.title}. ` : '',
        alamat_kunjungan: user?.alamat || '',
        gallery_image_path: location.state?.galleryItem?.image_path || '',
    });
    
    const [designFile, setDesignFile] = useState(null);
    const [designPreview, setDesignPreview] = useState(null);
    const [mapsVerified, setMapsVerified] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    const [globalDpAmount, setGlobalDpAmount] = useState(150000);
    const [dpProofFile, setDpProofFile] = useState(null);
    const [dpProofPreview, setDpProofPreview] = useState(null);

    const [selectedGalleryItem, setSelectedGalleryItem] = useState(location.state?.galleryItem || null);
    const [galleryList, setGalleryList] = useState([]);

    const [dates, setDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [fullDateModal, setFullDateModal] = useState(null);

    useEffect(() => {
        if (location.state?.method && !formData.metode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData((prev) => ({ ...prev, metode: location.state.method }));
        }
    }, [location.state, formData.metode]);

    const fetchQuotas = (m, y) => {
        axios.get(`/quota?month=${m}&year=${y}`)
            .then(res => setDates(res.data?.data || res.data || []))
            .catch(err => console.error("Gagal mengambil kuota", err));
    };

    useEffect(() => {
        fetchQuotas(currentMonth, currentYear);

        axios.get('/gallery')
            .then(res => setGalleryList(res.data?.data || res.data || []))
            .catch(err => console.error("Gagal mengambil galeri", err));

        axios.get('/home-service-settings')
            .then(res => {
                if (res.data?.data?.dp_amount) {
                    setGlobalDpAmount(res.data.data.dp_amount);
                }
            })
            .catch(err => console.error("Gagal mengambil pengaturan DP", err));
    }, [currentMonth, currentYear]);

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handlePrevMonth = () => {
        const now = new Date();
        if (currentYear === now.getFullYear() && currentMonth === (now.getMonth() + 1)) {
            return; // Don't go to past months
        }

        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleDesignFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar (JPG, JPEG, PNG).');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran gambar tidak boleh lebih dari 2MB.');
            return;
        }

        setDesignFile(file);
        setDesignPreview(URL.createObjectURL(file));
    };

    const handleDpFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar (JPG, JPEG, PNG).');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            alert('Ukuran gambar tidak boleh lebih dari 4MB.');
            return;
        }

        setDpProofFile(file);
        setDpProofPreview(URL.createObjectURL(file));
    };

    const handleVerifyMaps = () => {
        if (!formData.alamat_kunjungan) {
            alert("Harap masukkan alamat kunjungan terlebih dahulu.");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setMapsVerified(true);
            alert("Koordinat GPS berhasil diverifikasi oleh Google Maps! 🟢");
        }, 1500);
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.metode) return alert("Pilih metode layanan terlebih dahulu.");
            setStep(2);
            return;
        }
        if (step === 2) {
            if (!formData.catatan || formData.catatan.length < 5) return alert("Deskripsikan catatan desain minimal 5 karakter.");
            if (formData.metode === 'visit') {
                setStep(4);
            } else {
                setStep(3);
            }
            return;
        }
        if (step === 3) {
            if (!formData.alamat_kunjungan) return alert("Masukkan alamat lengkap kunjungan.");
            if (!mapsVerified) return alert("Harap sematkan koordinat pin Google Maps untuk alamat kunjungan.");
            setStep(4);
            return;
        }
        if (step === 4) {
            if (!formData.tanggal) return alert("Pilih tanggal jadwal kedatangan.");
            setStep(5);
            return;
        }
    };

    const prevStep = () => {
        if (step === 5) {
            setStep(4);
        } else if (step === 4) {
            if (formData.metode === 'visit') {
                setStep(2);
            } else {
                setStep(3);
            }
        } else if (step === 3) {
            setStep(2);
        } else if (step === 2) {
            setStep(1);
        }
    };
    const weekDayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const buildCalendarWeeks = (items) => {
        if (!items || items.length === 0) return [];

        const weeks = [];
        let currentRow = [];
        const firstDay = new Date(items[0].date).getDay();

        for (let i = 0; i < firstDay; i += 1) {
            currentRow.push(null);
        }

        items.forEach((item) => {
            currentRow.push(item);

            if (currentRow.length === 7) {
                weeks.push(currentRow);
                currentRow = [];
            }
        });

        while (currentRow.length < 7) {
            currentRow.push(null);
        }

        if (currentRow.some(Boolean)) {
            weeks.push(currentRow);
        }

        return weeks;
    };

    const getCalendarTitle = () => {
        const referenceDate = dates.find((d) => d.date === formData.tanggal) || dates[0];
        if (!referenceDate) return '';
        return new Date(referenceDate.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    const renderStep1 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-12">
                <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 01</span>
                <h2 className="text-4xl font-display font-bold text-text-primary">Pilih Metode Layanan</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <button 
                    onClick={() => setFormData({...formData, metode: 'home_service'})}
                    className={`p-10 text-left border rounded-[2rem] transition-all duration-500 group shadow-sm ${formData.metode === 'home_service' ? 'border-primary bg-surface ring-4 ring-primary/5' : 'border-border hover:border-primary/50 bg-white'}`}
                >
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${formData.metode === 'home_service' ? 'border-primary text-white bg-primary' : 'border-border text-text-muted bg-surface'}`}>
                        <Home className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-text-primary mb-4">Home Service</h3>
                    <p className="text-text-secondary font-body text-sm mb-8 leading-relaxed">Penjahit kami yang datang ke lokasi Anda untuk konsultasi dan pengukuran badan. Bedanya, penjahit dekat ke rumah pelanggan.</p>
                    <div className="text-[11px] uppercase tracking-widest text-primary font-bold font-sans border-t border-border pt-6">Memerlukan DP (Tanda Jadi)</div>
                </button>
                
                <button 
                    onClick={() => setFormData({...formData, metode: 'visit'})}
                    className={`p-10 text-left border rounded-[2rem] transition-all duration-500 group shadow-sm ${formData.metode === 'visit' ? 'border-primary bg-surface ring-4 ring-primary/5' : 'border-border hover:border-primary/50 bg-white'}`}
                >
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${formData.metode === 'visit' ? 'border-primary text-white bg-primary' : 'border-border text-text-muted bg-surface'}`}>
                        <Store className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-text-primary mb-4">In-Store (Kunjungan Studio)</h3>
                    <p className="text-text-secondary font-body text-sm mb-8 leading-relaxed">Datang ke studio kami untuk pengukuran langsung dan diskusi desain. Pada In-Store, pelanggan datang ke toko, bukan penjahit yang datang ke rumah.</p>
                    <div className="text-[11px] uppercase tracking-widest text-text-muted font-bold font-sans border-t border-border pt-6">Reservasi Tanpa DP</div>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-12">
                <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 02</span>
                <h2 className="text-4xl font-display font-bold text-text-primary mb-3">Visi Desain & Referensi</h2>
                <p className="text-text-secondary font-body text-sm max-w-lg mx-auto">Deskripsikan keinginan model baju Anda dan unggah gambar referensi jika ada.</p>
            </div>

            <div className="mb-10 max-w-xl mx-auto">
                <label className="text-text-secondary text-sm font-bold mb-3 block">Deskripsi Visi Desain Anda</label>
                <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                    rows={6}
                    placeholder="Tuliskan inspirasi model baju, bahan kain, warna, atau detail lain yang Anda inginkan..."
                    className="w-full rounded-3xl border border-border px-5 py-4 text-text-primary bg-white focus:border-primary focus:outline-none resize-none font-body text-sm shadow-sm"
                />
                <p className="text-[11px] text-text-muted mt-3">Deskripsikan keinginan desain minimal 5 karakter agar penjahit bisa menyiapkan lebih baik.</p>
            </div>

            <div className="mb-10 max-w-xl mx-auto">
                {selectedGalleryItem ? (
                    <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm">
                        <span className="text-primary text-[10px] uppercase tracking-widest block mb-4 font-bold font-sans">Desain Terpilih dari Galeri</span>
                        <div className="flex gap-6 items-center">
                            <img 
                                src={selectedGalleryItem.image_path.includes('http') ? selectedGalleryItem.image_path : `http://localhost:8000/storage/${selectedGalleryItem.image_path}`} 
                                alt={selectedGalleryItem.title} 
                                className="w-24 h-32 object-cover rounded-2xl border border-border shadow-md"
                            />
                            <div className="flex-grow">
                                <h4 className="font-display font-bold text-xl text-text-primary mb-2">{selectedGalleryItem.title}</h4>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] uppercase tracking-widest font-bold rounded-lg font-sans">
                                    {selectedGalleryItem.category || 'Koleksi Eksklusif'}
                                </span>
                                {(!location.state?.galleryItem) && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setSelectedGalleryItem(null);
                                            setFormData(prev => ({ ...prev, gallery_image_path: '' }));
                                        }} 
                                        className="block mt-4 text-[11px] text-red-500 font-bold uppercase tracking-widest hover:underline"
                                    >
                                        Ganti Pilihan Desain
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="border border-border rounded-[2rem] p-8 bg-white shadow-sm">
                            <span className="text-[11px] uppercase tracking-widest text-text-muted block mb-4 font-bold font-sans">Pilihan A: Unggah Gambar Referensi Sendiri</span>
                            <div className="flex flex-col items-center">
                                <label className={`w-full border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${designPreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface'}`}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleDesignFileChange} 
                                    />
                                    {designPreview ? (
                                        <img src={designPreview} alt="Referensi Desain" className="max-h-48 object-contain rounded-xl border border-border shadow-md" />
                                    ) : (
                                        <div className="flex flex-col items-center text-text-muted">
                                            <UploadCloud className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest font-sans text-text-primary">Pilih Gambar Referensi</span>
                                            <span className="text-[9px] uppercase tracking-widest font-sans mt-1">JPG, PNG (Maks. 2MB)</span>
                                        </div>
                                    )}
                                </label>
                                {designFile && (
                                    <button type="button" onClick={() => { setDesignFile(null); setDesignPreview(null); }} className="text-xs text-red-500 mt-3 font-bold uppercase tracking-widest hover:underline">Hapus Gambar</button>
                                )}
                            </div>
                        </div>

                        <div className="border border-border rounded-[2rem] p-8 bg-white shadow-sm">
                            <span className="text-[11px] uppercase tracking-widest text-text-muted block mb-4 font-bold font-sans">Pilihan B: Pilih dari Galeri Era Jahit</span>
                            {galleryList.length === 0 ? (
                                <p className="text-xs text-text-muted italic">Memuat galeri karya...</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto pr-2">
                                    {galleryList.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedGalleryItem(item);
                                                setFormData(prev => ({ ...prev, gallery_image_path: item.image_path }));
                                                setDesignFile(null);
                                                setDesignPreview(null);
                                            }}
                                            className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-surface hover:border-primary transition-all text-left"
                                        >
                                            <img 
                                                src={item.image_path.includes('http') ? item.image_path : `http://localhost:8000/storage/${item.image_path}`} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                <span className="text-[9px] text-white font-sans font-bold uppercase truncate w-full">{item.title}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-12">
                <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 03</span>
                <h2 className="text-4xl font-display font-bold text-text-primary mb-3">Lokasi Kunjungan</h2>
                <p className="text-text-secondary font-body text-sm max-w-lg mx-auto">Tentukan alamat lengkap untuk sesi kunjungan Home Service kami.</p>
            </div>
            
            {formData.metode === 'home_service' && (
                <div className="mb-12 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 bg-white p-8 border border-border rounded-[2rem] shadow-sm">
                    <h3 className="font-display font-bold text-lg text-text-primary mb-2 flex items-center gap-3">
                        <span className="w-6 h-[2px] bg-primary"></span> Detail Lokasi Kunjungan
                    </h3>

                    <div>
                        <label className="text-text-secondary text-sm font-bold mb-3 block">Alamat Kunjungan Lengkap (Wajib Valid)</label>
                        <textarea
                            value={formData.alamat_kunjungan}
                            onChange={(e) => setFormData({...formData, alamat_kunjungan: e.target.value})}
                            rows={3}
                            placeholder="Jl. Raya Utama No. 1 RT 02/03, Kel. Suka Jaya, Kec. Raya..."
                            className="w-full rounded-2xl border border-border px-5 py-4 text-text-primary bg-white focus:border-primary focus:outline-none resize-none font-body text-sm"
                        />
                    </div>

                    <div className="bg-surface border border-border p-6 rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block">Status Pin GPS</span>
                                <span className={`text-xs font-bold flex items-center gap-2 ${mapsVerified ? 'text-green-600' : 'text-red-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${mapsVerified ? 'bg-green-600 animate-ping' : 'bg-red-500'}`}></span>
                                    {mapsVerified ? 'Koordinat Terverifikasi Google Maps' : 'Belum Tersemat Pin Peta'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleVerifyMaps}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border ${mapsVerified ? 'bg-green-50 border-green-200 text-green-700' : 'bg-primary text-white border-primary hover:bg-primary-dark shadow-md'}`}
                            >
                                {mapsVerified ? 'Ubah Pin Maps' : 'Sematkan Pin Google Maps'}
                            </button>
                        </div>
                        {mapsVerified && (
                            <div className="w-full h-40 rounded-xl bg-gray-200 overflow-hidden relative border border-border shadow-inner animate-in zoom-in-95 duration-500">
                                <iframe 
                                    title="Google Maps Mockup"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.044941919598!2d106.8202026!3d-6.2087634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNSJTIDEwNsKwNDknMTIuNyJF!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid" 
                                    className="w-full h-full border-0 grayscale opacity-80"
                                    allowFullScreen="" 
                                    loading="lazy"
                                ></iframe>
                                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                                <div className="absolute bottom-2 left-2 bg-text-primary/80 text-[10px] text-white/90 px-2 py-1 rounded font-mono">
                                    Lat: -6.20876, Lng: 106.82020 (GPS OK)
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-12">
                <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 04</span>
                <h2 className="text-4xl font-display font-bold text-text-primary mb-3">Jadwal Pertemuan</h2>
                <p className="text-text-secondary font-body text-sm max-w-lg mx-auto">Pilih tanggal yang tersedia untuk sesi desain utama atau pengukuran.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-surface rounded-[2rem] border border-border p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-text-primary">Kalender Jadwal Kuota</h3>
                        <p className="text-text-muted text-sm">Pilih tanggal yang tersedia untuk pertemuan.</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden">
                            <button 
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-surface border-r border-border transition-colors text-text-primary disabled:opacity-30"
                                disabled={currentYear === new Date().getFullYear() && currentMonth === (new Date().getMonth() + 1)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button 
                                type="button"
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-surface transition-colors text-text-primary"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <span className="block text-[11px] uppercase tracking-widest text-text-muted font-bold">Bulan</span>
                            <span className="text-lg font-bold text-text-primary">{getCalendarTitle()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.15em] text-text-muted font-bold mb-3">
                    {weekDayLabels.map((day) => (
                        <div key={day} className="py-2">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {buildCalendarWeeks(dates).map((week, weekIndex) => (
                        <React.Fragment key={weekIndex}>
                            {week.map((d, dayIndex) => (
                                <button
                                    key={`${weekIndex}-${dayIndex}`}
                                    type="button"
                                    disabled={!d}
                                    onClick={() => {
                                        if (!d) return;
                                        if (d.is_past) {
                                            setFullDateModal({ date: d.date, type: 'past' });
                                            return;
                                        }
                                        if (d.is_closure) {
                                            setFullDateModal({ date: d.date, type: 'closure' });
                                            return;
                                        }
                                        if (d.disabled) {
                                            setFullDateModal({ date: d.date, type: 'full' });
                                            return;
                                        }
                                        setFormData({...formData, tanggal: d.date});
                                    }}
                                    className={`min-h-[110px] flex flex-col items-center justify-between rounded-3xl border p-4 text-left transition-all duration-500 ${
                                        !d ? 'bg-transparent border-transparent cursor-default' : (d.is_past || d.disabled || d.is_closure) ? 'bg-surface border-border opacity-70 cursor-pointer hover:border-primary/50' : formData.tanggal === d.date ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-border hover:border-primary/50 text-text-primary shadow-sm'
                                    }`}
                                >
                                    {d ? (
                                        <>
                                            <span className="text-[11px] uppercase tracking-widest font-bold font-sans">{d.day}</span>
                                            <span className="text-3xl font-display font-bold my-2">{d.num}</span>
                                            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${d.is_past ? 'bg-gray-100 text-gray-500 border border-gray-200' : d.is_closure ? 'bg-amber-50 text-amber-600 border border-amber-100' : d.disabled ? 'bg-red-50 text-red-600 border border-red-100' : formData.tanggal === d.date ? 'bg-white/20 text-white border border-white/30' : 'bg-surface border border-border text-text-muted'}`}>
                                                {d.is_past ? 'Lampau' : d.is_closure ? 'Tutup' : d.disabled ? 'Penuh' : `Sisa ${d.available_slots}`}
                                            </span>
                                        </>
                                    ) : null}
                                </button>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {fullDateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl border border-border">
                        <h3 className="text-2xl font-bold text-text-primary mb-4">
                            {fullDateModal.type === 'past' ? 'Tanggal Lampau' : 
                             fullDateModal.type === 'closure' ? 'Toko Tutup' : 'Tanggal Penuh'}
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Tanggal <span className="font-semibold">{new Date(fullDateModal.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span> {
                                fullDateModal.type === 'past' ? 'sudah terlewati dan tidak dapat dipilih.' : 
                                fullDateModal.type === 'closure' ? 'toko kami sedang tutup pada hari tersebut.' :
                                'sudah tidak tersedia karena kuota penuh.'
                            }
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFullDateModal(null)}
                                className="rounded-full border border-border px-5 py-3 text-sm font-bold text-text-primary transition hover:bg-surface"
                            >Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep5 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-12">
                <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 05</span>
                <h2 className="text-4xl font-display font-bold text-text-primary">Konfirmasi & Pembayaran DP</h2>
            </div>
            
            <div className="bg-white p-10 md:p-14 border border-border rounded-[2.5rem] max-w-3xl mx-auto shadow-sm">
                <div className="flex justify-between items-center pb-8 border-b border-border mb-8">
                    <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest font-bold">Metode Layanan</span>
                    <span className="font-display font-bold text-primary text-xl">
                        {formData.metode === 'home_service' ? 'Home Service' : 'In-Store'}
                    </span>
                </div>
                
                <div className="flex justify-between items-center pb-8 border-b border-border mb-12">
                    <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest font-bold">Tanggal Sesi</span>
                    <span className="font-display font-bold text-text-primary text-xl">
                        {new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>


                {formData.metode === 'home_service' && formData.alamat_kunjungan && (
                    <div className="flex flex-col pb-8 border-b border-border mb-12 gap-2 text-left">
                        <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest font-bold">Alamat Kunjungan</span>
                        <span className="font-body text-text-primary text-sm leading-relaxed bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm">
                            {formData.alamat_kunjungan}
                            <span className="block mt-3 text-green-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>📍 Koordinat Terverifikasi Google Maps
                            </span>
                        </span>
                    </div>
                )}

                {formData.catatan && (
                    <div className="mb-12 text-left">
                        <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest block mb-4 font-bold">Visi Desain</span>
                        <p className="bg-surface p-8 border border-border text-text-secondary font-body italic text-sm leading-relaxed rounded-[1.5rem] shadow-sm">{formData.catatan}</p>
                    </div>
                )}

                {designPreview && (
                    <div className="mb-12 text-left">
                        <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest block mb-4 font-bold">Referensi Gambar Desain</span>
                        <div className="bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm inline-block">
                            <img src={designPreview} alt="Referensi Desain" className="max-h-48 object-contain rounded-xl" />
                        </div>
                    </div>
                )}

                {selectedGalleryItem && (
                    <div className="mb-12 text-left">
                        <span className="text-text-muted font-sans text-[11px] uppercase tracking-widest block mb-4 font-bold">Referensi Desain dari Galeri</span>
                        <div className="bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm inline-block">
                            <img 
                                src={selectedGalleryItem.image_path.includes('http') ? selectedGalleryItem.image_path : `http://localhost:8000/storage/${selectedGalleryItem.image_path}`} 
                                alt={selectedGalleryItem.title} 
                                className="max-h-48 object-contain rounded-xl" 
                            />
                        </div>
                    </div>
                )}

                {formData.metode === 'home_service' && (
                    <div className="border border-primary/20 bg-primary/5 rounded-[2rem] p-8 md:p-10 mb-12 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6 border-b border-primary/10 pb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold">Rp</div>
                            <div>
                                <h3 className="font-display font-bold text-lg text-text-primary">Pembayaran DP Home Service</h3>
                                <p className="text-xs text-text-muted">Jaminan pesanan kunjungan alamat oleh penjahit</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Transfer Bank Mandiri</span>
                                <span className="text-text-primary font-mono font-bold text-lg tracking-wider block">123-00-0987654-1</span>
                                <span className="text-xs text-text-muted block mt-1">a/n Era Jahit Studio</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Jumlah DP yang Harus Dibayar</span>
                                <span className="text-primary font-display font-bold text-2xl block">
                                    Rp {globalDpAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6 bg-white p-6 rounded-2xl border border-primary/10">
                            <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-4">Unggah Bukti Transfer</span>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <label className="flex-1 w-full py-8 border-2 border-dashed border-border hover:border-primary rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-surface group">
                                    <UploadCloud className="w-8 h-8 text-text-muted group-hover:text-primary mb-3 transition-colors" />
                                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-primary group-hover:text-primary transition-colors">Pilih File Bukti</span>
                                    <span className="text-[10px] text-text-muted mt-2">Maksimal 4MB (JPG, PNG)</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleDpFileChange} 
                                    />
                                </label>

                                {dpProofPreview && (
                                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative border border-border bg-surface shadow-inner group">
                                        <img src={dpProofPreview} alt="Bukti Transfer DP" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <span className="text-[10px] uppercase font-bold text-white tracking-wider">Terunggah</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-3xl text-sm text-text-primary text-left">
                    Detail ukuran akan diukur oleh penjahit saat sesi. Pelanggan tidak perlu mengisi ukuran sendiri pada pemesanan ini.
                </div>
                <div className="mt-4 p-6 bg-primary/10 border border-primary/20 rounded-3xl text-sm text-text-primary text-left">
                    {formData.metode === 'home_service' ? (
                        <span>Pesanan akan dibuat dengan status <span className="font-bold">DP Menunggu Verifikasi</span>. Setelah admin memvalidasi transfer Anda, pesanan otomatis dikonfirmasi dan pengerjaan segera dimulai.</span>
                    ) : (
                        <span>Pesanan akan dibuat dengan status <span className="font-bold">Menunggu Kedatangan</span>. Silakan kunjungi studio kami pada jadwal yang Anda pilih untuk pengukuran langsung.</span>
                    )}
                </div>
            </div>
        </div>
    );

    const submitOrder = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('method', formData.metode);
            data.append('quota_date', formData.tanggal);
            data.append('design_notes', formData.catatan);
            if (formData.metode === 'home_service') {
                data.append('alamat', formData.alamat_kunjungan);
                if (dpProofFile) {
                    data.append('dp_proof', dpProofFile);
                } else {
                    setIsLoading(false);
                    alert("Harap unggah bukti transfer DP terlebih dahulu untuk menyelesaikan pemesanan Home Service.");
                    return;
                }
            }
            if (designFile) {
                data.append('design_image', designFile);
            }
            if (formData.gallery_image_path) {
                data.append('gallery_image_path', formData.gallery_image_path);
            }

            const res = await axios.post('/orders', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const order = res.data.data;
            setCreatedOrder(order);

            setTimeout(() => {
                setIsLoading(false);
                setShowSuccess(true);
            }, 1000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal membuat pesanan.");
        }
    };

    if (showSuccess) {
        if (formData.metode === 'home_service') {
            return (
                <div className="min-h-screen bg-surface py-32 flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-3xl animate-in fade-in zoom-in-95 duration-750">
                        <div className="bg-white p-12 md:p-20 rounded-[3rem] border border-border shadow-2xl text-center">
                            <div className="w-20 h-20 border-2 border-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto bg-primary/5">
                                <Clock className="w-8 h-8 text-primary animate-pulse"/>
                            </div>
                            <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Pembayaran Diterima</span>
                            <h2 className="text-4xl font-display font-bold text-text-primary mb-4">Pesanan & DP Berhasil Dikirim</h2>
                            <p className="text-text-secondary font-body text-sm max-w-md mx-auto mb-12 leading-relaxed">
                                Bukti transfer DP Anda sebesar <strong>Rp {globalDpAmount.toLocaleString('id-ID')}</strong> telah berhasil diunggah. Kami akan memvalidasi pembayaran Anda secepatnya.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8 text-left bg-surface p-10 border border-border rounded-[2rem] mb-10">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Jadwal Kunjungan</span>
                                    <span className="text-text-primary font-display font-bold text-lg block">
                                        {new Date(formData.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Nomor Pesanan</span>
                                    <span className="text-primary font-display font-bold text-xl block">
                                        EJ-{createdOrder?.order_number || createdOrder?.id}
                                    </span>
                                </div>
                            </div>

                            <div className="border border-border rounded-[2rem] p-8 text-left bg-white shadow-sm mb-12">
                                <h4 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                                    <span className="w-6 h-[2px] bg-primary"></span> Langkah Selanjutnya
                                </h4>
                                <ul className="text-text-secondary font-body text-sm space-y-4 list-decimal list-inside">
                                    <li className="leading-relaxed">Admin memvalidasi bukti transfer DP Anda dalam 1x24 jam.</li>
                                    <li className="leading-relaxed">Setelah divalidasi, pesanan Anda akan langsung berstatus <strong>Dikonfirmasi</strong>.</li>
                                    <li className="leading-relaxed">Tim desainer/penjahit Era Jahit akan berkunjung ke alamat Anda pada tanggal sesi yang dijadwalkan.</li>
                                </ul>
                            </div>

                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-5 bg-primary text-white uppercase tracking-widest text-xs font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 rounded-xl font-sans"
                            >
                                Masuk ke Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-surface py-32 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-3xl animate-in fade-in zoom-in-95 duration-750">
                    <div className="bg-white p-12 md:p-20 rounded-[3rem] border border-border shadow-2xl text-center">
                        <div className="w-20 h-20 border-2 border-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto bg-primary/5">
                            <MapPin className="w-8 h-8 text-primary animate-bounce"/>
                        </div>
                        <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Reservasi Berhasil</span>
                        <h2 className="text-4xl font-display font-bold text-text-primary mb-4">Silakan Kunjungi Studio Kami</h2>
                        <p className="text-text-secondary font-body text-sm max-w-md mx-auto mb-12 leading-relaxed">
                            Pesanan Anda telah terdaftar. Kami menunggu kedatangan Anda untuk melakukan pengukuran langsung dan diskusi detail desain.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 text-left bg-surface p-10 border border-border rounded-[2rem] mb-10">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Jadwal Sesi Anda</span>
                                <span className="text-text-primary font-display font-bold text-lg block">
                                    {new Date(formData.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="text-xs text-text-muted font-body mt-2 block">Jam Operasional: 09:00 - 17:00</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Nomor Pesanan</span>
                                <span className="text-primary font-display font-bold text-xl block">
                                    EJ-{createdOrder?.order_number || createdOrder?.id}
                                </span>
                            </div>
                        </div>

                        <div className="border border-border rounded-[2rem] overflow-hidden p-8 text-left bg-white shadow-sm mb-12">
                            <h4 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-primary"></span> Detail Alamat Studio
                            </h4>
                            <p className="text-text-secondary font-body text-sm leading-relaxed mb-6">
                                <strong>Era Jahit Studio</strong><br />
                                Jl. Kemang Raya No. 45, RT.12/RW.5, Bangka, Kec. Mampang Prapatan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12730
                            </p>
                            
                            <div className="w-full h-64 rounded-2xl bg-gray-200 overflow-hidden relative border border-border shadow-inner mb-6">
                                <iframe 
                                    title="Google Maps Studio"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1415510619864!2d106.81525041476926!3d-6.258284995470125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1a02931b643%3A0xe104cfedbd9b646c!2sJl.%20Kemang%20Raya%20No.45%2C%20RT.12%2FRW.5%2C%20Bangka%2C%20Kec.%20Mampang%20Prpt.%2C%20Kota%20Jakarta%20Selatan%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2012730!5e0!3m2!1sid!2sid!4v1620000000000!5m2!1sid!2sid" 
                                    className="w-full h-full border-0 grayscale opacity-90"
                                    allowFullScreen="" 
                                    loading="lazy"
                                ></iframe>
                                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                            </div>

                            <a 
                                href="https://www.google.com/maps/search/?api=1&query=Jl.+Kemang+Raya+No.45+Jakarta+Selatan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 border border-border hover:border-primary text-text-primary hover:text-primary transition-all flex items-center justify-center gap-3 font-sans text-xs font-bold uppercase tracking-widest rounded-xl bg-surface hover:bg-white shadow-sm"
                            >
                                Petunjuk Arah Google Maps <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-5 bg-primary text-white uppercase tracking-widest text-xs font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 rounded-xl font-sans"
                        >
                            Masuk ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface py-32">
            <div className="container mx-auto px-4 max-w-5xl">
                
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold hover:text-primary transition-all mb-16 font-sans group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> Kembali ke Dashboard
                </button>
 
                <div className="bg-white p-10 md:p-20 rounded-[3rem] border border-border shadow-2xl">
                    <StepIndicator step={step} metode={formData.metode} />
                    
                    <div className="min-h-[40vh] my-16">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </div>

                    <div className="flex justify-between items-center pt-12 border-t border-border mt-16">
                        <button 
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`px-10 py-4 uppercase tracking-widest text-[11px] font-bold transition-all border rounded-xl font-sans ${step === 1 ? 'opacity-0 cursor-default' : 'border-border text-text-muted hover:border-primary hover:text-primary hover:bg-surface'}`}
                        >
                            Tahap Sebelumnya
                        </button>
                        
                        {step < 5 ? (
                            <button 
                                onClick={nextStep}
                                className="px-12 py-5 bg-primary text-white uppercase tracking-widest text-[11px] font-bold hover:bg-primary-dark transition-all flex items-center gap-3 shadow-xl shadow-primary/20 rounded-xl font-sans"
                            >
                                Lanjutkan <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={submitOrder}
                                disabled={isLoading}
                                className="px-12 py-5 bg-text-primary text-white uppercase tracking-widest text-[11px] font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-black/10 rounded-xl font-sans disabled:opacity-50"
                            >
                                {isLoading ? "Memproses..." : <><Save className="w-5 h-5"/> Buat Pesanan Sekarang</>}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderForm;
