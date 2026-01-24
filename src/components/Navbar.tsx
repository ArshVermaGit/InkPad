import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, setAuthModalOpen } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Editor', path: '/editor' },
        { name: 'About', path: '/about' },
    ];

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled 
                        ? 'py-4' 
                        : 'py-6'
                }`}
            >
                <div className={`max-w-7xl mx-auto px-6 md:px-12 transition-all duration-500 ${
                    isScrolled ? 'px-4' : ''
                }`}>
                    <div className={`relative flex justify-between items-center transition-all duration-500 ${
                        isScrolled 
                            ? 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 rounded-full px-6 py-3' 
                            : 'bg-transparent px-0 py-0'
                    }`}>
                        
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group relative z-10">
                            <div className="relative">
                                <motion.div 
                                    animate={{ rotate: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                                />
                                <img 
                                    src={logo} 
                                    alt="InkPad" 
                                    className="w-14 h-14 object-contain relative z-10" 
                                />
                            </div>
                            <span className="text-3xl font-display font-bold text-neutral-900 tracking-tight hidden sm:block">InkPad</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            <div className="flex items-center bg-white/50 backdrop-blur-sm border border-black/5 rounded-full p-1 pl-2 pr-2">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="relative px-5 py-2 rounded-full text-sm font-bold transition-colors group"
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-pill"
                                                    className="absolute inset-0 bg-neutral-900 rounded-full"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className={`relative z-10 transition-colors ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                                                {link.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <UserMenu />
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setAuthModalOpen(true)}
                                        className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors px-2"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => setAuthModalOpen(true)}
                                        className="relative overflow-hidden px-6 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-bold shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative flex items-center gap-2">
                                            Get Started <Sparkles size={14} className="text-indigo-400" />
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button 
                            className="md:hidden p-2 text-ink/80 hover:text-ink hover:bg-ink/5 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl md:hidden overflow-hidden flex flex-col pt-32 px-6"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-5xl font-display font-black tracking-tight ${
                                            location.pathname === link.path ? 'text-transparent bg-clip-text bg-linear-to-r from-ink to-ink/60' : 'text-ink/20'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-auto mb-10 pb-safe"
                        >
                            <div className="p-6 bg-gray-50 rounded-3xl border border-black/5">
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-bold text-ink text-lg">{user.name}</p>
                                            <p className="text-ink/50 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <button 
                                            onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                            className="w-full py-4 rounded-xl bg-white border border-black/5 text-ink font-bold shadow-sm"
                                        >
                                            Log In
                                        </button>
                                        <button 
                                            onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                            className="w-full py-4 rounded-xl bg-ink text-white font-bold shadow-xl shadow-ink/20"
                                        >
                                            Sign Up for Free
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AuthModal />
        </>
    );
}
