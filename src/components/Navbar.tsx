import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../lib/store';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { user, setAuthModalOpen } = useAuth();
    const { isNavbarVisible } = useStore();

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: isNavbarVisible ? 0 : -150 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none"
            >
                <div className="w-full max-w-2xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-3xl sm:rounded-4xl px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center pointer-events-auto">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group relative">
                        <img 
                            src={logo} 
                            alt="Handwritten" 
                            className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-500" 
                        />
                        <span className="hidden sm:inline text-xl sm:text-2xl font-display font-bold text-neutral-900 tracking-tight">Handwritten.</span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <UserMenu />
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-neutral-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <span className="hidden sm:inline">Get Started</span>
                                <span className="sm:hidden">Start</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.nav>
            
            <AuthModal />
        </>
    );
}
