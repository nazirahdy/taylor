import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Menu, X, User, Phone, LogOut, Settings, KeyRound, Ruler, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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

            // ScrollSpy logic
            if (location.pathname === '/') {
                const sections = ['beranda', 'about', 'services', 'gallery', 'faq', 'contact'];
                let current = '';
                
                // Reverse array to find the lowest section that is above the threshold
                for (let i = sections.length - 1; i >= 0; i--) {
                    const element = document.getElementById(sections[i]);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        if (rect.top <= 200) {
                            current = `#${sections[i]}`;
                            break;
                        }
                    }
                }

                if (current && current !== activeSection) {
                    setActiveSection(current);
                } else if (window.scrollY === 0) {
                    setActiveSection('#beranda');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname, activeSection]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navItems = [
        { name: 'Beranda', path: '/', hash: '#beranda' },
        { name: 'Tentang', path: '/', hash: '#about' },
        { name: 'Layanan', path: '/', hash: '#services' },
        { name: 'Galeri', path: '/', hash: '#gallery' },
        { name: 'Kontak', path: '/', hash: '#contact' }
    ];

    const handleNavClick = (e, item) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const hash = item.hash || '#beranda';
            const element = document.querySelector(hash);
            if (element) {
                if (hash === '#beranda') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const navbarOffset = 65;
                    const y = element.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
                    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                }
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
        : 'bg-transparent py-3 border-b border-transparent';
        
    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md ${navbarBgClass}`}>
            <div className="container mx-auto px-4 md:px-12">
                <div className="flex justify-between items-center">
                    
                    {/* Logo */}
                    <Link to="/" onClick={(e) => handleNavClick(e, { hash: '#beranda' })} className="flex items-center group">
                        <div className="h-9 md:h-10 w-auto flex items-center justify-center group-hover:scale-105 transition-transform duration-500 drop-shadow-md">
                            <img src="/logo.png" alt="Era Jahit Logo" className="h-full w-auto object-contain" />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
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
                    <div className="hidden md:flex items-center gap-6">
                        {!user ? (
                            <Link
                                to="/login"
                                className="px-7 py-2.5 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 font-sans"
                            >
                                Masuk / Daftar
                            </Link>
                        ) : (
                            <div className={`flex items-center gap-4 border-l pl-6 ${isTransparent ? 'border-white/20' : 'border-border'}`}>
                                <Link to="/dashboard" className="flex flex-col items-end group">
                                    <span className={`text-[9px] uppercase tracking-widest font-bold font-sans ${isTransparent ? 'text-white/80' : 'text-text-muted'}`}>Portal Pelanggan</span>
                                    <span className={`text-xs font-display font-bold transition-colors ${isTransparent ? 'text-white group-hover:text-primary' : 'text-text-primary group-hover:text-primary'}`}>{user.name?.split(' ')[0]}</span>
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all group overflow-hidden ${isTransparent ? 'bg-white/10 border-white/20 hover:border-primary' : 'bg-surface border-border hover:border-primary hover:text-primary'}`}
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profil" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className={`w-4 h-4 transition-transform group-hover:scale-110 ${isTransparent ? 'text-white group-hover:text-primary' : 'text-text-secondary group-hover:text-primary'}`} />
                                        )}
                                    </button>
                                    
                                    {isProfileDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-3 flex flex-col gap-1">
                                                    <div className="px-4 py-3 mb-2 flex items-center gap-3 border-b border-border/60 pb-4">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <span className="block text-sm font-bold text-text-primary truncate">{user.name}</span>
                                                            <span className="block text-[10px] text-text-muted truncate">{user.email || user.phone_wa}</span>
                                                        </div>
                                                    </div>
                                                    <Link to="/profile/edit" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-primary hover:bg-surface hover:text-primary transition-all rounded-xl font-sans group">
                                                        <Settings className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" /> Kelola Profil
                                                    </Link>
                                                    <Link to="/profile/password" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-primary hover:bg-surface hover:text-primary transition-all rounded-xl font-sans group">
                                                        <KeyRound className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" /> Pengaturan Sandi
                                                    </Link>
                                                    <Link to="/profile/measurements" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-primary hover:bg-surface hover:text-primary transition-all rounded-xl font-sans group">
                                                        <Ruler className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" /> Ukuran Badan
                                                    </Link>
                                                    <Link to="/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-text-primary hover:bg-surface hover:text-primary transition-all rounded-xl font-sans group">
                                                        <FileText className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" /> Riwayat Pesanan
                                                    </Link>
                                                    <div className="h-[1px] bg-border my-1"></div>
                                                    <button onClick={() => { setIsProfileDropdownOpen(false); logout(); }} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-all rounded-xl font-sans w-full text-left">
                                                        <LogOut className="w-4 h-4" /> Keluar Akun
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
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
                ${isMobileMenuOpen ? 'max-h-[90vh] py-6 shadow-2xl overflow-y-auto' : 'max-h-0 py-0'}
            `}>
                <div className="container mx-auto px-6 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path + item.hash}
                            onClick={(e) => handleNavClick(e, item)}
                            className={`
                                py-3 text-base font-display font-bold border-b border-border flex justify-between items-center transition-all
                                ${isActive(item) ? 'text-primary pl-3' : 'text-text-secondary'}
                            `}
                        >
                            {item.name}
                            <span className="text-[9px] text-primary/30 font-sans font-bold">0{navItems.indexOf(item) + 1}</span>
                        </Link>
                    ))}

                    <div className="mt-6 flex flex-col gap-3">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="w-full py-3.5 text-center rounded-xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 font-sans">
                                    Dashboard Pelanggan
                                </Link>
                                <Link to="/profile/edit" className="w-full py-3.5 text-center rounded-xl border border-border text-text-primary font-bold uppercase tracking-[0.2em] text-[10px] bg-surface font-sans">
                                    Kelola Profil
                                </Link>
                                <button onClick={logout} className="w-full py-3.5 text-center rounded-xl border border-red-100 text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-red-50 font-sans mt-2 flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" /> Keluar Akun
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="w-full py-3.5 text-center rounded-xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 font-sans">
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


