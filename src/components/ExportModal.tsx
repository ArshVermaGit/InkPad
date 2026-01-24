import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, FileText, ImageIcon, X, Loader2, Play } from 'lucide-react';
import { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (name: string) => void;
    format: 'pdf' | 'zip';
    progress: number;
    status: 'idle' | 'processing' | 'complete' | 'error';
    initialFileName: string;
}

export default function ExportModal({ 
    isOpen, onClose, onStart, format, progress, status, initialFileName 
}: ExportModalProps) {
    const isPDF = format === 'pdf';
    const [fileName, setFileName] = useState(initialFileName);
    
    // Status messages for flavor
    const getStatusMessage = () => {
        if (status === 'complete') return 'Export Complete!';
        if (status === 'error') return 'Export Failed. Try again?';
        if (status === 'idle') return isPDF ? 'Ready to generate PDF' : 'Ready to package images';
        
        if (progress < 30) return isPDF ? 'Scanning Pages...' : 'Capturing Canvases...';
        if (progress < 60) return isPDF ? 'Simulating High-DPI Ink...' : 'Optimizing Pixel Quality...';
        if (progress < 90) return isPDF ? 'Calibrating A4 Alignment...' : 'Compressing Images into ZIP...';
        return 'Finalizing Document...';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4">
                    {/* BACKDROP */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={status === 'complete' || status === 'error' || status === 'idle' ? onClose : undefined}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-black/5 overflow-hidden p-6 sm:p-10 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto"
                    >
                        {/* CLOSE BUTTON */}
                        {(status === 'complete' || status === 'error' || status === 'idle') && (
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X size={20} className="text-neutral-400" />
                            </button>
                        )}

                        {/* ICON / PROGRESS RING */}
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-neutral-50"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray="377"
                                    initial={{ strokeDashoffset: 377 }}
                                    animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
                                    className="text-neutral-900"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {status === 'complete' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 size={48} className="text-emerald-500" />
                                    </motion.div>
                                ) : status === 'processing' ? (
                                     <div className="flex flex-col items-center">
                                         {isPDF ? <FileText size={32} className="text-neutral-400" /> : <ImageIcon size={32} className="text-neutral-400" />}
                                         <span className="text-xs font-black mt-2">{progress}%</span>
                                     </div>
                                ) : status === 'idle' ? (
                                    <div className="p-4 bg-neutral-50 rounded-full">
                                        {isPDF ? <FileText size={32} className="text-neutral-400" /> : <ImageIcon size={32} className="text-neutral-400" />}
                                    </div>
                                ) : <Loader2 size={32} className="text-neutral-200 animate-spin" />}
                            </div>
                        </div>

                        {/* CONTENT */}
                        <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2">
                            {status === 'complete' ? 'Success!' : isPDF ? 'Export as PDF' : 'Export as ZIP'}
                        </h3>
                        <p className="text-neutral-400 text-xs sm:text-sm font-medium tracking-tight h-5 mb-6 sm:mb-8">
                            {getStatusMessage()}
                        </p>

                        <div className="w-full space-y-6">
                            {status === 'idle' || status === 'error' ? (
                                <>
                                    <div className="text-left">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">File Name</label>
                                        <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-black/5 rounded-xl">
                                            <input 
                                                type="text" 
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                className="bg-transparent border-none focus:outline-none text-sm font-medium flex-1"
                                                placeholder="my-document"
                                            />
                                            <span className="text-neutral-400 text-xs font-bold">.{format}</span>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        onClick={() => onStart(fileName)}
                                        className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        <Play size={18} fill="white" />
                                        Start Export
                                    </motion.button>
                                </>
                            ) : status === 'complete' ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={onClose}
                                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shadow-xl"
                                >
                                    <Download size={18} />
                                    Close
                                </motion.button>
                            ) : (
                                <div className="p-4 bg-neutral-50 rounded-2xl">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center truncate">
                                        {fileName}.{format}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
