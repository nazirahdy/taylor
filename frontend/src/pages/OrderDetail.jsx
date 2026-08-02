import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, Activity } from 'lucide-react';
import { useToast } from '../components/Toast';
import OrderInfo from '../components/order/OrderInfo';
import ProgressTracker from '../components/order/ProgressTracker';

const OrderDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Prevent auto-scroll caused by polling re-renders
    const hasScrolled = useRef(false);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/orders/${id}`);
            setOrder(res.data?.data || res.data);
        } catch (err) {
            console.error(err);
            toast.error('Terjadi kesalahan memuat detail pesanan.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Scroll to top once when page first loads — not on every re-render
    useEffect(() => {
        if (!isLoading && order && !hasScrolled.current) {
            hasScrolled.current = true;
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }, 0);
        }
    }, [isLoading, order]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                <span className="text-[12px] text-text-muted uppercase tracking-[0.4em] font-bold font-sans">Memuat Data Pesanan...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-text-muted font-body">
                Data pesanan tidak ditemukan di arsip studio
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-text-primary pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header Actions */}
                <div className="mb-7 flex items-center justify-between">
                    <Link to="/dashboard" className="group inline-flex items-center gap-3 text-text-muted font-bold hover:text-primary transition-all text-[11px] uppercase tracking-widest font-sans">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform"/> Kembali ke Portal Pesanan
                    </Link>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[11px] text-text-muted uppercase tracking-widest font-sans font-bold">Sistem Era Jahit v2.0</span>
                    </div>
                </div>

                {/* Order Info */}
                <OrderInfo order={order} />

                {/* Progress Tracker */}
                <div className="mt-8 animate-slide-up">
                    <div className="flex items-center gap-4 mb-8">
                        <Activity className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-display font-bold text-text-primary">Tahapan Pengerjaan</h2>
                    </div>
                    <ProgressTracker orderId={order.id} orderStatus={order.status} />
                </div>

            </div>
        </div>
    );
};

export default OrderDetail;
