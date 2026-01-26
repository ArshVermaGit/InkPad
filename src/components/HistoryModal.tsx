import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Download, Trash2, Package, ShieldCheck, Search, ArrowLeft } from 'lucide-react';
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

                        {/* CONTENT AREA with list view */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-white relative custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-medium text-xs text-neutral-400">Loading...</p>
                                </div>
                            ) : filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <Package size={24} className="text-neutral-200 mb-3" />
                                    <p className="text-neutral-400 text-sm">
                                        {searchQuery ? 'No matches found' : 'No history yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-1">
                                    {filteredFiles.map((file, index) => (
                                        <motion.div 
                                            layout
                                            key={file.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100"
                                        >
                                            <div className="min-w-0 flex-1 pl-1">
                                                <span className="font-medium text-neutral-700 text-sm truncate block" title={file.name}>
                                                    {file.name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleDownload(file)}
                                                    className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(file.id)}
                                                    className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
