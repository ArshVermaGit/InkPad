import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../hooks/useToast';
import type { HistoryItem } from '../types';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const { history, setText } = useStore();
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);

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

    const handleRestore = (item: HistoryItem) => {
        if (confirm('Restore this version? current unsaved changes will be replaced.')) {
            setText(item.text);
            addToast('Version restored', 'success');
            onClose();
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        ref={modalRef}
                        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-xl">
                                    <Clock size={20} className="text-ink" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-ink">Version History</h2>
                                    <p className="text-[10px] uppercase font-bold text-ink/40 tracking-widest">
                                        Local History ({history.length})
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 text-ink/30 hover:text-ink hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto p-4 space-y-2 flex-1 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                                        <Clock size={32} className="text-ink/20" />
                                    </div>
                                    <h3 className="text-sm font-bold text-ink/60">No history yet</h3>
                                    <p className="text-xs text-ink/40 mt-1">
                                        Versions are saved automatically when you make changes while signed in.
                                    </p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div 
                                        key={item.id}
                                        className="group p-4 rounded-2xl border border-gray-100 hover:border-black/5 hover:bg-gray-50 transition-all flex items-center justify-between gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-ink">
                                                    {formatDate(item.timestamp)}
                                                </span>
                                                {/* Preview of first few words */}
                                            </div>
                                            <p className="text-xs text-ink/60 truncate font-mono bg-white/50 p-1 rounded inline-block max-w-full">
                                                {item.text.replace(/<[^>]*>/g, '').substring(0, 40) || 'Empty document'}...
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleRestore(item)}
                                            className="p-2 rounded-xl bg-white border border-gray-200 text-ink/40 hover:text-accent hover:border-accent hover:shadow-md transition-all group-hover:opacity-100 opacity-0"
                                            title="Restore this version"
                                        >
                                            <RotateCcw size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
