import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, login, isLoading } = useAuth();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setAuthModalOpen(false);
            }
        };

        if (isAuthModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAuthModalOpen, setAuthModalOpen]);

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        ref={modalRef}
                        className="bg-white rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl w-full max-w-[calc(100vw-32px)] sm:max-w-sm relative border border-white/20"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => setAuthModalOpen(false)}
                            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-indigo-50 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent opacity-50" />
                                <img src={logo} alt="Handwritten" className="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 mb-2 sm:mb-3 tracking-tight">Welcome Back</h2>
                            <p className="text-xs sm:text-sm text-neutral-500 mb-8 sm:mb-10 leading-relaxed max-w-[260px]">
                                Sign in to save your masterpieces and export without limits.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                onClick={() => login()}
                                disabled={isLoading}
                                className="w-full py-4 px-6 bg-[#1a1a1a] text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin text-white/70" />
                                ) : (
                                    <>
                                        <div className="bg-white p-1 rounded-full"><img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" /></div>
                                        <span className="font-bold text-sm tracking-wide">Sign in with Google</span>
                                    </>
                                )}
                            </motion.button>
                            
                            {isLoading && <p className="text-xs text-neutral-400 mt-3 animate-pulse">Connecting to secure server...</p>}

                            <div className="mt-8 pt-6 border-t border-neutral-100 w-full">
                                <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span>Encrypted & Private</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
