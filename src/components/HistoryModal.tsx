import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Download, Trash2, FileText, Package, ShieldCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getAllExportedFiles, deleteExportedFile, type StoredFile } from '../lib/fileStorage';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);

    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const storedFiles = await getAllExportedFiles();
            setFiles(storedFiles);
        } catch (err) {
            console.error('Failed to load history:', err);
            addToast('Failed to load history', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (isOpen) {
            loadFiles();
        }
    }, [isOpen, loadFiles]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleDownload = (file: StoredFile) => {
        const url = URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast('Download started', 'success');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Permanently delete this file from your local history?')) {
            try {
                await deleteExportedFile(id);
                setFiles(prev => prev.filter(f => f.id !== id));
                addToast('File deleted', 'info');
            } catch {
                addToast('Delete failed', 'error');
            }
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        ref={modalRef}
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-xl w-full relative flex flex-col max-h-[85vh] border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-neutral-900 leading-tight">Export History</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                        <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">
                                            Saved locally on your device
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* List Content */}
                        <div className="overflow-y-auto p-6 space-y-3 flex-1 scrollbar-hide">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-bold tracking-widest uppercase text-xs">Loading Vault...</p>
                                </div>
                            ) : files.length === 0 ? (
                                <div className="text-center py-16 px-8">
                                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText size={40} className="text-neutral-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">No exports found</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                                        Your exported PDFs and ZIPs will appear here automatically. Everything is stored privately in your browser.
                                    </p>
                                </div>
                            ) : (
                                files.map((file) => (
                                    <motion.div 
                                        layout
                                        key={file.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group p-5 rounded-3xl border border-neutral-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`p-3 rounded-2xl shrink-0 ${
                                                file.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                                            }`}>
                                                {file.type === 'pdf' ? <FileText size={20} /> : <Package size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-neutral-900 truncate pr-2" title={file.name}>
                                                    {file.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-medium text-neutral-400">
                                                        {formatDate(file.timestamp)}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                                                        {formatSize(file.size)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDownload(file)}
                                                className="p-3 rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                                                title="Download File"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(file.id)}
                                                className="p-3 rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete from History"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-6 bg-neutral-50 border-t border-neutral-100">
                            <p className="text-[9px] text-center text-neutral-400 uppercase tracking-[0.2em] font-black">
                                Private Local Storage • No Data Leaves This Browser
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
