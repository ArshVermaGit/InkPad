import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../lib/store';
import { PenTool, ArrowRight, X } from 'lucide-react';

export default function WelcomeModal({ onStartTour }: { onStartTour: () => void }) {
    const { hasSeenOnboarding, completeOnboarding } = useStore();

    if (hasSeenOnboarding) return null;

    const handleSkip = () => {
        completeOnboarding();
    };

    const handleStart = () => {
        completeOnboarding();
        onStartTour();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden relative"
                >
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative h-48 bg-black flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.2]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-center relative z-10"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-[-5deg]">
                                <PenTool size={32} className="text-black" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">InkPad.</h2>
                        </motion.div>
                    </div>

                    <div className="p-8 text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Handwriting made digital.</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Create beautiful handwritten documents, customize your unique style, and export to PDF in seconds.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={handleStart}
                                className="w-full py-4 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-black/10"
                            >
                                Start Interactive Tour
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={handleSkip}
                                className="w-full py-3 text-gray-400 hover:text-gray-900 text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Skip Intro
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
