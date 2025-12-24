import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, User, Settings, Share2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EditorTopBarProps {
    title: string;
    onTitleChange: (title: string) => void;
    lastSaved?: string;
    isSaving?: boolean;
}

export default function EditorTopBar({ title, onTitleChange, lastSaved, isSaving }: EditorTopBarProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300 pointer-events-auto h-[60px] ${isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)]' : 'bg-white/80 backdrop-blur-md'
                }`}
        >
            {/* Left Section */}
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 10 }}
                        className="size-8 bg-black rounded-lg flex items-center justify-center text-white font-bold"
                    >
                        I
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden md:flex items-center text-gray-400 group-hover:text-black transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        <span className="text-sm font-medium">Home</span>
                    </motion.div>
                </Link>

                <div className="h-6 w-px bg-gray-200 hidden md:block" />

                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm font-semibold tracking-tight text-black placeholder:text-gray-300 w-48 md:w-64"
                    placeholder="Untitled Document"
                />
            </div>

            {/* Center Section: Auto-save status */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-[11px] font-medium text-gray-400">
                {isSaving ? (
                    <>
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="size-1.5 rounded-full bg-black"
                        />
                        <span>Saving...</span>
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={12} className="text-gray-300" />
                        <span>Last saved {lastSaved || 'just now'}</span>
                    </>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all" title="Help">
                    <HelpCircle size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all" title="Profile">
                    <User size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all" title="Settings">
                    <Settings size={18} />
                </button>

                <div className="h-6 w-px bg-gray-100 mx-2" />

                <button className="flex items-center gap-2 px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:scale-105 shadow-sm transition-all">
                    <span>Share</span>
                    <Share2 size={14} />
                </button>

                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-100 text-xs font-bold rounded-full hover:bg-gray-50 transition-all">
                    <span>Export</span>
                    <ChevronDown size={14} />
                </button>
            </div>
        </motion.header>
    );
}
