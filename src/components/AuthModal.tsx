import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, login } = useAuth();
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        ref={modalRef}
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => setAuthModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-ink/30 hover:text-ink hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 mb-4 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm">
                                <img src={logo} alt="InkPad" className="w-10 h-10 object-contain" />
                            </div>
                            
                            <h2 className="text-2xl font-display font-bold text-ink mb-2">Welcome Back</h2>
                            <p className="text-sm text-ink/60 mb-8 leading-relaxed">
                                Sign in to save your documents, custom fonts, and preferences across devices.
                            </p>

                            <button
                                onClick={() => login()}
                                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-sm"
                            >
                                <img 
                                    src="https://www.google.com/favicon.ico" 
                                    alt="Google" 
                                    className="w-5 h-5" 
                                />
                                <span className="font-bold text-ink/80 text-sm">Sign in with Google</span>
                                
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                                <div className="flex items-center justify-center gap-2 text-[10px] text-ink/40 font-bold uppercase tracking-widest">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    <span>Secure & Private</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
