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
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        ref={modalRef}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-sm w-full relative flex flex-col border border-white/20"
                    >
                        {/* HEADER with macOS dots */}
                        <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 leading-tight">Welcome Back</h2>
                                    <p className="text-xs text-neutral-400 font-medium">Sign in to continue</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setAuthModalOpen(false)}
                                className="p-3 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT AREA with grid pattern */}
                        <div className="flex-1 p-6 sm:p-8 bg-[#FAFAFA] relative flex flex-col items-center text-center">
                            {/* Grid Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col items-center w-full">
                                {/* Logo */}
                                <div className="w-20 h-20 mb-6 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 to-transparent" />
                                    <img src={logo} alt="Handwritten" className="w-12 h-12 object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                
                                <p className="text-sm text-neutral-500 mb-8 leading-relaxed max-w-[260px]">
                                    Sign in to save your masterpieces and export without limits.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => login()}
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin text-white/70" />
                                    ) : (
                                        <>
                                            <div className="bg-white p-1.5 rounded-full"><img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" /></div>
                                            <span className="font-bold text-sm tracking-wide">Sign in with Google</span>
                                        </>
                                    )}
                                </motion.button>
                                
                                {isLoading && <p className="text-xs text-neutral-400 mt-4 animate-pulse">Connecting to secure server...</p>}

                                <div className="mt-8 pt-6 border-t border-neutral-200 w-full">
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span>Encrypted & Private</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
