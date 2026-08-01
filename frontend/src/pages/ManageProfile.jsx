import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Save, User, Search, ArrowLeft, Info, MapPin, X } from 'lucide-react';
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

const ManageProfile = () => {
    const { user, updateUserState } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone_wa, setPhone_wa] = useState('');
    const [alamat, setAlamat] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [msgMode, setMsgMode] = useState('');
    const [msgText, setMsgText] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Location search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocatingGps, setIsLocatingGps] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone_wa(user.phone_wa || '');
            setAlamat(user.alamat || '');
            setLatitude(user.latitude || '');
            setLongitude(user.longitude || '');
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMsgMode('');
        setIsLoadingProfile(true);
        try {
            const cleanNoWA = phone_wa.replace(/\D/g, '');
            const payload = { name, phone_wa: cleanNoWA, alamat, latitude: latitude || null, longitude: longitude || null };
            await axios.put('/profile', payload);
            updateUserState({ name, phone_wa: cleanNoWA, ...payload });
            setMsgMode('profile-success');
            setMsgText('Profil berhasil diubah');
        } catch (err) {
            setMsgMode('profile-error');
            setMsgText(err.response?.data?.message || 'Gagal mengubah profil.');
        } finally {
            setIsLoadingProfile(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMsgMode('profile-error');
            setMsgText('Fitur lokasi tidak didukung pada browser Anda.');
            return;
        }
        setIsLocatingGps(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLatitude(lat);
            setLongitude(lng);

            try {
                const res = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
                );
                const detectedAddress = res.data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                setAlamat(detectedAddress);
                setSearchQuery(detectedAddress);
            } catch {
                const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                setAlamat(fallback);
                setSearchQuery(fallback);
            } finally {
                setIsLocatingGps(false);
            }
        }, () => {
            setIsLocatingGps(false);
            setMsgMode('profile-error');
            setMsgText('Gagal mendapatkan lokasi. Pastikan izin lokasi diizinkan di browser Anda.');
        });
    };

    const reverseGeocodeAddress = async (lat, lng) => {
        try {
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const detectedAddress = res.data?.display_name || `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
            setAlamat(detectedAddress);
            setSearchQuery(detectedAddress);
        } catch {
            const fallback = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
            setAlamat(fallback);
            setSearchQuery(fallback);
        }
    };

    const handleSearchAddressChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setAlamat(val);

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
                console.error('Gagal mencari lokasi:', err);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 400);
    };

    const handleSelectLocationResult = (result) => {
        const lat = parseFloat(result.lat).toFixed(6);
        const lng = parseFloat(result.lon).toFixed(6);
        setAlamat(result.display_name);
        setLatitude(lat);
        setLongitude(lng);
        setSearchQuery(result.display_name);
        setShowSuggestions(false);
    };

    // Dynamic Leaflet Map event listener for map click
    const MapEventsHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                const latFixed = lat.toFixed(6);
                const lngFixed = lng.toFixed(6);
                setLatitude(latFixed);
                setLongitude(lngFixed);
                reverseGeocodeAddress(lat, lng);
            }
        });
        return null;
    };

    const mapLat = parseFloat(latitude) || -0.9247587;
    const mapLng = parseFloat(longitude) || 100.3632561;

    const inputClass = "w-full bg-white border border-border px-6 py-4 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-body text-text-primary placeholder:text-text-muted/50";
    const labelClass = "block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3 font-sans";

    return (
        <div className="min-h-screen bg-white text-text-primary py-20">
            <div className="container mx-auto px-4 max-w-3xl">

                <div className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors mb-8 font-sans">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Akun Saya</span>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Kelola Profil</h1>
                    <p className="text-text-secondary font-body">Perbarui data pribadi dan informasi kontak Anda agar kami dapat memberikan layanan terbaik</p>
                </div>

                <div className="bg-surface border border-border p-8 md:p-12 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                        <User className="w-6 h-6 text-primary" />
                        <h2 className="text-lg font-bold text-text-primary font-display">Data Pribadi</h2>
                    </div>

                    {(!user?.phone_wa || !user?.alamat) && (
                        <div className="mb-8 p-5 rounded-2xl flex items-start gap-4 text-sm bg-blue-50 text-blue-700 border border-blue-100">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="font-body font-medium leading-relaxed">
                                Lengkapi Nomor WhatsApp dan Alamat Anda terlebih dahulu sebelum melakukan pemesanan. Nomor WhatsApp aktif dibutuhkan karena seluruh notifikasi status pesanan akan dikirim ke nomor tersebut.
                            </span>
                        </div>
                    )}

                    {msgMode.startsWith('profile-') && (
                        <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 text-sm ${msgMode.endsWith('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {msgMode.endsWith('success') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-body font-medium">{msgText}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div>
                            <label className={labelClass}>Nama Lengkap</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Alamat Email (Tidak bisa diubah)</label>
                            <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-50 opacity-70 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className={labelClass}>Nomor WhatsApp</label>
                            <input type="tel" value={phone_wa} onChange={(e) => setPhone_wa(e.target.value)} placeholder="0812xxx" className={inputClass} />
                        </div>
                        <div className="relative">
                            <label className={labelClass}>Alamat Lengkap</label>
                            <div className="relative">
                                <textarea 
                                    value={alamat} 
                                    onChange={handleSearchAddressChange} 
                                    onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                                    rows="3" 
                                    placeholder="Tuliskan alamat lengkap, jalan, nomor rumah, atau cari tempat..." 
                                    className={`${inputClass} resize-none pr-10`} 
                                />
                                {isSearchingLocation && (
                                    <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-4 top-4" />
                                )}
                            </div>

                            {showSuggestions && searchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border/50">
                                    {searchResults.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectLocationResult(item)}
                                            className="w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3 group"
                                        >
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                                            <div>
                                                <p className="text-xs font-bold text-text-primary group-hover:text-primary">{item.display_name.split(',')[0]}</p>
                                                <p className="text-[11px] text-text-muted line-clamp-1">{item.display_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location Picker: GPS + Map */}
                        <div className="pt-2">
                            <label className={labelClass}>Titik Lokasi (GPS)</label>
                            <p className="text-xs text-text-muted font-body mb-4 -mt-2">
                                Lokasi ini akan otomatis dipakai sebagai lokasi awal saat Anda memesan layanan Home Service — namun tetap bisa Anda ubah khusus untuk pesanan tertentu tanpa mengubah lokasi profil ini.
                            </p>

                            <div className="bg-white border border-border p-6 rounded-2xl space-y-4">

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                                        {latitude && longitude ? 'Titik lokasi tersimpan' : 'Belum ada titik lokasi'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleGetCurrentLocation}
                                        disabled={isLocatingGps}
                                        className="px-4 py-2 text-xs font-bold rounded-xl transition-all border bg-white text-primary border-primary hover:bg-primary/10 shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isLocatingGps ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                        Gunakan GPS Saya
                                    </button>
                                </div>

                                {/* Interactive Map */}
                                <div className="w-full h-72 rounded-2xl overflow-hidden relative border border-border shadow-sm z-0">
                                    <MapContainer
                                        center={[mapLat, mapLng]}
                                        zoom={latitude && longitude ? 15 : 5}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <MapViewUpdater center={[mapLat, mapLng]} />
                                        <MapEventsHandler />
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {latitude && longitude && (
                                            <Marker
                                                position={[mapLat, mapLng]}
                                                draggable={true}
                                                icon={customMarkerIcon}
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const position = e.target.getLatLng();
                                                        setLatitude(position.lat.toFixed(6));
                                                        setLongitude(position.lng.toFixed(6));
                                                        reverseGeocodeAddress(position.lat, position.lng);
                                                    }
                                                }}
                                            />
                                        )}
                                    </MapContainer>
                                    <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-sm text-xs font-mono text-text-primary">
                                        {latitude && longitude ? `${mapLat.toFixed(6)}, ${mapLng.toFixed(6)}` : 'Klik peta untuk menandai lokasi'}
                                    </div>
                                </div>

                                {/* Manual coordinates */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-text-muted font-mono block mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="-0.9247587"
                                            className="w-full rounded-xl border border-border px-3 py-2 text-xs font-mono bg-white focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-text-muted font-mono block mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="100.3632561"
                                            className="w-full rounded-xl border border-border px-3 py-2 text-xs font-mono bg-white focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border mt-8">
                            <button type="submit" disabled={isLoadingProfile} className="w-full py-5 bg-primary text-white font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all flex justify-center items-center gap-3 rounded-2xl shadow-xl shadow-primary/20 font-sans">
                                {isLoadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4"/> Simpan Perubahan Profil</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageProfile;
