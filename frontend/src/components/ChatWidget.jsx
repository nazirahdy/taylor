import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sessionInitialized, setSessionInitialized] = useState(false);
    
    // Generate a storage key based on auth status
    const getStorageKey = useCallback(
        () => user ? `chat_session_user_${user.id}` : 'chat_session_guest',
        [user]
    );
    
    const sessionIdRef = useRef(null);
    
    const scrollRef = useRef();

    // Initialize or update session reference when user changes (login/logout)
    useEffect(() => {
        const key = getStorageKey();
        let currentSession = localStorage.getItem(key);

        if (!currentSession) {
            currentSession = Math.random().toString(36).substring(7);
            localStorage.setItem(key, currentSession);
        }

        sessionIdRef.current = currentSession;
        queueMicrotask(() => {
            setMessages([]); // Clear messages immediately on user switch
            if (!user) {
                setIsOpen(false);
            }
            setSessionInitialized(true);
        });
    }, [getStorageKey, user]);

    const fetchMessages = useCallback(async () => {
        try {
            const markReadParam = isOpen ? '&mark_read=true' : '';
            const res = await axios.get(`/chat?session_id=${sessionIdRef.current}${markReadParam}`);
            setMessages(res.data?.data || res.data || []);
        } catch (err) {
            console.error(err);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!sessionInitialized) return;

        localStorage.setItem(getStorageKey(), sessionIdRef.current);
        queueMicrotask(fetchMessages); // Fetch on mount
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages, getStorageKey, sessionInitialized]);

    // Auto-scroll to bottom when messages update
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post('/chat', {
                sender_name: 'Pelanggan',
                message: newMessage,
                session_id: sessionIdRef.current,
            });

            if (res.data?.success) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = messages.filter(msg => msg.is_admin && !msg.is_read).length;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
            {!isOpen ? (
                <button
                    onClick={() => {
                        if (!user) {
                            navigate('/login');
                            return;
                        }
                        setIsOpen(true);
                    }}
                    className="relative bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                >
                    <MessageCircle size={28} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </button>
            ) : (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-80 md:w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col border border-gray-100 animate-slide-up relative overflow-hidden"
                >
                    <div className="bg-primary text-white p-4 rounded-t-2xl flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="font-bold">Chat dengan Era Jahit</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-5 space-y-5 bg-white relative" id="customer-chat-body">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-10 text-sm font-sans">
                                <p>Tanya apa saja seputar pesanan kamu!</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex flex-col max-w-[85%] ${msg.is_admin ? 'items-start' : 'items-end'}`}>
                                    <span style={{ color: msg.is_admin ? '#7b9c9a' : '#9ca3af' }} className="text-[10px] font-bold uppercase tracking-widest mb-1 mx-1 font-sans">
                                        {msg.is_admin ? 'Admin Era Jahit' : 'Kamu'}
                                    </span>
                                    <div className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm font-sans break-words ${msg.is_admin
                                        ? 'text-gray-800'
                                        : 'text-white'
                                        }`}
                                        style={msg.is_admin 
                                            ? { backgroundColor: '#f3f4f6', borderRadius: '0 1.5rem 1.5rem 1.5rem' } 
                                            : { backgroundColor: '#115e59', borderRadius: '1.5rem 0 1.5rem 1.5rem' }
                                        }>
                                        {msg.message}
                                    </div>
                                    <span style={{ color: '#9ca3af' }} className="text-[9px] font-bold uppercase tracking-widest mt-1 mx-1 font-sans">
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef}></div>
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                        <input
                            type="text"
                            className="flex-grow border border-gray-400 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-emerald-600 transition-all font-sans min-w-0"
                            placeholder="Tulis pesan..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0 disabled:opacity-50"
                            style={{ backgroundColor: '#115e59', width: '44px', height: '44px', minWidth: '44px' }}
                        >
                            <Send size={20} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
