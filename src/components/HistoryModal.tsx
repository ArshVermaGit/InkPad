import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Download, Trash2, FileText, Package, ShieldCheck, Search } from 'lucide-react';
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
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md">
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
                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-w-2xl w-full relative flex flex-col h-[85vh] border border-white/20"
                    >
                        {/* HEADER with macOS dots */}
                        <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 leading-tight">
                                            Vault History
                                        </h2>
                                        <p className="text-xs text-neutral-400 font-medium">Manage your exported files</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={onClose}
                                    className="p-3 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* SEARCH BAR SECTION */}
                        <div className="px-6 sm:px-8 py-4 bg-white border-b border-neutral-100 shrink-0 relative z-10">
                            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                                <Search size={18} className="text-neutral-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search history..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-neutral-400 text-neutral-900" 
                                />
                            </div>
                        </div>

                        {/* CONTENT AREA with grid pattern */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA] relative custom-scrollbar">
                            {/* Grid Background Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-bold tracking-widest uppercase text-[10px]">Loading Vault...</p>
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                                        <Package size={40} className="text-neutral-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                                        {searchQuery ? 'No matches found' : 'Your vault is empty'}
                                    </h3>
                                    <p className="text-neutral-400 leading-relaxed max-w-xs mx-auto text-xs uppercase tracking-tight">
                                        {searchQuery ? `Nothing found for "${searchQuery}"` : "Exports will appear here."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                    {filteredFiles.map((file, index) => (
                                        <motion.div 
                                            layout
                                            key={file.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl border border-neutral-100 hover:border-indigo-100 transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                                file.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                                            }`}>
                                                {file.type === 'pdf' ? <FileText size={28} /> : <Package size={28} />}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-12">
                                                <h4 className="font-bold text-neutral-900 truncate text-sm mb-1" title={file.name}>
                                                    {file.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                                                    <span>{formatSize(file.size)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                    <span>{formatDate(file.timestamp)}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 absolute right-3">
                                                <button 
                                                    onClick={() => handleDownload(file)}
                                                    className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="Download"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(file.id)}
                                                    className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-5 bg-white border-t border-neutral-100 shrink-0 text-center relative z-10">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-neutral-300 uppercase tracking-widest leading-none">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span>Encrypted Local Storage • Data stays on your device</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
