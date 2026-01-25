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
        if (status === 'complete') return 'Your document is ready for download';
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
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md">
                    {/* BACKDROP */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={status === 'complete' || status === 'error' || status === 'idle' ? onClose : undefined}
                        className="absolute inset-0"
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-md w-full relative flex flex-col max-h-[85vh] border border-white/20"
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
                                    <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 leading-tight">
                                        {status === 'complete' ? 'Export Complete!' : isPDF ? 'Export as PDF' : 'Export as ZIP'}
                                    </h2>
                                    <p className="text-xs text-neutral-400 font-medium">{getStatusMessage()}</p>
                                </div>
                            </div>
                            {(status === 'complete' || status === 'error' || status === 'idle') && (
                                <button 
                                    onClick={onClose}
                                    className="p-3 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* CONTENT AREA with grid pattern */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAFAFA] relative flex flex-col items-center">
                            {/* Grid Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

                            {/* ICON / PROGRESS RING */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8 flex items-center justify-center z-10">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-neutral-100"
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
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100">
                                            {isPDF ? <FileText size={32} className="text-neutral-400" /> : <ImageIcon size={32} className="text-neutral-400" />}
                                        </div>
                                    ) : <Loader2 size={32} className="text-neutral-200 animate-spin" />}
                                </div>
                            </div>

                            {/* FORM / STATUS CONTENT */}
                            <div className="w-full space-y-6 relative z-10">
                                {status === 'idle' || status === 'error' ? (
                                    <>
                                        <div className="text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">File Name</label>
                                            <div className="flex items-center gap-2 p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm">
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
                                            className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20"
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
                                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Download size={18} />
                                        Done
                                    </motion.button>
                                ) : (
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-100">
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center truncate">
                                            {fileName}.{format}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
