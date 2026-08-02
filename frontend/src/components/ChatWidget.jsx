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
    const [adminOnline, setAdminOnline] = useState(false);
    
    // Generate a storage key based on auth status
    const getStorageKey = useCallback(
        () => user ? `chat_session_user_${user.id}` : 'chat_session_guest',
        [user]
    );
    
    const sessionIdRef = useRef(null);
    
    

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

    const fetchAdminStatus = useCallback(async () => {
        try {
            const res = await axios.get('/chat/admin-status');
            setAdminOnline(Boolean(res.data?.online));
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        if (!sessionInitialized) return;

        localStorage.setItem(getStorageKey(), sessionIdRef.current);
        queueMicrotask(fetchMessages); // Fetch on mount
        // Poll fast while the widget is open (live chat), much slower in the
        // background (just to keep the unread badge fresh) to avoid hammering
        // the server on every page of the site.
        const interval = setInterval(fetchMessages, isOpen ? 3000 : 20000);
        return () => clearInterval(interval);
    }, [fetchMessages, getStorageKey, sessionInitialized, isOpen]);

    useEffect(() => {
        if (!sessionInitialized) return;

        queueMicrotask(fetchAdminStatus);
        const interval = setInterval(fetchAdminStatus, 30000);
        return () => clearInterval(interval);
    }, [fetchAdminStatus, sessionInitialized]);

    const chatBodyRef = useRef(null);

    // Auto-scroll to bottom INSIDE chat box only — not the whole page
    useEffect(() => {
        if (isOpen && chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
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
                    className="bg-white w-72 md:w-80 h-[420px] shadow-2xl rounded-2xl flex flex-col border border-gray-100 animate-slide-up relative overflow-hidden"
                >
                    <div className="bg-primary text-white p-3 rounded-t-2xl flex justify-between items-center border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            {/* Era Jahit avatar */}
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
                                <span className="text-primary font-bold text-sm select-none">EJ</span>
                            </div>
                            <div className="leading-tight">
                                <span className="font-bold block text-sm">Era Jahit</span>
                                {adminOnline ? (
                                    <span className="flex items-center gap-1 text-[10px] text-green-200">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                                        Online
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] text-white/60">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full inline-block"></span>
                                        Biasanya membalas dalam beberapa jam
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200 focus:outline-none"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={chatBodyRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-white relative" id="customer-chat-body">
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
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-grow border border-gray-400 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 transition-all font-sans min-w-0"
                            placeholder="Tulis pesan..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 flex-shrink-0 disabled:opacity-50"
                            style={{ backgroundColor: '#115e59', width: '38px', height: '38px', minWidth: '38px' }}
                        >
                            <Send size={18} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
