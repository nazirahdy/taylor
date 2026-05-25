import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Circle, Loader2, Activity } from 'lucide-react';

const ProgressTracker = ({ orderId, }) => {
    const [progressList, setProgressList] = useState([]);
    const [loading, setLoading] = useState(true);

    const standardStages = [
        "Konsultasi & Pengukuran",
        "Pemilihan Bahan",
        "Pola & Pemotongan",
        "Proses Menjahit",
        "Fitting Pertama",
        "Selesai & Penyerahan"
    ];

    const fetchProgress = async () => {
        try {
            const res = await axios.get(`/orders/${orderId}/progress`);
            setProgressList(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Gagal memuat progres:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
        const pollingId = setInterval(fetchProgress, 30000);
        return () => clearInterval(pollingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    if (loading) return <div className="p-12 flex justify-center bg-surface rounded-[2rem] border border-border shadow-sm"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    const currentProgressNames = progressList.map(p => p.status?.toLowerCase() || p.tahapan?.toLowerCase());
    let latestActiveIndex = -1;

    standardStages.forEach((stage, index) => {
        if (currentProgressNames.includes(stage.toLowerCase())) {
            latestActiveIndex = index;
        }
    });

    // Default to first stage if empty
    if (latestActiveIndex === -1 && progressList.length === 0) latestActiveIndex = 0;

    return (
        <div className="bg-surface rounded-[2rem] p-10 border border-border shadow-sm flex-1">
            <div className="flex items-center gap-4 mb-14 border-b border-border pb-8">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary font-sans">Progres Pesanan</h3>
            </div>

            <div className="relative flex flex-col gap-12">
                {/* Vertical Line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-border z-0"></div>

                {standardStages.map((stage, index) => {
                    const isCompleted = index < latestActiveIndex || (index === 5 && latestActiveIndex === 5);
                    const isActive = index === latestActiveIndex && latestActiveIndex !== 5;
                    
                    const logData = progressList.find(p => (p.status?.toLowerCase() || p.tahapan?.toLowerCase()) === stage.toLowerCase());

                    return (
                        <div key={index} className="relative z-10 flex items-start gap-8 group">
                            <div className="shrink-0 mt-1 relative">
                                {isCompleted ? (
                                    <div className="w-[28px] h-[28px] rounded-full bg-primary border border-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                ) : isActive ? (
                                    <div className="relative w-[28px] h-[28px] rounded-full bg-white border-2 border-primary flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full relative z-10"></div>
                                    </div>
                                ) : (
                                    <div className="w-[28px] h-[28px] rounded-full bg-white border border-border flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-border rounded-full"></div>
                                    </div>
                                )}
                            </div>

                            <div className={`flex flex-col transition-all duration-500 ${isActive ? 'translate-x-2' : ''}`}>
                                <span className={`text-[12px] font-bold tracking-widest uppercase font-sans ${
                                    isCompleted ? 'text-text-primary' : isActive ? 'text-primary' : 'text-text-muted/40'
                                }`}>
                                    {stage}
                                </span>
                                
                                {logData && (
                                    <span className="text-[9px] font-bold text-text-muted mt-2 uppercase tracking-widest font-sans">
                                        {new Date(logData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}

                                {isActive && (latestActiveIndex !== 5) && (
                                    <p className="text-[11px] font-body text-text-secondary mt-3 leading-relaxed max-w-[240px]">
                                        Tim penjahit kami sedang mengerjakan tahap ini untuk pesanan busana Anda.
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressTracker;

