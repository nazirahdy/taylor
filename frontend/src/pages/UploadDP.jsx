import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileImage, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useToast } from '../components/Toast';

const UploadDP = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [orderInfo, setOrderInfo] = useState({
        order_number: `EJ-${id}`,
        nominal_dp: 0, 
        financial_breakdown: []
    });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await axios.get(`/orders/${id}`);
                const data = res.data?.data || res.data;
                setOrderInfo({
                    order_number: data.order_number ? `EJ-${data.order_number}` : `EJ-${data.id}`,
                    nominal_dp: Number(data.dp_amount) || 50000,
                    financial_breakdown: data.financial_breakdown || []
                });
            } catch (err) {
                console.error("Gagal mengambil detail pesanan untuk DP", err);
                setError("Gagal memuat detail pesanan.");
            }
        };
        fetchOrderDetails();
    }, [id]);

    const handleFileChange = (e) => {
        const fileUpload = e.target.files[0];
        if (!fileUpload) return;

        if (!fileUpload.type.includes('image/')) {
            setError('Pilih file berformat gambar (JPG/PNG).');
            return;
        }

        if (fileUpload.size > 2 * 1024 * 1024) {
            setError('Ukuran file tidak boleh lebih dari 2 MB.');
            return;
        }

        setError('');
        setFile(fileUpload);

        const objectUrl = URL.createObjectURL(fileUpload);
        setPreview(objectUrl);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Silakan pilih bukti transfer pembayaran Anda.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('dp_proof', file);
        formData.append('dp_amount', orderInfo.nominal_dp);

        try {
            await axios.post(`/orders/${id}/dp`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            
            toast.success('Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.');
            navigate(`/dashboard`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Unggah gagal. Silakan coba lagi.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 py-20">
            <div className="w-full max-w-2xl bg-white border border-border shadow-2xl rounded-[3rem] overflow-hidden animate-slide-up">
                
                {/* Header Section */}
                <div className="bg-surface/50 p-12 relative flex flex-col items-center text-center border-b border-border">
                    <button onClick={() => navigate(-1)} className="absolute top-8 left-8 p-3 border border-border hover:border-primary text-text-muted hover:text-primary transition-all rounded-xl bg-white shadow-sm group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <div className="w-20 h-20 border-2 border-primary/20 rounded-2xl flex items-center justify-center mb-8 bg-primary/5">
                        <CheckCircle2 className="w-8 h-8 text-primary"/>
                    </div>
                    <span className="text-primary uppercase tracking-[0.4em] text-[12px] font-bold mb-4 block font-sans">Tahap Akhir</span>
                    <h2 className="text-4xl font-display font-bold text-text-primary mb-3">Pesanan Terdaftar</h2>
                    <p className="text-text-secondary font-body text-sm max-w-xs">Konfirmasi pembayaran DP Anda untuk memulai proses pengerjaan busana.</p>
                </div>

                <div className="p-12 md:p-16">
                    <div className="grid md:grid-cols-2 gap-8 bg-surface p-10 border border-border rounded-[2rem] mb-10 shadow-sm">
                        <div>
                            <span className="text-[11px] uppercase tracking-widest text-text-muted block mb-3 font-bold font-sans">Nomor Pesanan</span>
                            <span className="text-text-primary font-display font-bold text-2xl">EJ-{id}</span>
                        </div>
                        <div>
                            <span className="text-[11px] uppercase tracking-widest text-text-muted block mb-3 font-bold font-sans">Nominal DP</span>
                            <span className="text-primary font-display font-bold text-3xl">
                                Rp {orderInfo.nominal_dp.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {orderInfo.financial_breakdown && orderInfo.financial_breakdown.length > 0 && (
                        <div className="mb-12 bg-surface p-10 border border-border rounded-[2rem] shadow-sm">
                            <h4 className="text-text-primary font-display font-bold text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3 font-sans">
                                <span className="w-4 h-[2px] bg-primary"></span> Rincian Estimasi Biaya
                            </h4>
                            <div className="space-y-4">
                                {orderInfo.financial_breakdown.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-body border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                                        <span className="text-text-secondary">{item.name}</span>
                                        <span className="text-text-primary font-bold font-sans">Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-sm font-sans font-bold border-t border-border pt-4 mt-2">
                                    <span className="text-text-primary uppercase tracking-widest text-[11px]">Total Estimasi</span>
                                    <span className="text-text-primary text-base">
                                        Rp {orderInfo.financial_breakdown.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-12">
                        <h4 className="text-text-primary font-display font-bold text-xl mb-6 flex items-center gap-4">
                            <span className="w-8 h-[2px] bg-primary"></span> Instruksi Pembayaran
                        </h4>
                        <ol className="list-decimal list-inside text-text-secondary space-y-6 font-body text-sm">
                            <li className="leading-relaxed">Transfer nominal DP ke rekening studio kami:
                                <div className="mt-6 mb-6 bg-surface border border-border p-8 rounded-2xl text-center shadow-inner group">
                                    <span className="text-text-primary font-sans text-2xl font-bold tracking-widest block mb-2 group-hover:text-primary transition-colors">123-456-789-0</span>
                                    <span className="text-[11px] text-text-muted uppercase tracking-widest font-bold font-sans">Bank BCA — Era Jahit Studio</span>
                                </div>
                            </li>
                            <li className="leading-relaxed">Simpan bukti transfer atau konfirmasi transaksi Anda.</li>
                            <li className="leading-relaxed">Unggah foto bukti pembayaran melalui formulir di bawah ini.</li>
                        </ol>
                    </div>
                    {error && (
                         <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-700 flex items-start gap-4 text-sm font-body rounded-2xl shadow-sm">
                             <AlertCircle className="w-6 h-6 shrink-0 text-red-600" />
                             <span className="pt-0.5">{error}</span>
                         </div>
                    )}

                    <form onSubmit={handleUpload}>
                        <div className="mb-12">
                            <label 
                                className={`w-full border-2 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center text-center cursor-pointer transition-all duration-500 group ${
                                    preview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                                {preview ? (
                                    <div className="w-full flex justify-center animate-fade-in">
                                       <img src={preview} alt="Pratinjau Bukti" className="max-w-[240px] max-h-[320px] object-contain border border-border shadow-2xl rounded-2xl" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-2xl bg-surface border border-border text-text-muted flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                            <UploadCloud className="w-8 h-8 group-hover:text-primary transition-colors"/>
                                        </div>
                                        <h4 className="text-text-primary font-display font-bold text-xl mb-3">Unggah Bukti Pembayaran</h4>
                                        <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest font-sans">JPG, PNG. (Maks. 2MB)</p>
                                    </>
                                )}
                            </label>
                            
                            {preview && (
                                <p className="text-center text-[11px] uppercase tracking-widest text-text-muted mt-8 flex items-center justify-center gap-3 font-bold font-sans animate-fade-in">
                                    <FileImage className="w-4 h-4 text-primary" /> {file?.name}
                                </p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading || !file}
                            className="w-full py-6 bg-primary text-white uppercase tracking-widest text-sm font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 rounded-2xl disabled:opacity-50 disabled:shadow-none font-sans"
                        >
                            {isLoading ? "Memverifikasi..." : "Konfirmasi Pembayaran"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadDP;
