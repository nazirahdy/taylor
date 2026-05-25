import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Menu, X, User, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('#beranda');
    const { user, logout } = useAuth();
    
    const location = useLocation();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSection(location.hash || '#beranda');
    }, [location.hash]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { name: 'Beranda', path: '/', hash: '#beranda' },
        { name: 'Layanan', path: '/', hash: '#services' },
        { name: 'Galeri', path: '/', hash: '#gallery' },
        { name: 'Tentang', path: '/', hash: '#about' },
        { name: 'Kontak', path: '/', hash: '#contact' }
    ];

    const handleNavClick = (e, item) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const hash = item.hash || '#beranda';
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(hash);
                window.history.pushState(null, '', item.path + item.hash);
                setIsMobileMenuOpen(false);
            }
        }
    };

    const isActive = (item) => {
        if (location.pathname !== '/') return location.pathname === item.path;
        return activeSection === (item.hash || '#beranda');
    };

    const isHome = location.pathname === '/';
    const isTransparent = isHome && !isScrolled;

    const navbarBgClass = !isTransparent
        ? 'bg-white/95 shadow-sm py-2 border-b border-border' 
        : 'bg-transparent py-4 border-b border-transparent';
        
    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md ${navbarBgClass}`}>
            <div className="container mx-auto px-4 md:px-12">
                <div className="flex justify-between items-center">
                    
                    {/* Logo */}
                    <Link to="/" onClick={(e) => handleNavClick(e, { hash: '#beranda' })} className="flex items-center group">
                        <div className="h-20 md:h-24 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500 drop-shadow-md">
                            <img src="/logo.png" alt="Era Jahit Logo" className="h-full w-auto object-contain" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-12">
                        {navItems.map((item) => (
                            <Link 
                                key={item.name} 
                                to={item.path + item.hash}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`
                                    font-sans text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative py-2
                                    ${isActive(item)
                                        ? (isTransparent ? 'text-white' : 'text-primary') 
                                        : (isTransparent ? 'text-white/60 hover:text-white' : 'text-text-secondary hover:text-primary')}
                                `}
                            >
                                {item.name}
                                {isActive(item) && (
                                    <span className={`absolute -bottom-1 left-0 w-full h-0.5 rounded-full animate-slide-up ${isTransparent ? 'bg-white' : 'bg-primary'}`} />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-8">
                        {!user ? (
                            <Link 
                                to="/login" 
                                className="px-10 py-3.5 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 font-sans"
                            >
                                Masuk / Daftar
                            </Link>
                        ) : (
                            <div className={`flex items-center gap-6 border-l pl-8 ${isTransparent ? 'border-white/20' : 'border-border'}`}>
                                <Link to="/dashboard" className="flex flex-col items-end group">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold font-sans ${isTransparent ? 'text-white/80' : 'text-text-muted'}`}>Portal Pelanggan</span>
                                    <span className={`text-sm font-display font-bold transition-colors ${isTransparent ? 'text-white group-hover:text-primary' : 'text-text-primary group-hover:text-primary'}`}>{user.name?.split(' ')[0]}</span>
                                </Link>
                                <Link to="/profile" className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all group overflow-hidden ${isTransparent ? 'bg-white/10 border-white/20 hover:border-primary' : 'bg-surface border-border hover:border-primary hover:text-primary'}`}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profil" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className={`w-5 h-5 transition-transform group-hover:scale-110 ${isTransparent ? 'text-white group-hover:text-primary' : 'text-text-secondary group-hover:text-primary'}`} />
                                    )}
                                </Link>
                            </div>
                        )}
                        
                        <a href="tel:+62751456789" className={`flex items-center gap-4 transition-all text-[11px] font-bold uppercase tracking-widest font-sans group ${isTransparent ? 'text-white hover:text-primary' : 'text-text-secondary hover:text-primary'}`}>
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:rotate-12 ${isTransparent ? 'bg-white/10 border-white/20 group-hover:bg-primary group-hover:border-primary' : 'bg-surface border-border group-hover:bg-primary/5 group-hover:border-primary'}`}>
                                <Phone className={`w-4 h-4 transition-transform ${isTransparent ? 'text-white group-hover:text-white' : 'text-primary'}`} />
                            </div>
                            <span>Hubungi</span>
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-text-primary hover:bg-surface'}`}
                    >
                        {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                    
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-border transition-all duration-700 ease-in-out overflow-hidden
                ${isMobileMenuOpen ? 'max-h-[90vh] py-12 shadow-2xl' : 'max-h-0 py-0'}
            `}>
                <div className="container mx-auto px-10 flex flex-col gap-4">
                    {navItems.map((item) => (
                        <Link 
                            key={item.name} 
                            to={item.path + item.hash}
                            onClick={(e) => handleNavClick(e, item)}
                            className={`
                                py-5 text-2xl font-display font-bold border-b border-border flex justify-between items-center transition-all
                                ${isActive(item) ? (isTransparent ? 'text-white pl-4' : 'text-primary pl-4') : (isTransparent ? 'text-white/70' : 'text-text-secondary')}
                            `}
                        >
                            {item.name}
                            <span className="text-[10px] text-primary/30 font-sans font-bold">0{navItems.indexOf(item) + 1}</span>
                        </Link>
                    ))}
                    
                    <div className="mt-12 flex flex-col gap-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="w-full py-6 text-center rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 font-sans">
                                    Dashboard Pelanggan
                                </Link>
                                <Link to="/profile" className="w-full py-6 text-center rounded-2xl border border-border text-text-primary font-bold uppercase tracking-[0.2em] text-[11px] bg-surface font-sans">
                                    Profil Saya
                                </Link>
                                <button onClick={logout} className="w-full py-6 text-center rounded-2xl border border-red-100 text-red-500 font-bold uppercase tracking-[0.2em] text-[11px] bg-red-50 font-sans mt-4 flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" /> Keluar Akun
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="w-full py-6 text-center rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 font-sans">
                                Masuk / Daftar
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;


