import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import { Send, Loader2, MessageSquare, User } from 'lucide-react';

const ChatBoard = ({ orderId }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!orderId) return;
        try {
            const res = await axios.get(`/orders/${orderId}/chat`);
            // Standardize response handling
            const fetchedMessages = res.data?.data || res.data || [];
            setMessages(fetchedMessages);
        } catch (err) {
            console.error("Gagal memuat pesan:", err);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchMessages();
            const pollingId = setInterval(fetchMessages, 5000); 
            return () => clearInterval(pollingId);
        }

    }, [orderId]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        const messageText = newMessage.trim();
        if (!messageText || isLoading || !orderId) return;

        const optimisticId = Date.now();
        const optimisticMessage = {
            id: optimisticId,
            sender_id: user?.id,
            sender_type: 'customer',
            is_admin: false,
            message: messageText,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const res = await axios.post(`/orders/${orderId}/chat`, { 
                message: messageText 
            });
            

            if (res.data?.success) {
                setMessages(prev => prev.map(m => m.id === optimisticId ? res.data.data : m));
            } else {
                fetchMessages();
            }
        } catch (err) {
            console.error("Gagal mengirim chat:", err);

            setMessages(prev => prev.filter(m => m.id !== optimisticId));

            setNewMessage(messageText);
            toast.error('Pesan gagal terkirim. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-border shadow-sm flex-1 flex flex-col overflow-hidden h-full max-h-[700px] min-h-[500px] rounded-[2.5rem] relative">
            
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md p-8 border-b border-border flex items-center justify-between z-10">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative">
                        <User className="w-6 h-6 text-primary" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary font-sans">Tim Penjahit Era Jahit</h3>
                        <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mt-1 font-sans">Konsultasi Aktif</p>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white/40 flex flex-col gap-10 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted/20 gap-8 animate-fade-in">
                        <MessageSquare className="w-16 h-16 stroke-[1px]" />
                        <div className="text-center space-y-3">
                            <p className="text-[12px] uppercase tracking-[0.4em] font-bold font-sans text-text-muted">Mulai Konsultasi</p>
                            <p className="text-[11px] font-body max-w-[240px] text-text-muted/60">Tim penjahit kami siap mendiskusikan kebutuhan busana Anda.</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // Check if it's my message (current user)
                        const isMe = msg.sender_id === user?.id || msg.sender_type === 'customer' || msg.pengirim === 'pelanggan';
                        const isAdmin = msg.sender?.role === 'admin' || msg.is_admin === true;
                        
                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <span className="text-[9px] text-primary font-bold uppercase tracking-widest mb-2 ml-1 font-sans">
                                            {isAdmin ? 'Admin Era Jahit' : (msg.sender?.name || 'Staf')}
                                        </span>
                                    )}
                                    <div className={`p-6 rounded-2xl relative text-[14px] font-body leading-relaxed shadow-sm
                                        ${isMe ? 'bg-primary text-white shadow-lg shadow-primary/10 rounded-tr-none' : 'bg-white text-text-primary border border-border rounded-tl-none'}`
                                    }>
                                        {msg.message || msg.isi}
                                    </div>
                                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-4 font-sans">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-border flex items-end gap-5 z-10 shadow-lg">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSendMessage();
                         }
                    }}
                    placeholder="Tulis pesan atau pertanyaan seputar pesanan Anda..."
                    className="flex-1 bg-surface border border-border px-8 py-5 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-body text-text-primary placeholder:text-text-muted/30 resize-none max-h-32 min-h-[64px]"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim() || isLoading || !orderId}
                    aria-label="Kirim pesan"
                    className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-30 shadow-xl shadow-primary/20 shrink-0 group"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>}
                </button>
            </form>
        </div>
    );
};

export default ChatBoard;

