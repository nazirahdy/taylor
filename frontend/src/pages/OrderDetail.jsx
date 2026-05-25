import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {ArrowLeft, Loader2, MessageSquare, Activity} from 'lucide-react';
import OrderInfo from '../components/order/OrderInfo';
import ProgressTracker from '../components/order/ProgressTracker';
import ChatBoard from '../components/order/ChatBoard';

const OrderDetail = () => {
    const { id } = useParams();
    // eslint-disable-next-line no-unused-vars
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('progres');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/orders/${id}`);
            setOrder(res.data?.data || res.data);
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan memuat detail pesanan.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

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
                Data pesanan tidak ditemukan di arsip studio.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-text-primary py-32">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header Actions */}
                <div className="mb-12 flex items-center justify-between">
                    <Link to="/dashboard" className="group inline-flex items-center gap-3 text-text-muted font-bold hover:text-primary transition-all text-[11px] uppercase tracking-widest font-sans">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform"/> Kembali ke Portal Pesanan
                    </Link>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[11px] text-text-muted uppercase tracking-widest font-sans font-bold">Sistem Era Jahit v2.0</span>
                    </div>
                </div>

                {/* Subcomponent 1: Order Info */}
                <OrderInfo order={order} />

                {/* Main Content Area */}
                <div className="flex flex-col md:flex-row gap-10 mt-16 animate-slide-up">
                    
                    {/* TABS (MOBILE ONLY) */}
                    {isMobile && (
                        <div className="flex bg-surface rounded-2xl p-2 border border-border shadow-sm mb-4">
                            <button 
                                onClick={() => setActiveTab('progres')}
                                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'progres' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
                            >
                                <Activity className="w-4 h-4" /> Progres
                            </button>
                            <button 
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> Chat Studio
                            </button>
                        </div>
                    )}

                    {/* Left: Progress Tracker Area */}
                    {(!isMobile || activeTab === 'progres') && (
                        <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col">
                            <ProgressTracker orderId={order.id} isMobile={isMobile} />
                        </div>
                    )}

                    {/* Right: Chat Board Area */}
                    {(!isMobile || activeTab === 'chat') && (
                        <div className="w-full md:w-7/12 lg:w-8/12 flex flex-col h-[70vh] md:h-auto min-h-[600px]">
                            <ChatBoard orderId={order.id} isMobile={isMobile} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default OrderDetail;

