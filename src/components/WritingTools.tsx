import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    BarChart3,
    Search,
    Type,
    Eraser,
    BookOpen,
    ArrowRightLeft,
    Check,
    Clock
} from 'lucide-react';
import { useStore } from '../lib/store';
import {
    calculateStats,
    convertCase,
    cleanupText,
    findAndReplace
} from '../utils/writingUtils';
import type { TextCase } from '../utils/writingUtils';
import BatchOperations from './BatchOperations';

export default function WritingTools() {
    const { text, setText } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [stats, setStats] = useState(calculateStats(text));

    useEffect(() => {
        setStats(calculateStats(text));
    }, [text]);

    const handleReplace = () => {
        const newText = findAndReplace(text, findText, replaceText);
        setText(newText);
    };

    const handleCase = (type: TextCase) => {
        setText(convertCase(text, type));
    };

    const handleCleanup = (options: { extraSpaces?: boolean; lineBreaks?: boolean }) => {
        setText(cleanupText(text, { ...options, trim: true }));
    };

    return (
        <div className="relative flex pointer-events-none">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-black text-white rounded-l-xl shadow-2xl pointer-events-auto transition-transform hover:-translate-x-1 ${isOpen ? '-translate-x-80' : 'translate-x-0'}`}
                title="Writing Tools"
            >
                {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 320 }}
                        animate={{ x: 0 }}
                        exit={{ x: 320 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-100 shadow-2xl z-40 p-6 flex flex-col pointer-events-auto overflow-y-auto custom-scrollbar"
                    >
                        <div className="mt-12 flex flex-col gap-8">
                            {/* Statistics section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 size={14} className="text-gray-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Manuscript Stats</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <StatCard label="Words" value={stats.words} />
                                    <StatCard label="Characters" value={stats.characters} />
                                    <StatCard label="Sentences" value={stats.sentences} />
                                    <StatCard label="Read Time" value={`${stats.readingTime}m`} icon={<Clock size={10} />} />
                                </div>
                            </section>

                            <div className="h-px bg-gray-50" />

                            {/* Batch Operations section */}
                            <section>
                                <BatchOperations />
                            </section>

                            <div className="h-px bg-gray-50" />

                            {/* Find and Replace section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Search size={14} className="text-gray-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Find & Replace</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="text"
                                            placeholder="Find..."
                                            value={findText}
                                            onChange={(e) => setFindText(e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-bold focus:outline-none"
                                        />
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <input
                                            type="text"
                                            placeholder="Replace with..."
                                            value={replaceText}
                                            onChange={(e) => setReplaceText(e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-bold focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleReplace}
                                        className="w-full py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowRightLeft size={12} /> Replace All
                                    </button>
                                </div>
                            </section>

                            <div className="h-px bg-gray-50" />

                            {/* Case Conversion section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Type size={14} className="text-gray-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Case Transformer</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <ToolButton onClick={() => handleCase('upper')} label="UPPER" />
                                    <ToolButton onClick={() => handleCase('lower')} label="lower" />
                                    <ToolButton onClick={() => handleCase('title')} label="Title Case" />
                                    <ToolButton onClick={() => handleCase('sentence')} label="Sentence" />
                                </div>
                            </section>

                            <div className="h-px bg-gray-50" />

                            {/* Cleanup section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Eraser size={14} className="text-gray-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Document Cleanup</h3>
                                </div>
                                <div className="space-y-2">
                                    <ActionButton
                                        onClick={() => handleCleanup({ extraSpaces: true })}
                                        label="Fix Double Spaces"
                                        description="Collapse multiple spaces to one"
                                    />
                                    <ActionButton
                                        onClick={() => handleCleanup({ lineBreaks: true })}
                                        label="Fix Extra Breaks"
                                        description="Remove empty lines"
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-gray-50" />

                            {/* Word Suggestion / Thesaurus Placeholder */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={14} className="text-gray-400" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Thesaurus</h3>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-[9px] text-amber-700 font-medium">Coming soon: Smart context-aware word suggestions and synonyms.</p>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                {icon}
            </div>
            <span className="text-sm font-black text-black">{value}</span>
        </div>
    );
}

function ToolButton({ onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className="py-2 border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all"
        >
            {label}
        </button>
    );
}

function ActionButton({ onClick, label, description }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full p-3 border border-gray-100 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-all flex items-center justify-between group"
        >
            <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-black">{label}</span>
                <span className="text-[8px] text-gray-400 font-medium">{description}</span>
            </div>
            <Check size={12} className="text-transparent group-hover:text-black transition-colors" />
        </button>
    );
}
