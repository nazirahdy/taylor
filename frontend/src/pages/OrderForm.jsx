import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { STORAGE_URL } from '../config';
import { ChevronRight, ArrowLeft, CheckCircle2, Home, Store, Calendar as CalendarIcon, Save, UploadCloud, MapPin, ExternalLink, Clock, Search, X, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';


const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const MapViewUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, 15, { animate: true });
        }
    }, [center, map]);
    return null;
};

const StepIndicator = ({ step, metode }) => {
    
    const allSteps = metode === 'home_service'
        ? [
            { num: 1, label: 'Layanan', icon: <Home className="w-5 h-5" /> },
            { num: 2, label: 'Desain', icon: <UploadCloud className="w-5 h-5" /> },
            { num: 3, label: 'Lokasi', icon: <MapPin className="w-5 h-5" /> },
            { num: 4, label: 'Jadwal', icon: <CalendarIcon className="w-5 h-5" /> },
            { num: 5, label: 'Konfirmasi', icon: <CheckCircle2 className="w-5 h-5" /> }
        ]
        : [
            { num: 1, label: 'Layanan', icon: <Home className="w-5 h-5" /> },
            { num: 2, label: 'Desain', icon: <UploadCloud className="w-5 h-5" /> },
            { num: 3, label: 'Jadwal', icon: <CalendarIcon className="w-5 h-5" /> },
            { num: 4, label: 'Konfirmasi', icon: <CheckCircle2 className="w-5 h-5" /> }
        ];

    const activeStepIndex = allSteps.findIndex(s => s.num === step);
    const progressWidth = allSteps.length > 1 ? (activeStepIndex / (allSteps.length - 1)) * 100 : 0;

    return (
        <div className="flex items-center justify-between relative mb-6">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary -z-10 transition-all duration-700" style={{ width: `${progressWidth}%` }}></div>
            
            {allSteps.map(s => (
                <div key={s.num} className="flex flex-col items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
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

// Helper: resolve display step number for "visit" type which skips step 3 (Lokasi)
// Internal step numbers: 1=Layanan, 2=Desain, 3=Lokasi(HS only)/Jadwal(visit), 4=Jadwal(HS)/Konfirmasi(visit), 5=Konfirmasi(HS)
// For visit: step 1->1, 2->2, 4->3, 5->4 (map internal to display)
const getDisplayStep = (step, metode) => {
    if (metode !== 'home_service') {
        // visit: internal step 4 = display step 3, internal step 5 = display step 4
        if (step === 4) return 3;
        if (step === 5) return 4;
    }
    return step;
};

const OrderForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    
    useEffect(() => {
        if (user && (!user.phone_wa || !user.alamat)) {
            navigate('/profile/edit');
        }
    }, [user, navigate]);

    const [step, setStep] = useState(location.state?.method ? 2 : 1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        metode: location.state?.method || '',
        tanggal: '',
        catatan: location.state?.galleryItem ? `Pemesanan model: ${location.state.galleryItem.title}. ` : '',
        alamat_kunjungan: '',
        gallery_image_path: location.state?.galleryItem?.image_path || '',
        latitude: '',
        longitude: '',
    });
    
    const [designFile, setDesignFile] = useState(null);
    const [designPreview, setDesignPreview] = useState(null);
    const [mapsVerified, setMapsVerified] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    useLayoutEffect(() => {
        const html = document.documentElement;
        const previousScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        html.style.scrollBehavior = previousScrollBehavior;
    }, [step, showSuccess]);

    const [isLocked, setIsLocked] = useState(false);
    const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

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

    // Prefill lokasi kunjungan dari titik GPS yang tersimpan di profil pelanggan
    // sebagai nilai awal saja — perubahan di sini tidak pernah ditulis balik ke profil.
    useEffect(() => {
        if (user?.latitude && user?.longitude && !formData.latitude && !formData.longitude) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData((prev) => ({
                ...prev,
                alamat_kunjungan: prev.alamat_kunjungan || user.alamat || '',
                latitude: user.latitude,
                longitude: user.longitude,
            }));
            setSearchQuery(user.alamat || '');
            setMapsVerified(true);
        }
    }, [user, formData.latitude, formData.longitude]);

    

    useEffect(() => {
        if (step === 3 && formData.alamat_kunjungan && !mapsVerified) {
            setMapsVerified(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setFormData(prev => ({
                        ...prev, 
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude
                    }));
                }, () => {
                    setFormData(prev => ({
                        ...prev, 
                        latitude: -6.20876, 
                        longitude: 106.82020
                    }));
                });
            } else {
                setFormData(prev => ({
                    ...prev, 
                    latitude: -6.20876, 
                    longitude: 106.82020
                }));
            }
        }
    }, [step, formData.alamat_kunjungan, mapsVerified]);

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
            toast.error('File harus berupa gambar (JPG, JPEG, PNG).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran gambar tidak boleh lebih dari 10MB.');
            return;
        }

        setDesignFile(file);
        setDesignPreview(URL.createObjectURL(file));
    };

    const handleDpFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, JPEG, PNG).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Ukuran gambar tidak boleh lebih dari 10MB.');
            return;
        }

        setDpProofFile(file);
        setDpProofPreview(URL.createObjectURL(file));
    };


    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Fitur lokasi tidak didukung pada browser Anda.');
            return;
        }
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            setMapsVerified(true);

            // Reverse geocoding — ambil nama alamat dari koordinat
            try {
                const res = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
                );
                const alamat = res.data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                setFormData(prev => ({ ...prev, alamat_kunjungan: alamat, latitude: lat, longitude: lng }));
                setSearchQuery(alamat);
                toast.location(`Lokasi terdeteksi! 📍 Alamat otomatis terisi.`);
            } catch {
                const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                setFormData(prev => ({ ...prev, alamat_kunjungan: fallback, latitude: lat, longitude: lng }));
                setSearchQuery(fallback);
                toast.location(`Lokasi terdeteksi! 📍 Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
            } finally {
                setIsLoading(false);
            }
        }, () => {
            setIsLoading(false);
            toast.error('Gagal mendapatkan lokasi. Pastikan izin lokasi diizinkan di browser Anda.');
        });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.metode) { toast.warning('Pilih metode layanan terlebih dahulu.'); return; }
            setStep(2);
            return;
        }
        if (step === 2) {
            if (formData.metode === 'visit') {
                setStep(4);
            } else {
                setStep(3);
            }
            return;
        }
        if (step === 3) {
            if (!formData.alamat_kunjungan || !formData.alamat_kunjungan.trim()) {
                toast.warning('Masukkan alamat lengkap kunjungan.');
                return;
            }
            if (!formData.latitude || !formData.longitude) {
                setFormData(prev => ({
                    ...prev,
                    latitude: '-0.9247587',
                    longitude: '100.3632561'
                }));
            }
            setMapsVerified(true);
            setStep(4);
            return;
        }
        if (step === 4) {
            if (!formData.tanggal) { toast.warning('Pilih tanggal jadwal kedatangan.'); return; }
            
            // Lock session logic
            setIsLoading(true);
            axios.post('/quotas/lock', { quota_date: formData.tanggal })
                .then(() => {
                    setIsLoading(false);
                    setIsLocked(true);
                    setLockTimeRemaining(600); // 10 minutes in seconds
                    setStep(5);
                })
                // eslint-disable-next-line no-unused-vars
                .catch(err => {
                    setIsLoading(false);
                    toast.error('Gagal mengunci jadwal, kuota mungkin sudah penuh. Silakan pilih tanggal lain.');
                    fetchQuotas(currentMonth, currentYear);
                });
            return;
        }
    };

    useEffect(() => {
        let timer;
        if (isLocked && lockTimeRemaining > 0) {
            timer = setInterval(() => {
                setLockTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (isLocked && lockTimeRemaining === 0) {
            // Lock expired
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLocked(false);
            toast.warning('Waktu reservasi Anda telah habis (10 menit). Silakan pilih jadwal kembali.');
            setStep(4);
            fetchQuotas(currentMonth, currentYear);
        }
        return () => clearInterval(timer);
    }, [isLocked, lockTimeRemaining]);

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

    const displayStep = getDisplayStep(step, formData.metode);

    const renderStep1 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-6">
                <span className="text-primary text-xs font-medium mb-2 block">Tahap 1 dari {formData.metode === 'home_service' ? '5' : '4'}</span>
                <h2 className="text-2xl font-semibold text-text-primary">Pilih Metode Layanan</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
                <button 
                    onClick={() => setFormData({...formData, metode: 'home_service'})}
                    className={`p-6 text-left border rounded-[1.5rem] transition-all duration-500 group shadow-sm ${formData.metode === 'home_service' ? 'border-primary bg-surface ring-4 ring-primary/5' : 'border-border hover:border-primary/50 bg-white'}`}
                >
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${formData.metode === 'home_service' ? 'border-primary text-white bg-primary' : 'border-border text-text-muted bg-surface'}`}>
                        <Home className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Home Service</h3>
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">Penjahit kami yang datang ke lokasi Anda untuk konsultasi dan pengukuran badan. Bedanya, penjahit dekat ke rumah pelanggan.</p>
                    <div className="text-xs text-primary font-medium border-t border-border pt-4">Memerlukan DP (Tanda Jadi)</div>
                </button>
                
                <button 
                    onClick={() => setFormData({...formData, metode: 'visit'})}
                    className={`p-6 text-left border rounded-[1.5rem] transition-all duration-500 group shadow-sm ${formData.metode === 'visit' ? 'border-primary bg-surface ring-4 ring-primary/5' : 'border-border hover:border-primary/50 bg-white'}`}
                >
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${formData.metode === 'visit' ? 'border-primary text-white bg-primary' : 'border-border text-text-muted bg-surface'}`}>
                        <Store className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">In-Store (Kunjungan Studio)</h3>
                    <p className="text-text-secondary text-sm mb-6 leading-relaxed">Datang ke studio kami untuk pengukuran langsung dan diskusi desain. Pada In-Store, pelanggan datang ke toko, bukan penjahit yang datang ke rumah</p>
                    <div className="text-xs text-text-muted font-medium border-t border-border pt-4">Reservasi Tanpa DP</div>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-6">
                <span className="text-primary text-xs font-medium mb-2 block">Tahap 2 dari {formData.metode === 'home_service' ? '5' : '4'}</span>
                <h2 className="text-2xl font-semibold text-text-primary mb-2">Desain &amp; Referensi</h2>
                <p className="text-text-secondary text-sm max-w-lg mx-auto">Deskripsikan keinginan model baju Anda dan unggah gambar referensi jika ada</p>
            </div>

            <div className="mb-6 max-w-xl mx-auto">
                <label className="text-text-secondary text-sm font-medium mb-2 block">Deskripsi Desain (Opsional)</label>
                <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                    rows={6}
                    placeholder="Tuliskan inspirasi model baju, bahan kain, warna, atau detail lain yang Anda inginkan (Opsional)..."
                    className="w-full rounded-3xl border border-border px-5 py-4 text-text-primary bg-white focus:border-primary focus:outline-none resize-none font-body text-sm shadow-sm"
                />
                <p className="text-[11px] text-text-muted mt-3">Opsional: Deskripsikan keinginan desain agar penjahit bisa menyiapkan lebih baik (boleh dikosongkan)</p>
            </div>

            <div className="mb-6 max-w-xl mx-auto">
                {selectedGalleryItem ? (
                    <div className="bg-surface border border-border rounded-[1.5rem] p-8 shadow-sm">
                        <span className="text-primary text-xs font-semibold block mb-3">Desain Terpilih dari Galeri</span>
                        <div className="flex gap-6 items-center">
                            <img 
                                src={selectedGalleryItem.image_path.includes('http') ? selectedGalleryItem.image_path : `${STORAGE_URL}/${selectedGalleryItem.image_path}`} 
                                alt={selectedGalleryItem.title} 
                                className="w-24 h-32 object-cover rounded-2xl border border-border shadow-md"
                            />
                            <div className="flex-grow">
                                <h4 className="font-semibold text-base text-text-primary mb-2">{selectedGalleryItem.title}</h4>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
                                    {selectedGalleryItem.category || 'Koleksi'}
                                </span>
                                {(!location.state?.galleryItem) && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setSelectedGalleryItem(null);
                                            setFormData(prev => ({ ...prev, gallery_image_path: '' }));
                                        }} 
                                        className="block mt-3 text-xs text-red-500 font-medium hover:underline"
                                    >
                                        Ganti Desain
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="border border-border rounded-[1.5rem] p-8 bg-white shadow-sm">
                            <span className="text-sm font-medium text-text-secondary block mb-3">Pilihan A: Unggah Gambar Referensi Sendiri</span>
                            <div className="flex flex-col items-center">
                                <label className={`w-full border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${designPreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface'}`}>
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
                                            <span className="text-xs font-medium text-text-primary">Pilih Gambar Referensi</span>
                                            <span className="text-[11px] text-text-muted mt-1">JPG, PNG (Maks. 10MB)</span>
                                        </div>
                                    )}
                                </label>
                                {designFile && (
                                    <button type="button" onClick={() => { setDesignFile(null); setDesignPreview(null); }} className="text-xs text-red-500 mt-2 font-medium hover:underline">Hapus Gambar</button>
                                )}
                            </div>
                        </div>

                        <div className="border border-border rounded-[1.5rem] p-8 bg-white shadow-sm">
                            <span className="text-sm font-medium text-text-secondary block mb-3">Pilihan B: Pilih dari Galeri Era Jahit</span>
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
                                                src={item.image_path.includes('http') ? item.image_path : `${STORAGE_URL}/${item.image_path}`} 
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

    // Location search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Dynamic Leaflet Map event listener for map click
    // Dynamic Leaflet Map event listener for map click
    const reverseGeocodeAddress = async (lat, lng) => {
        try {
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const address = res.data?.display_name || `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
            setFormData(prev => ({ ...prev, alamat_kunjungan: address, latitude: parseFloat(lat).toFixed(6), longitude: parseFloat(lng).toFixed(6) }));
            setSearchQuery(address);
            setMapsVerified(true);
        } catch (err) {
            console.error("Reverse geocode failed", err);
        }
    };

    const MapEventsHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
                setMapsVerified(true);
                reverseGeocodeAddress(lat, lng);
            }
        });
        return null;
    };

    // Address search using OpenStreetMap Nominatim API
    const handleSearchAddressChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setFormData(prev => ({ ...prev, alamat_kunjungan: val }));
        if (val.trim()) {
            setMapsVerified(true);
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (val.trim().length < 3) {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearchingLocation(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=id&viewbox=99.8,-1.5,101.0,-0.3`);
                setSearchResults(res.data || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Gagal mencari lokasi:", err);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 400);
    };

    const handleSelectLocationResult = (result) => {
        const lat = parseFloat(result.lat).toFixed(6);
        const lng = parseFloat(result.lon).toFixed(6);
        setFormData(prev => ({
            ...prev,
            alamat_kunjungan: result.display_name,
            latitude: lat,
            longitude: lng
        }));
        setSearchQuery(result.display_name);
        setShowSuggestions(false);
        setMapsVerified(true);
    };

    const renderStep3 = () => {
        const mapLat = parseFloat(formData.latitude) || -0.9247587;
        const mapLng = parseFloat(formData.longitude) || 100.3632561;

        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="text-center mb-7">
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-3 block font-sans">Tahap 03</span>
                    <h2 className="text-2xl font-display font-bold text-text-primary mb-3">Lokasi Kunjungan</h2>
                    <p className="text-text-secondary font-body text-sm max-w-lg mx-auto">Tentukan alamat lengkap dan pin point titik lokasi untuk sesi kunjungan Home Service kami.</p>
                </div>
                
                {formData.metode === 'home_service' && (
                    <div className="mb-7 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 bg-white p-8 border border-border rounded-[1.5rem] shadow-sm">
                        <h3 className="font-display font-bold text-lg text-text-primary mb-2 flex items-center gap-3">
                            <span className="w-6 h-[2px] bg-primary"></span> Detail Lokasi Kunjungan
                        </h3>

                        {/* Single Unified Address Field with Autocomplete Suggestions */}
                        <div className="relative">
                            <label className="text-text-secondary text-sm font-bold mb-2 block">Alamat Lengkap Kunjungan</label>
                            <div className="relative">
                                <textarea
                                    value={formData.alamat_kunjungan}
                                    onChange={handleSearchAddressChange}
                                    onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                                    rows={3}
                                    placeholder="Ketik alamat lengkap, jalan, nomor rumah, RT/RW, atau patokan tempat..."
                                    className="w-full rounded-2xl border border-border px-5 py-4 text-text-primary bg-white focus:border-primary focus:outline-none font-body text-sm shadow-sm resize-none pr-10"
                                />
                                {isSearchingLocation && (
                                    <Loader2 className="w-5 h-5 text-primary animate-spin absolute right-4 top-4" />
                                )}
                            </div>

                            {/* Dropdown Suggestions List */}
                            {showSuggestions && searchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border/50 animate-in fade-in zoom-in-95 duration-200">
                                    {searchResults.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectLocationResult(item)}
                                            className="w-full text-left px-5 py-3 hover:bg-primary-bg/50 transition-colors flex items-start gap-3 group"
                                        >
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                                            <div>
                                                <p className="text-xs font-bold text-text-primary group-hover:text-primary">{item.display_name.split(',')[0]}</p>
                                                <p className="text-[11px] text-text-muted line-clamp-1">{item.display_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-surface border border-border p-6 rounded-2xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block">Lokasi Barang (Pin Point Peta)</span>
                                    <span className={`text-xs font-bold flex items-center gap-2 ${mapsVerified ? 'text-green-600' : 'text-red-500'}`}>
                                        <span className={`w-2 h-2 rounded-full ${mapsVerified ? 'bg-green-600 animate-ping' : 'bg-red-500'}`}></span>
                                        {mapsVerified ? 'Koordinat Terverifikasi & Dapat Digeser' : 'Belum Tersemat Pin Peta'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        className="px-4 py-2 text.xs font-bold rounded-xl transition-all border bg-white text-primary border-primary hover:bg-primary/10 shadow-sm flex items-center gap-2"
                                    >
                                        <MapPin className="w-4 h-4 text-primary" /> Gunakan GPS Saya
                                    </button>
                                </div>
                            </div>

                            {/* Interactive Color Map (Leaflet) with Draggable Pin */}
                            <div className="w-full h-64 rounded-2xl overflow-hidden relative border border-border shadow-md mt-3 z-0">
                                <MapContainer 
                                    center={[mapLat, mapLng]} 
                                    zoom={15} 
                                    scrollWheelZoom={true} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <MapViewUpdater center={[mapLat, mapLng]} />
                                    <MapEventsHandler />
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker 
                                        position={[mapLat, mapLng]} 
                                        draggable={true}
                                        icon={customMarkerIcon}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const marker = e.target;
                                                const position = marker.getLatLng();
                                                const lat = position.lat.toFixed(6);
                                                const lng = position.lng.toFixed(6);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    latitude: lat,
                                                    longitude: lng
                                                }));
                                                setMapsVerified(true);
                                                reverseGeocodeAddress(position.lat, position.lng);
                                            }
                                        }}
                                    />
                                </MapContainer>
                                <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-sm text-xs font-mono text-text-primary flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                    <span>{mapLat.toFixed(6)}, {mapLng.toFixed(6)}</span>
                                    <span className="text-[10px] text-text-muted font-sans">(Geser pin atau klik peta)</span>
                                </div>
                            </div>

                            {/* Manual Coordinates Input */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <span className="text-[11px] font-bold text-text-primary block mb-2">Koordinat GPS (Manual)</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-text-muted font-mono block mb-1">Latitude</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, latitude: e.target.value }));
                                                setMapsVerified(true);
                                            }}
                                            placeholder="-0.9247587"
                                            className="w-full rounded-xl border border-border px-3 py-2 text-xs font-mono bg-white focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-text-muted font-mono block mb-1">Longitude</label>
                                        <input 
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, longitude: e.target.value }));
                                                setMapsVerified(true);
                                            }}
                                            placeholder="100.3632561"
                                            className="w-full rounded-xl border border-border px-3 py-2 text-xs font-mono bg-white focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStep4 = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-6">
                <span className="text-primary text-xs font-medium mb-2 block">Tahap {displayStep} dari {formData.metode === 'home_service' ? '5' : '4'}</span>
                <h2 className="text-2xl font-semibold text-text-primary mb-2">Jadwal Pertemuan</h2>
                <p className="text-text-secondary text-sm max-w-lg mx-auto">Pilih tanggal yang tersedia untuk sesi desain utama atau pengukuran.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-surface rounded-[1.5rem] border border-border p-3 sm:p-6 shadow-sm">
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
                            <span className="block text-xs text-text-muted mb-0.5">Bulan</span>
                            <span className="text-base font-semibold text-text-primary">{getCalendarTitle()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[8px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.15em] text-text-muted font-bold mb-3">
                    {weekDayLabels.map((day) => (
                        <div key={day} className="py-1 sm:py-2">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                                    className={`min-h-[52px] sm:min-h-[76px] flex flex-col items-center justify-between rounded-lg sm:rounded-3xl border p-1 sm:p-4 text-left transition-all duration-500 ${
                                        !d ? 'bg-transparent border-transparent cursor-default' : (d.is_past || d.disabled || d.is_closure) ? 'bg-surface border-border opacity-70 cursor-pointer hover:border-primary/50' : formData.tanggal === d.date ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-border hover:border-primary/50 text-text-primary shadow-sm'
                                    }`}
                                >
                                    {d ? (
                                        <>
                                            <span className="text-[8px] sm:text-[11px] font-medium text-text-muted">{d.day}</span>
                                            <span className="text-sm sm:text-3xl font-bold my-0.5 sm:my-2">{d.num}</span>
                                            <span className={`text-[6px] sm:text-[10px] px-1 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium whitespace-nowrap ${d.is_past ? 'bg-gray-100 text-gray-500 border border-gray-200' : d.is_closure ? 'bg-amber-50 text-amber-600 border border-amber-100' : d.disabled ? 'bg-red-50 text-red-600 border border-red-100' : formData.tanggal === d.date ? 'bg-white/20 text-white border border-white/30' : 'bg-surface border border-border text-text-muted'}`}>
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
                    <div className="w-full max-w-md rounded-[1.5rem] bg-white p-8 shadow-2xl border border-border">
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

    const renderStep5 = () => {
        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-6">
                <span className="text-primary text-xs font-medium mb-2 block">Tahap {displayStep} dari {formData.metode === 'home_service' ? '5' : '4'}</span>
                <h2 className="text-2xl font-semibold text-text-primary">
                    {formData.metode === 'home_service' ? 'Konfirmasi & Pembayaran DP' : 'Konfirmasi Pesanan'}
                </h2>
            </div>
            
            <div className="bg-white p-6 md:p-8 border border-border rounded-[1.75rem] max-w-3xl mx-auto shadow-sm">
                
                {isLocked && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl mb-8 flex items-center justify-between shadow-sm animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                            <div>
                                <span className="block font-bold text-sm">Sesi Jadwal Terkunci</span>
                                <span className="block text-xs opacity-80">Selesaikan pesanan sebelum waktu habis</span>
                            </div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-amber-700 bg-white px-4 py-2 rounded-xl shadow-inner">
                            {formatTime(lockTimeRemaining)}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pb-8 border-b border-border mb-8">
                    <span className="text-text-muted text-xs">Metode Layanan</span>
                    <span className="font-semibold text-primary text-base">
                        {formData.metode === 'home_service' ? 'Home Service' : 'In-Store'}
                    </span>
                </div>
                
                <div className="flex justify-between items-center pb-8 border-b border-border mb-7">
                    <span className="text-text-muted text-xs">Tanggal Sesi</span>
                    <span className="font-semibold text-text-primary text-base">
                        {new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>


                {formData.metode === 'home_service' && formData.alamat_kunjungan && (
                    <div className="flex flex-col pb-8 border-b border-border mb-7 gap-2 text-left">
                        <span className="text-text-muted text-xs mb-1">Alamat Kunjungan</span>
                        <span className="font-body text-text-primary text-sm leading-relaxed bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm">
                            {formData.alamat_kunjungan}
                            <span className="block mt-2 text-green-600 text-xs font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>📍 Koordinat Terverifikasi Google Maps
                            </span>
                        </span>
                    </div>
                )}

                {formData.catatan && (
                    <div className="mb-7 text-left">
                        <span className="text-text-muted text-xs block mb-2">Catatan Desain</span>
                        <p className="bg-surface p-8 border border-border text-text-secondary font-body italic text-sm leading-relaxed rounded-[1.5rem] shadow-sm">{formData.catatan}</p>
                    </div>
                )}

                {designPreview && (
                    <div className="mb-7 text-left">
                        <span className="text-text-muted text-xs block mb-2">Referensi Gambar Desain</span>
                        <div className="bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm inline-block">
                            <img src={designPreview} alt="Referensi Desain" className="max-h-48 object-contain rounded-xl" />
                        </div>
                    </div>
                )}

                {selectedGalleryItem && (
                    <div className="mb-7 text-left">
                        <span className="text-text-muted text-xs block mb-2">Referensi Desain dari Galeri</span>
                        <div className="bg-surface p-6 border border-border rounded-[1.5rem] shadow-sm inline-block">
                            <img 
                                src={selectedGalleryItem.image_path.includes('http') ? selectedGalleryItem.image_path : `${STORAGE_URL}/${selectedGalleryItem.image_path}`} 
                                alt={selectedGalleryItem.title} 
                                className="max-h-48 object-contain rounded-xl" 
                            />
                        </div>
                    </div>
                )}

                {formData.metode === 'home_service' && (
                    <div className="border border-primary/20 bg-primary/5 rounded-[1.5rem] p-8 md:p-6 mb-7 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6 border-b border-primary/10 pb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold">Rp</div>
                            <div>
                                <h3 className="font-semibold text-base text-text-primary">Pembayaran DP Home Service</h3>
                                <p className="text-xs text-text-muted">Jaminan pesanan kunjungan alamat oleh penjahit</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mb-8">
                            <div>
                                <span className="text-xs text-text-muted font-medium block mb-1">Transfer Bank Mandiri</span>
                                <span className="text-text-primary font-mono font-bold text-lg tracking-wider block">123-00-0987654-1</span>
                                <span className="text-xs text-text-muted block mt-1">a/n Era Jahit Studio</span>
                            </div>
                            <div>
                                <span className="text-xs text-text-muted font-medium block mb-1">Jumlah DP yang Harus Dibayar</span>
                                <span className="text-primary font-bold text-xl block">
                                    Rp {globalDpAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6 bg-white p-6 rounded-2xl border border-primary/10">
                            <span className="text-xs text-text-muted font-medium block mb-3">Unggah Bukti Transfer</span>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <label className="flex-1 w-full py-8 border-2 border-dashed border-border hover:border-primary rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-surface group">
                                    <UploadCloud className="w-8 h-8 text-text-muted group-hover:text-primary mb-3 transition-colors" />
                                    <span className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors">Pilih File Bukti</span>
                                    <span className="text-[11px] text-text-muted mt-1">Maksimal 10MB (JPG, PNG)</span>
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
    };

    const submitOrder = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('method', formData.metode);
            data.append('quota_date', formData.tanggal);
            data.append('design_notes', formData.catatan);
            if (formData.metode === 'home_service') {
                data.append('alamat', formData.alamat_kunjungan);
                if (formData.latitude && formData.longitude) {
                    data.append('latitude', formData.latitude);
                    data.append('longitude', formData.longitude);
                }
                if (dpProofFile) {
                    data.append('dp_proof', dpProofFile);
                } else {
                    setIsLoading(false);
                    toast.warning('Harap unggah bukti transfer DP terlebih dahulu untuk menyelesaikan pesanan Home Service.');
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
            setIsLoading(false);
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
        }
    };

    if (showSuccess) {
        if (formData.metode === 'home_service') {
            return (
                <div className="min-h-screen bg-surface pt-24 pb-6 flex items-center justify-center">
                    <div className="container mx-auto px-4 max-w-3xl animate-in fade-in zoom-in-95 duration-750">
                        <div className="bg-white p-8 md:p-8 rounded-[1.5rem] border border-border shadow-2xl text-center">
                            <div className="w-11 h-11 border-2 border-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto bg-primary/5">
                                <Clock className="w-8 h-8 text-primary animate-pulse"/>
                            </div>
                            <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Pembayaran Diterima</span>
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Pesanan & DP Berhasil Dikirim</h2>
                            <p className="text-text-secondary font-body text-sm max-w-md mx-auto mb-7 leading-relaxed">
                                Bukti transfer DP Anda sebesar <strong>Rp {globalDpAmount.toLocaleString('id-ID')}</strong> telah berhasil diunggah. Kami akan memvalidasi pembayaran Anda secepatnya.
                            </p>

                            <div className="grid md:grid-cols-2 gap-5 text-left bg-surface p-6 border border-border rounded-[1.5rem] mb-6">
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

                            <div className="border border-border rounded-[1.5rem] p-8 text-left bg-white shadow-sm mb-7">
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
            <div className="min-h-screen bg-surface pt-24 pb-6 flex items-center justify-center">
                <div className="container mx-auto px-4 max-w-3xl animate-in fade-in zoom-in-95 duration-750">
                    <div className="bg-white p-8 md:p-8 rounded-[1.5rem] border border-border shadow-2xl text-center">
                        <div className="w-11 h-11 border-2 border-primary/20 rounded-3xl flex items-center justify-center mb-8 mx-auto bg-primary/5">
                            <MapPin className="w-8 h-8 text-primary animate-bounce"/>
                        </div>
                        <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Reservasi Berhasil</span>
                        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Silakan Kunjungi Studio Kami</h2>
                        <p className="text-text-secondary font-body text-sm max-w-md mx-auto mb-7 leading-relaxed">
                            Pesanan Anda telah terdaftar Kami menunggu kedatangan Anda untuk melakukan pengukuran langsung dan diskusi detail desain.
                        </p>

                        <div className="grid md:grid-cols-2 gap-5 text-left bg-surface p-6 border border-border rounded-[1.5rem] mb-6">
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

                        <div className="border border-border rounded-[1.5rem] overflow-hidden p-8 text-left bg-white shadow-sm mb-7">
                            <h4 className="font-display font-bold text-lg text-text-primary mb-4 flex items-center gap-3">
                                <span className="w-6 h-[2px] bg-primary"></span> Detail Alamat Studio
                            </h4>
                            <p className="text-text-secondary font-body text-sm leading-relaxed mb-6">
                                <strong>Era Jahit Studio</strong><br />
                                Jl. Sungai Balang, Cupak Tangah, Kec. Pauh, Kota Padang, Sumatera Barat
                            </p>
                            
                            <div className="w-full h-64 rounded-2xl bg-gray-200 overflow-hidden relative border border-border shadow-inner mb-6">
                                <iframe 
                                    title="Google Maps Studio"
                                    src="https://www.google.com/maps/place/Kantor+Camat+Pauh/@-0.9392632,100.4337847,94a,75y,235.37h,87.47t/data=!3m7!1e1!3m5!1szCgzPeCeTO156NQHVpPS2w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.530974196500651%26panoid%3DzCgzPeCeTO156NQHVpPS2w%26yaw%3D235.36847697311003!7i16384!8i8192!4m16!1m8!3m7!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!2sKantor+Camat+Pauh!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd!3m6!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D" 
                                    className="w-full h-full border-0 grayscale opacity-90"
                                    allowFullScreen="" 
                                    loading="lazy"
                                ></iframe>
                                <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                            </div>

                            <a 
                                href="https://www.google.com/maps/place/Kantor+Camat+Pauh/@-0.9392632,100.4337847,94a,75y,261.95h,65.63t/data=!3m7!1e1!3m5!1szCgzPeCeTO156NQHVpPS2w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D24.36674356233864%26panoid%3DzCgzPeCeTO156NQHVpPS2w%26yaw%3D261.9512668509286!7i16384!8i8192!4m15!1m8!3m7!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!2sKantor+Camat+Pauh!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd!3m5!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!8m2!3d-0.9394053!4d100.4339543!16s%2Fg%2F1hm6lxccd?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3Dhttps://www.google.com/maps/place/Kantor+Camat+Pauh/@-0.9392632,100.4337847,94a,75y,235.37h,87.47t/data=!3m7!1e1!3m5!1szCgzPeCeTO156NQHVpPS2w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D2.530974196500651%26panoid%3DzCgzPeCeTO156NQHVpPS2w%26yaw%3D235.36847697311003!7i16384!8i8192!4m16!1m8!3m7!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!2sKantor+Camat+Pauh!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd!3m6!1s0x2fd4b9da28a9eb37:0x9943782e33af5c61!8m2!3d-0.9394053!4d100.4339543!10e5!16s%2Fg%2F1hm6lxccd?entry=ttu&g_ep=EgoyMDI2MDcyNi4wIKXMDSoASAFQAw%3D%3D"
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
        <div className="min-h-screen bg-surface pt-24 pb-6">
            <div className="container mx-auto px-4 max-w-5xl">

                <button onClick={() => step > 1 ? prevStep() : navigate(-1)} className="flex items-center gap-3 text-text-muted text-[11px] uppercase tracking-[0.2em] font-bold hover:text-primary transition-all mb-8 font-sans group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> Kembali
                </button>
 
                <div className="bg-white p-6 md:p-6 rounded-[1.5rem] border border-border shadow-2xl">
                    <StepIndicator step={displayStep} metode={formData.metode} />
                    
                    <div className="my-8">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                        {step === 5 && renderStep5()}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
                        <button 
                            onClick={prevStep}
                            disabled={step === 1}
                            className={`px-6 py-3 uppercase tracking-widest text-[11px] font-bold transition-all border rounded-xl font-sans ${step === 1 ? 'opacity-0 cursor-default' : 'border-border text-text-muted hover:border-primary hover:text-primary hover:bg-surface'}`}
                        >
                            Tahap Sebelumnya
                        </button>
                        
                        {(() => {
                            const isLastStep = step === 5;
                            return isLastStep ? (
                                <button 
                                    onClick={submitOrder}
                                    disabled={isLoading}
                                    className="px-8 py-3.5 bg-text-primary text-white uppercase tracking-widest text-[11px] font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-black/10 rounded-xl font-sans disabled:opacity-50"
                                >
                                    {isLoading ? "Memproses..." : <><Save className="w-5 h-5"/> Buat Pesanan Sekarang</>}
                                </button>
                            ) : (
                                <button 
                                    onClick={nextStep}
                                    className="px-8 py-3.5 bg-primary text-white uppercase tracking-widest text-[11px] font-bold hover:bg-primary-dark transition-all flex items-center gap-3 shadow-xl shadow-primary/20 rounded-xl font-sans"
                                >
                                    Lanjutkan <ChevronRight className="w-5 h-5" />
                                </button>
                            );
                        })()}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderForm;
