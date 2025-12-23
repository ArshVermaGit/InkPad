import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Editor', path: '/editor' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Styles', path: '/styles' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-display ${isScrolled
                    ? 'py-4 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm'
                    : 'py-8 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
                        <span className="text-white font-bold text-lg italic">I</span>
                    </div>
                    <span className="text-xl font-bold tracking-tighter uppercase">InkPad</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`text-sm font-medium tracking-widest uppercase transition-colors relative group ${location.pathname === item.path ? 'text-black' : 'text-gray-400 hover:text-black'
                                }`}
                        >
                            {item.name}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-black transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                                }`} />
                        </Link>
                    ))}
                    <Link
                        to="/editor"
                        className="btn-minimal-primary text-xs tracking-widest uppercase px-6 py-2"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-black"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-6 md:hidden shadow-xl"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`text-lg font-bold uppercase tracking-widest ${location.pathname === item.path ? 'text-black' : 'text-gray-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            to="/editor"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn-minimal-primary text-center uppercase tracking-widest py-4"
                        >
                            Start Writing
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
