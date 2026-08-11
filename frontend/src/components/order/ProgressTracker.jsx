import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle2, Loader2, Activity, Clock } from 'lucide-react';


const STANDARD_STAGES = [
    {
        key: 'pending',
        label: 'Menunggu Konfirmasi',
        desc: 'Pesanan Anda sedang menunggu peninjauan dan konfirmasi dari admin.',
    },
    {
        key: 'confirmed',
        label: 'Dikonfirmasi',
        desc: 'Pesanan Anda telah dikonfirmasi dan disetujui.',
    },
    {
        key: 'pola_pemotongan',
        label: 'Pola dan Pemotongan',
        desc: 'Tim sedang merancang pola busana dan memotong bahan kain.',
    },
    {
        key: 'pola_penjahitan',
        label: 'Pola Penjahitan',
        desc: 'Tim menyiapkan pola jahitan sebelum proses menjahit utama.',
    },
    {
        key: 'proses_menjahit',
        label: 'Proses Menjahit',
        desc: 'Proses menjahit busana Anda sedang dikerjakan oleh penjahit kami.',
    },
    {
        key: 'finishing',
        label: 'Finishing',
        desc: 'Tahap penyelesaian akhir dan Quality Control (QC).',
    },
    {
        key: 'selesai_penyerahan',
        label: 'Selesai & Penyerahan',
        desc: 'Pakaian selesai dibuat dan siap diserahkan kepada Anda.',
    },
];

const ProgressTracker = ({ orderId, orderStatus }) => {
    const [progressList, setProgressList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProgress = useCallback(async () => {
        try {
            const res = await axios.get(`/orders/${orderId}/progress`);
            setProgressList(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Gagal memuat progres:", err);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchProgress();
        const pollingId = setInterval(fetchProgress, 30000);
        return () => clearInterval(pollingId);
    }, [fetchProgress]);

    if (loading) {
        return (
            <div className="p-12 flex justify-center bg-surface rounded-[1.5rem] border border-border shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const STAGES_ORDER = ['pending', 'confirmed', 'pola_pemotongan', 'pola_penjahitan', 'proses_menjahit', 'finishing', 'selesai_penyerahan'];
    const currentIdx = STAGES_ORDER.indexOf(orderStatus);
    const isFullyDone = orderStatus === 'selesai_penyerahan';
    
    const sliceEnd = currentIdx >= 0 ? currentIdx + (isFullyDone ? 1 : 0) : 0;
    const completedStageKeys = new Set(STAGES_ORDER.slice(0, sliceEnd));
    
    // Determine completed and active stages
    const latestCompletedIndex = currentIdx >= 0 ? currentIdx : -1;
    const displayActiveIndex = currentIdx >= 0 ? currentIdx : 0;

    return (
        <div className="bg-surface rounded-[1.5rem] p-8 md:p-6 border border-border shadow-sm flex-1">
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary font-sans">Progres Pesanan</h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                        {isFullyDone ? 'Pesanan telah selesai ' : `${latestCompletedIndex + 1} dari ${STANDARD_STAGES.length} tahap selesai`}
                    </p>
                </div>
            </div>

            {/* Progress bar overall */}
            <div className="mb-6">
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(((latestCompletedIndex + 1) / STANDARD_STAGES.length) * 100)}%` }}
                    />
                </div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest font-sans mt-2 block text-right">
                    {Math.round(((latestCompletedIndex + 1) / STANDARD_STAGES.length) * 100)}% selesai
                </span>
            </div>

            <div className="relative flex flex-col gap-5">
                {/* Vertical Line */}
                <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-border/60 z-0"></div>

                {STANDARD_STAGES.map((stage, index) => {
                    const isCompleted = completedStageKeys.has(stage.key);
                    const isActive = !isCompleted && index === displayActiveIndex;

                    const logData = progressList.find(p =>
                        (p.stage || p.status || '').trim() === stage.key
                    );

                    return (
                        <div key={stage.key} className="relative z-10 flex items-start gap-6 group">
                            {/* Icon */}
                            <div className="shrink-0 mt-0.5 relative">
                                {isCompleted ? (
                                    <div className="w-7 h-7 rounded-full bg-primary border-2 border-primary flex items-center justify-center shadow-md shadow-primary/20">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                ) : isActive ? (
                                    <div className="relative w-7 h-7 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full relative z-10"></div>
                                    </div>
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-white border-2 border-border flex items-center justify-center">
                                        <div className="w-2 h-2 bg-border rounded-full"></div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-2 transition-all duration-500 ${isActive ? 'translate-x-1' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <span className={`text-[12px] font-bold tracking-wide uppercase font-sans leading-tight ${
                                        isCompleted ? 'text-text-primary' :
                                        isActive    ? 'text-primary' :
                                                      'text-text-muted/40'
                                    }`}>
                                        {stage.label}
                                    </span>
                                    {isActive && (
                                        <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full uppercase tracking-widest font-sans animate-pulse">
                                            Sedang
                                        </span>
                                    )}
                                    {isCompleted && logData && (
                                        <span className="shrink-0 text-[9px] text-text-muted font-sans flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(logData.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {isActive && (
                                    <p className="text-[11px] font-body text-text-secondary mt-2 leading-relaxed">
                                        {stage.desc}
                                    </p>
                                )}

                                {/* Admin's note from log */}
                                {isCompleted && logData?.description && (
                                    <p className="text-[11px] font-body text-text-muted/80 mt-1 italic leading-relaxed">
                                        "{logData.description}"
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
