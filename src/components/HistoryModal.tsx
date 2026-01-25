import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Download, Trash2, FileText, Package, ShieldCheck, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getAllExportedFiles, deleteExportedFile, type StoredFile } from '../lib/fileStorage';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/40 backdrop-blur-md">
                    {/* BACKDROP */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    {/* MODAL CONTAINER */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        ref={modalRef}
                        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl w-[92%] sm:w-full max-w-3xl relative flex flex-col h-auto max-h-[85vh] my-auto border border-white/20"
                    >
                        {/* HEADER with macOS dots */}
                        <div className="p-5 sm:p-8 border-b border-neutral-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div className="hidden sm:block h-6 w-px bg-neutral-100 mx-2" />
                                <button 
                                    onClick={onClose}
                                    className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all flex items-center gap-2 group"
                                    title="Go Back"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 leading-tight">
                                            Vault
                                        </h2>
                                        <p className="text-xs text-neutral-400 font-medium hidden sm:block">Manage exports</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={onClose}
                                    className="p-2 sm:p-3 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* SEARCH BAR SECTION */}
                        <div className="px-5 sm:px-8 py-3 sm:py-4 bg-white border-b border-neutral-100 shrink-0 relative z-10">
                            <div className="flex items-center gap-3 px-4 py-2.5 sm:py-3 bg-neutral-50/50 backdrop-blur-sm rounded-2xl border border-neutral-100 focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                <Search size={16} className="text-neutral-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search your library..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-neutral-400 text-neutral-900" 
                                />
                            </div>
                        </div>

                        {/* CONTENT AREA with grid pattern */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-[#FAFAFA] relative custom-scrollbar">
                            {/* Grid Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-bold tracking-widest uppercase text-[10px]">Loading Vault...</p>
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[2rem] shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                                        <Package size={32} className="text-neutral-200" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">
                                        {searchQuery ? 'No matches found' : 'Your vault is empty'}
                                    </h3>
                                    <p className="text-neutral-400 leading-relaxed max-w-xs mx-auto text-xs uppercase tracking-tight">
                                        {searchQuery ? `Nothing found for "${searchQuery}"` : "Exported documents appear here."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                                    {filteredFiles.map((file, index) => (
                                        <motion.div 
                                            layout
                                            key={file.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm hover:shadow-xl border border-neutral-100 hover:border-indigo-100 transition-all duration-300 flex items-center gap-3 sm:gap-4 relative overflow-hidden"
                                        >
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                                file.type === 'pdf' ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                                            }`}>
                                                {file.type === 'pdf' ? <FileText size={24} /> : <Package size={24} />}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                                                <h4 className="font-bold text-neutral-900 truncate text-xs sm:text-sm mb-0.5 sm:mb-1 leading-tight" title={file.name}>
                                                    {file.name}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                                                    <span>{formatSize(file.size)}</span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-neutral-300" />
                                                    <span>{formatDate(file.timestamp)}</span>
                                                </div>
                                            </div>

                                            {/* Actions - Always visible on mobile, hover on desktop */}
                                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/90 sm:bg-transparent p-1 sm:p-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none border sm:border-0 border-neutral-100">
                                                <button 
                                                    onClick={() => handleDownload(file)}
                                                    className="p-1.5 sm:p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all"
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(file.id)}
                                                    className="p-1.5 sm:p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 sm:p-5 bg-white border-t border-neutral-100 shrink-0 text-center relative z-10">
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black text-neutral-300 uppercase tracking-widest leading-none">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span>Encrypted Local Storage</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
