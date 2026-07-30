import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, MapPin } from 'lucide-react';

/* ============================================================
   TOAST CONTEXT
   ============================================================ */
const ToastContext = createContext(null);

let _addToast = null;

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};

/* ============================================================
   TOAST ITEM
   ============================================================ */
const ICONS = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-primary" />,
    location: <MapPin className="w-5 h-5 text-primary" />,
};

const STYLES = {
    success: {
        bar: 'bg-emerald-500',
        icon: 'bg-emerald-50 border-emerald-100',
    },
    error: {
        bar: 'bg-red-500',
        icon: 'bg-red-50 border-red-100',
    },
    warning: {
        bar: 'bg-amber-500',
        icon: 'bg-amber-50 border-amber-100',
    },
    info: {
        bar: 'bg-primary',
        icon: 'bg-primary/5 border-primary/10',
    },
    location: {
        bar: 'bg-primary',
        icon: 'bg-primary/5 border-primary/10',
    },
};

const ToastItem = ({ id, type, message, duration, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [progress, setProgress] = useState(100);
    const intervalRef = useRef(null);
    const style = STYLES[type] || STYLES.info;

    useEffect(() => {
        const enterTimer = setTimeout(() => setVisible(true), 10);

        const step = 50;
        const decrement = (step / duration) * 100;
        intervalRef.current = setInterval(() => {
            setProgress(p => {
                if (p <= 0) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return p - decrement;
            });
        }, step);

        const exitTimer = setTimeout(() => handleClose(), duration);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearInterval(intervalRef.current);
        };
    }, []);

    const handleClose = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onClose(id), 400);
    }, [id, onClose]);

    return (
        <div
            className="relative w-full max-w-sm overflow-hidden"
            style={{
                opacity: visible && !leaving ? 1 : 0,
                transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
                transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)',
                marginBottom: '10px',
            }}
        >
            <div
                className="bg-white border border-border rounded-2xl shadow-2xl shadow-black/8 flex items-start gap-4 p-4 pr-10"
                style={{ fontFamily: 'inherit' }}
            >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${style.icon}`}>
                    {ICONS[type] || ICONS.info}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium leading-snug break-words"
                       style={{ fontFamily: 'inherit' }}>
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-border/40 rounded-b-2xl overflow-hidden">
                <div
                    className={`h-full ${style.bar} transition-none`}
                    style={{ width: `${progress}%`, transition: `width 50ms linear` }}
                />
            </div>
        </div>
    );
};

/* ============================================================
   TOAST PROVIDER
   ============================================================ */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);


    useEffect(() => {
        _addToast = addToast;
        return () => { _addToast = null; };
    }, [addToast]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}

            {/* Toast Container */}
            <div
                style={{
                    position: 'fixed',
                    top: '88px',
                    right: '24px',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                    width: '380px',
                    maxWidth: 'calc(100vw - 48px)',
                }}
            >
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: 'auto', width: '100%' }}>
                        <ToastItem
                            id={t.id}
                            type={t.type}
                            message={t.message}
                            duration={t.duration}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

/* ============================================================
   HELPER – global toast() for use outside React tree
   ============================================================ */
export const toast = {
    success: (msg, dur) => _addToast?.(msg, 'success', dur),
    error: (msg, dur) => _addToast?.(msg, 'error', dur),
    warning: (msg, dur) => _addToast?.(msg, 'warning', dur),
    info: (msg, dur) => _addToast?.(msg, 'info', dur),
    location: (msg, dur) => _addToast?.(msg, 'location', dur),
};

export default ToastProvider;
