import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, 
    ZoomIn, 
    ZoomOut, 
    Loader2,
    Upload,
    FileText,
    Download,
    FileDown,
    Bold,
    Italic,
    Underline,
    List,
    Layers,
    ChevronLeft,
    ChevronRight,
    Search,
    HelpCircle,
    LayoutTemplate,
    Zap,
    Monitor,
    Type,
    Settings2,
    Sparkles,
    RotateCcw,
    Palette,
    FileImage,
    Layout,
    Share2,
    CheckCircle2,
    Image as ImageIcon,
    User
} from 'lucide-react';
import { useStore } from '../lib/store';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import type { HandwritingCanvasHandle } from '../components/HandwritingCanvas';
import type { PaperMaterial } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';

// Font Definitions
const HANDWRITING_FONTS = [
    { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive" },
    { id: 'gloria-hallelujah', name: 'Gloria Hallelujah', family: "'Gloria Hallelujah', cursive" },
    { id: 'indie-flower', name: 'Indie Flower', family: "'Indie Flower', cursive" },
    { id: 'shadows-into-light', name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
    { id: 'patrick-hand', name: 'Patrick Hand', family: "'Patrick Hand', cursive" },
    { id: 'permanent-marker', name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
    { id: 'kalam', name: 'Kalam', family: "'Kalam', cursive" },
    { id: 'homemade-apple', name: 'Homemade Apple', family: "'Homemade Apple', cursive" },
    { id: 'reenie-beanie', name: 'Reenie Beanie', family: "'Reenie Beanie', cursive" },
    { id: 'nothing-you-could-do', name: 'Nothing You Could Do', family: "'Nothing You Could Do', cursive" },
];

// Ink Color Presets
const INK_COLORS = [
    { id: 'blue-dark', name: 'Blue Dark', color: '#0051a8' },
    { id: 'blue-light', name: 'Blue Light', color: '#0066cc' },
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'black-gray', name: 'Black Gray', color: '#333333' },
    { id: 'red', name: 'Red', color: '#cc0000' },
];

// Paper Types with CSS backgrounds
const PAPER_TYPES = [
    { id: 'white', name: 'White', bg: '#ffffff', pattern: 'none' },
    { id: 'ruled', name: 'Standard Ruled', bg: '#ffffff', pattern: 'repeating-linear-gradient(transparent, transparent 38px, #e0e0e0 38px, #e0e0e0 40px)' },
    { id: 'college', name: 'College Ruled', bg: '#ffffff', pattern: 'repeating-linear-gradient(transparent, transparent 28px, #e0e0e0 28px, #e0e0e0 30px)' },
    { id: 'wide', name: 'Wide Ruled', bg: '#ffffff', pattern: 'repeating-linear-gradient(transparent, transparent 48px, #e0e0e0 48px, #e0e0e0 50px)' },
    { id: 'graph', name: 'Graph Paper', bg: '#ffffff', pattern: 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)' },
    { id: 'dotted', name: 'Dotted Paper', bg: '#ffffff', pattern: 'radial-gradient(circle, #c0c0c0 1px, transparent 1px)' },
    { id: 'vintage', name: 'Vintage', bg: '#f5f0e1', pattern: 'none' },
    { id: 'aged', name: 'Aged Manuscript', bg: '#e8dcc4', pattern: 'none' },
    { id: 'love-letter', name: 'Love Letter', bg: '#fff0f5', pattern: 'none' },
    { id: 'birthday', name: 'Birthday', bg: '#fffbf0', pattern: 'none' },
    { id: 'christmas', name: 'Christmas', bg: '#f0fff4', pattern: 'none' },
    { id: 'professional', name: 'Professional', bg: '#ffffff', pattern: 'none' },
    { id: 'custom', name: 'Custom Upload', bg: '#ffffff', pattern: 'none' },
];

export default function EditorPage() {
    const {
        text,
        setText,
        lastSaved,
        setLastSaved,
        zoom,
        setZoom,
        editorMode,
        setEditorMode,
        uploadedFileName,
        setUploadedFileName,
        handwritingStyle,
        setHandwritingStyle,
        fontSize,
        setFontSize,
        letterSpacing,
        setLetterSpacing,
        lineHeight,
        setLineHeight,
        wordSpacing,
        setWordSpacing,
        inkColor,
        setInkColor,
        paperMaterial,
        setPaperMaterial,
        paperShadow,
        setPaperShadow,
        paperTexture,
        setPaperTexture,
        paperTilt,
        setPaperTilt: setStorePaperTilt,
        isRendering,
        setIsRendering,
        renderingProgress,
        applyPreset: applyStorePreset,
        reset: resetStore
    } = useStore();
    const [fontSearch, setFontSearch] = useState('');
    const richTextRef = useRef<HTMLDivElement>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isPresetsOpen, setIsPresetsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Page state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // UI Layout State
    const [activeTab, setActiveTab] = useState<'style' | 'paper' | 'export'>('style');
    
    // Auto-save feedback logic
    const [secondsAgo, setSecondsAgo] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsAgo(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Rendering State
    const [isLoading, setIsLoading] = useState(true);
    const [isSampleLoading, setIsSampleLoading] = useState(false);
    const debouncedText = useDebounce(text, 300);
    const debouncedFontFamily = useDebounce(handwritingStyle, 300);
    const debouncedPaperMaterial = useDebounce(paperMaterial, 300);
    
    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [exportQuality, setExportQuality] = useState(1.0);
    const canvasRef = useRef<HandwritingCanvasHandle>(null);
    const { addToast } = useToast();


    // Export Handlers
    const handleExportPDF = useCallback(async () => {
        if (!canvasRef.current || isExporting) return;
        setIsExporting(true);
        addToast('Generating High-Resolution PDF...');
        try {
            const pdf = await canvasRef.current.exportPDF();
            pdf.save(`${uploadedFileName || 'inkpad-document'}.pdf`);
            addToast('PDF Downloaded!');
        } catch (error) {
            console.error(error);
            addToast('Export failed', 'error');
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, uploadedFileName, addToast]);

    const handleExportPNG = useCallback(async () => {
        if (!canvasRef.current || isExporting) return;
        setIsExporting(true);
        const formatLabel = exportFormat === 'image/png' ? 'PNG' : 'JPEG';
        addToast(`Capturing Page as ${formatLabel}...`);

        try {
            const dataUrl = await canvasRef.current.exportPNG(exportQuality, exportFormat);
            const link = document.createElement('a');
            link.download = `${uploadedFileName || 'inkpad-page'}.${exportFormat === 'image/png' ? 'png' : 'jpg'}`;
            link.href = dataUrl;
            link.click();
            addToast(`${formatLabel} Downloaded!`);
        } catch (error) {
            console.error(error);
            addToast('Export failed', 'error');
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, uploadedFileName, addToast, exportFormat, exportQuality]);

    const handleExportZIP = useCallback(async () => {
        if (!canvasRef.current || isExporting) return;
        setIsExporting(true);
        addToast('Compressing Workspace into ZIP...');
        try {
            const blob = await canvasRef.current.exportZIP();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${uploadedFileName || 'inkpad-workspace'}.zip`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            addToast('ZIP Archive Downloaded!');
        } catch (error) {
            console.error(error);
            addToast('Export failed', 'error');
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, uploadedFileName, addToast]);

    const presets = {
        homework: {
            handwritingStyle: 'gloria-hallelujah',
            inkColor: '#0051a8',
            paperMaterial: 'college' as const,
            fontSize: 18,
            lineHeight: 1.6,
            paperShadow: true,
            paperTilt: false,
        },
        love: {
            handwritingStyle: 'indie-flower',
            inkColor: '#cc0000',
            paperMaterial: 'love-letter' as const,
            fontSize: 20,
            lineHeight: 1.4,
            paperShadow: true,
            paperTilt: true,
        },
        professional: {
            handwritingStyle: 'patrick-hand',
            inkColor: '#000000',
            paperMaterial: 'professional' as const,
            fontSize: 16,
            lineHeight: 1.5,
            paperShadow: false,
            paperTilt: false,
        },
        history: {
            handwritingStyle: 'caveat',
            inkColor: '#333333',
            paperMaterial: 'aged' as const,
            fontSize: 17,
            lineHeight: 1.8,
            paperShadow: true,
            paperTilt: false,
        }
    } as const;


    const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 text-accent rounded-xl shadow-inner-paper">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/60">{title}</span>
        </div>
    );

    const HelpModal = () => (
        <AnimatePresence>
            {isHelpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsHelpModalOpen(false)}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-md" 
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg glass border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
                    >
                        <h2 className="text-3xl font-display font-black text-ink mb-8 flex items-center gap-4">
                            <Sparkles className="text-accent" fill="currentColor" /> Mastery Guide
                        </h2>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-paper rounded-4xl border border-black/5 shadow-inner-paper">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4">Shortcuts</h3>
                                    <ul className="space-y-3 text-xs font-bold text-ink/70">
                                        <li className="flex justify-between"><span>Generate</span> <span className="text-accent/60">Ctrl+G</span></li>
                                        <li className="flex justify-between"><span>PNG Export</span> <span className="text-accent/60">Ctrl+D</span></li>
                                        <li className="flex justify-between"><span>Clear Editor</span> <span className="text-accent/60">Ctrl+K</span></li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-paper rounded-4xl border border-black/5 shadow-inner-paper">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-4">Modes</h3>
                                    <p className="text-[11px] text-ink/60 leading-relaxed font-bold">
                                        Use <span className="text-ink">Rich Mode</span> for structural formatting, bolding, and image integration.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/30">Artisan Tips</h3>
                                <div className="flex gap-4 items-start p-5 border-2 border-dashed border-black/5 rounded-3xl bg-paper/50">
                                    <Monitor size={20} className="text-accent shrink-0" />
                                    <p className="text-[11px] text-ink/50 font-bold leading-relaxed">
                                        Leverage <span className="text-ink">Presets</span> to instantly achieve professional results across various document types.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsHelpModalOpen(false)}
                            className="w-full mt-10 btn-premium rounded-2xl py-5"
                        >
                            Understood
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const WorkspaceHeader = () => (
        <header className="h-20 flex items-center justify-between px-8 border-b border-black/5 bg-paper/80 backdrop-blur-md z-30 shrink-0">
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => resetStore()}>
                    <div className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center group-hover:bg-accent transition-all duration-500 shadow-lg shadow-ink/10 group-hover:scale-110">
                        <span className="text-white font-display font-black text-xl italic leading-none">I</span>
                    </div>
                    <h1 className="text-2xl font-display font-bold tracking-tight text-ink uppercase">InkPad</h1>
                </div>
                
                <div className="h-8 w-px bg-black/5" />
                
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 group">
                        <input 
                            type="text"
                            value={uploadedFileName || 'Untitled Masterpiece'}
                            onChange={(e) => setUploadedFileName(e.target.value)}
                            className="text-sm font-bold bg-transparent border-none p-0 focus:ring-0 w-64 hover:bg-black/5 rounded-lg px-2 py-1 transition-all text-ink/80"
                        />
                        <Share2 size={14} className="text-ink/20 group-hover:text-accent cursor-pointer transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-2">
                        {isLoading ? (
                            <span className="flex items-center gap-2 text-accent"><Loader2 size={10} className="animate-spin" /> Synchronizing...</span>
                        ) : (
                            <span className="flex items-center gap-2 text-ink/30"><CheckCircle2 size={10} className="text-accent" /> {lastSaved ? `Preserved ${secondsAgo}s ago` : 'Awaiting Input'}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-1 p-1 bg-black/5 rounded-2xl border border-black/5">
                    <button 
                        onClick={() => setEditorMode('plain')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${editorMode === 'plain' ? 'glass shadow-sm text-ink' : 'text-ink/30 hover:text-ink'}`}
                    >
                        Plain
                    </button>
                    <button 
                        onClick={() => setEditorMode('rich')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${editorMode === 'rich' ? 'glass shadow-sm text-ink' : 'text-ink/30 hover:text-ink'}`}
                    >
                        Rich
                    </button>
                </div>

                <div className="h-8 w-px bg-black/5" />

                <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="btn-premium rounded-2xl py-3 px-8 text-[10px] shadow-xl shadow-ink/10"
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Export Master PDF
                </button>

                <div className="w-11 h-11 flex items-center justify-center glass hover:bg-white rounded-2xl transition-all border border-black/5 cursor-pointer group shadow-sm">
                    <User size={20} className="text-ink/40 group-hover:text-ink transition-colors" />
                </div>
            </div>
        </header>
    );

    const SlimActionBar = () => (
        <aside className="w-20 flex flex-col items-center py-8 gap-8 border-r border-black/5 bg-paper/50 z-20 shrink-0">
            <button 
                onClick={() => setIsPresetsOpen(!isPresetsOpen)}
                className={`p-4 rounded-2xl transition-all group relative ${isPresetsOpen ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-110' : 'hover:bg-black/5 text-ink/30 hover:text-ink'}`}
                title="Themes & Presets"
            >
                <LayoutTemplate size={24} />
                {isPresetsOpen && <motion.div layoutId="sidebar-accent" className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full" />}
            </button>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl hover:bg-black/5 text-ink/30 hover:text-ink transition-all group scale-100 hover:scale-110"
                title="Import Text"
            >
                <Upload size={24} />
            </button>

            <button 
                onClick={() => setActiveTab('export')}
                className={`p-4 rounded-2xl transition-all group relative ${activeTab === 'export' ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-110' : 'hover:bg-black/5 text-ink/30 hover:text-ink'}`}
                title="Export Center"
            >
                <Download size={24} />
                {activeTab === 'export' && <motion.div layoutId="sidebar-accent" className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full" />}
            </button>

            <div className="mt-auto flex flex-col gap-6">
                <button 
                    onClick={() => setIsHelpModalOpen(true)}
                    className="p-4 rounded-2xl hover:bg-black/5 text-ink/20 hover:text-ink transition-all"
                    title="Documentation"
                >
                    <HelpCircle size={24} />
                </button>
                <button 
                    onClick={() => resetStore()}
                    className="p-4 rounded-2xl hover:bg-red-50 text-ink/10 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                    title="Reset Master"
                >
                    <Trash2 size={24} />
                </button>
            </div>
        </aside>
    );

    const RightSettingsSidebar = () => (
        <aside className="w-80 h-full border-l border-gray-100 bg-white flex flex-col overflow-hidden z-20 shrink-0">
            {/* Tab Switcher */}
            <div className="px-8 pt-8 mb-10">
                <div className="flex p-1 bg-black/5 rounded-2xl border border-black/5">
                    {(['style', 'paper', 'export'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                                activeTab === tab 
                                ? 'glass shadow-sm text-ink' 
                                : 'text-ink/30 hover:text-ink'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {activeTab === 'style' && (
                        <motion.div
                            key="style"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <SectionHeader icon={<Type size={14} />} title="Typography" />
                                <div className="relative group">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20 group-focus-within:text-accent transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="Find your style..."
                                        value={fontSearch}
                                        onChange={(e) => setFontSearch(e.target.value)}
                                        className="w-full bg-black/5 border border-black/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all shadow-inner-paper placeholder:text-ink/20"
                                    />
                                </div>
                                <div className="relative">
                                    <select 
                                        value={handwritingStyle}
                                        onChange={(e) => setHandwritingStyle(e.target.value)}
                                        className="w-full bg-black/5 border border-black/5 rounded-2xl py-3 px-5 text-xs font-bold focus:ring-2 focus:ring-accent/20 outline-none appearance-none cursor-pointer text-ink/80"
                                    >
                                        {filteredFonts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink/20 shadow-inner-paper">
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Layout Control</label>
                                    <button onClick={() => resetStore()} className="text-[9px] font-bold text-blue-500 uppercase tracking-widest hover:underline">Reset</button>
                                </div>
                                
                                {[
                                    { label: 'Font Size', value: fontSize, min: 12, max: 32, step: 1, setter: setFontSize },
                                    { label: 'Letter Gap', value: letterSpacing, min: -2, max: 10, step: 0.1, setter: setLetterSpacing },
                                    { label: 'Word Gap', value: wordSpacing, min: 0, max: 20, step: 0.5, setter: setWordSpacing },
                                    { label: 'Line Height', value: lineHeight, min: 1, max: 3, step: 0.1, setter: setLineHeight },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em]">
                                            <span className="text-ink/60">{item.label}</span>
                                            <span className="text-accent bg-accent/10 px-2 py-0.5 rounded shadow-inner-paper">{item.value === -2 ? 0 : item.value}{item.label.includes('Size') ? 'px' : ''}</span>
                                        </div>
                                        <input 
                                            type="range" min={item.min} max={item.max} step={item.step} value={item.value}
                                            onChange={(e) => item.setter(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-black/5 rounded-full appearance-none cursor-pointer accent-accent"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <SectionHeader icon={<Palette size={14} />} title="Ink Choice" />
                                <div className="flex flex-wrap gap-2">
                                    {INK_COLORS.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setInkColor(c.color)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${inkColor === c.color ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                                            style={{ backgroundColor: c.color }}
                                            title={c.name}
                                        />
                                    ))}
                                    <div className="relative group overflow-hidden w-8 h-8 rounded-full border border-gray-100 shadow-sm">
                                        <input 
                                            type="color" 
                                            value={inkColor}
                                            onChange={(e) => setInkColor(e.target.value)}
                                            className="absolute -inset-1 cursor-pointer w-[150%] h-[150%]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'paper' && (
                        <motion.div
                            key="paper"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <SectionHeader icon={<FileText size={14} />} title="Manuscript Paper" />
                                <div className="grid grid-cols-2 gap-3">
                                    {PAPER_TYPES.slice(0, 10).map((paper) => (
                                        <button
                                            key={paper.id}
                                            onClick={() => setPaperMaterial(paper.id as PaperMaterial)}
                                            className={`p-4 rounded-2xl text-left transition-all border group ${
                                                paperMaterial === paper.id 
                                                ? 'bg-black text-white border-black shadow-xl shadow-black/10' 
                                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm'
                                            }`}
                                        >
                                            <Layout size={16} className={`mb-3 ${paperMaterial === paper.id ? 'text-blue-400' : 'text-gray-300'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-tight leading-none block">{paper.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <SectionHeader icon={<Settings2 size={14} />} title="Natural imperfections" />
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'shadow', label: 'Cast Shadows', icon: <Layers size={14} />, active: paperShadow, toggle: () => setPaperShadow(!paperShadow), bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', activeBg: 'bg-blue-500', iconBg: 'bg-blue-100' },
                                        { id: 'grain', label: 'Paper Texture', icon: <Sparkles size={14} />, active: paperTexture, toggle: () => setPaperTexture(!paperTexture), bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', activeBg: 'bg-emerald-500', iconBg: 'bg-emerald-100' },
                                        { id: 'tilt', label: 'Writing Slant', icon: <RotateCcw size={14} />, active: paperTilt, toggle: () => setStorePaperTilt(!paperTilt), bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', activeBg: 'bg-amber-500', iconBg: 'bg-amber-100' },
                                    ].map((effect) => (
                                        <button
                                            key={effect.id}
                                            onClick={effect.toggle}
                                            className={`flex items-center justify-between p-4 rounded-2xl font-bold text-xs transition-all border ${
                                                effect.active 
                                                ? `${effect.bg} ${effect.text} ${effect.border} shadow-sm` 
                                                : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${effect.active ? effect.iconBg : 'bg-gray-100/50'}`}>
                                                    {effect.icon}
                                                </div>
                                                {effect.label}
                                            </div>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${effect.active ? effect.activeBg : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${effect.active ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'export' && (
                        <motion.div
                            key="export"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <SectionHeader icon={<FileDown size={14} />} title="Resolution Settings" />
                                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Format</label>
                                        <div className="flex p-1 bg-white rounded-xl border border-gray-100">
                                            {(['image/png', 'image/jpeg'] as const).map((fmt) => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => setExportFormat(fmt)}
                                                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${exportFormat === fmt ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
                                                >
                                                    {fmt.split('/')[1]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Quality</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Ultra', val: 1.0 },
                                                { label: 'High', val: 0.9 },
                                                { label: 'Mid', val: 0.7 },
                                            ].map((q) => (
                                                <button
                                                    key={q.label}
                                                    onClick={() => setExportQuality(q.val)}
                                                    className={`py-2 text-[10px] font-bold uppercase border rounded-xl transition-all ${exportQuality === q.val ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    {q.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <SectionHeader icon={<Download size={14} />} title="Single Page" />
                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        onClick={handleExportPNG}
                                        disabled={isExporting}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileImage size={18} className="text-blue-500" />
                                            <span className="text-xs font-bold">Download Current</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500" />
                                    </button>
                                    <button 
                                        onClick={handleExportZIP}
                                        disabled={isExporting}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Layers size={18} className="text-emerald-500" />
                                            <span className="text-xs font-bold">Export All (ZIP)</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );

    const CenterStage = () => (
        <section className="flex-1 bg-paper-dark/30 relative flex flex-col overflow-hidden">
            {/* Floating Presets Menu */}
            <AnimatePresence>
                {isPresetsOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute left-4 top-4 z-40 w-64 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Quick Themes</h3>
                        </div>
                        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                            {Object.entries(presets).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        applyStorePreset(preset);
                                        setIsPresetsOpen(false);
                                        addToast(`Applied ${key} theme!`);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl transition-all group text-left"
                                >
                                    <span className="text-xs font-bold uppercase tracking-tight">{key}</span>
                                    <Zap size={14} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP HUD (Zoom & Pages) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50">
                <div className="flex items-center gap-1 border-r border-gray-100 pr-2">
                     {zoomLevels.map((lvl) => (
                        <button
                            key={lvl.label}
                            onClick={() => setZoom(lvl.value)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                                Math.abs(zoom - lvl.value) < 0.01 
                                ? 'bg-black text-white' 
                                : 'hover:bg-gray-100 text-gray-400'
                            }`}
                        >
                            {lvl.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 px-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        Page {currentPage} <span className="text-gray-300">/</span> {totalPages}
                        <span className="ml-4 text-gray-400 border-l border-gray-100 pl-4">{wordCount} words / {charCount} characters</span>
                    </span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* WORKSPACE CONTENT (Editor or Canvas) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Sidebar (Conditional) */}
                <motion.div 
                    layout
                    className="w-[480px] h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden shrink-0"
                >
                    <div className="flex-1 overflow-y-auto p-8 pt-20">
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader icon={<FileText size={14} />} title="Input Message" />
                            <button 
                                onClick={() => loadSampleText()}
                                className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline"
                            >
                                Sample
                            </button>
                        </div>

                        <div className="relative group flex-1 flex flex-col min-h-[400px]">
                            {editorMode === 'plain' ? (
                                <textarea
                                    value={text}
                                    onChange={handleTextChange}
                                    placeholder="Start typing your handwriting masterpiece..."
                                    className="flex-1 w-full p-6 bg-gray-50/50 rounded-3xl border-2 border-transparent focus:border-blue-100 focus:bg-white resize-none outline-none text-sm font-medium leading-relaxed transition-all placeholder:text-gray-300 scrollbar-hide shadow-inner"
                                />
                            ) : (
                                <div
                                    ref={richTextRef}
                                    contentEditable
                                    onInput={handleRichTextChange}
                                    className="flex-1 w-full p-6 bg-gray-50/50 rounded-3xl border-2 border-transparent focus:border-blue-100 focus:bg-white outline-none text-sm font-medium leading-relaxed transition-all prose prose-sm max-w-none scrollbar-hide overflow-y-auto shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: text }}
                                />
                            )}
                            {editorMode === 'rich' && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur rounded-xl shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => execCommand('bold')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Bold size={14} /></button>
                                    <button onClick={() => execCommand('italic')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Italic size={14} /></button>
                                    <button onClick={() => execCommand('underline')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Underline size={14} /></button>
                                    <div className="w-px h-4 bg-gray-100 mx-1" />
                                    <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><List size={14} /></button>
                                    <button onClick={() => imageInputRef.current?.click()} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ImageIcon size={14} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* PREVIEW AREA */}
                <div className="flex-1 h-full overflow-auto flex items-center justify-center p-20 scrollbar-hide relative bg-[#f0f1f3]">
                    <AnimatePresence mode="wait">
                        {isLoading || isRendering || isSampleLoading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <Loader2 className="w-10 h-10 text-black/10 animate-spin" />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                        {isRendering ? `Writing... ${Math.round(renderingProgress * 100)}%` : 'Opening InkPad'}
                                    </span>
                                    {isRendering && renderingProgress > 0 && (
                                        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-blue-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${renderingProgress * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="canvas"
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ 
                                    scale: zoom, 
                                    opacity: 1, 
                                    y: 0 
                                }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="origin-center"
                            >
                                <HandwritingCanvas 
                                    ref={canvasRef}
                                    text={debouncedText}
                                    currentPage={currentPage}
                                    onRenderComplete={(total) => {
                                        if (total !== totalPages) setTotalPages(total);
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ZOOM HUD */}
                    <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                        <button 
                            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                            className="p-3 bg-white hover:bg-black hover:text-white rounded-2xl shadow-xl transition-all group border border-gray-100"
                            title="Zoom In"
                        >
                            <ZoomIn size={18} className="text-gray-400 group-hover:text-white" />
                        </button>
                        <button 
                            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                            className="p-3 bg-white hover:bg-black hover:text-white rounded-2xl shadow-xl transition-all group border border-gray-100"
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} className="text-gray-400 group-hover:text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );

    // List of filtered fonts
    const filteredFonts = useMemo(() => {
        if (!fontSearch.trim()) return HANDWRITING_FONTS;
        return HANDWRITING_FONTS.filter(f => 
            f.name.toLowerCase().includes(fontSearch.toLowerCase())
        );
    }, [fontSearch]);

    // Initial load
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Last saved display timer
    useEffect(() => {
        if (!lastSaved) return;
        const interval = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
            setSecondsAgo(diff);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    // Handle rendering state based on debounced values
    useEffect(() => {
        if (text !== debouncedText || handwritingStyle !== debouncedFontFamily || paperMaterial !== debouncedPaperMaterial) {
            setIsRendering(true);
        } else {
            // Once they match, the canvas will start rendering and eventually call onRenderComplete
        }
    }, [text, debouncedText, handwritingStyle, debouncedFontFamily, paperMaterial, debouncedPaperMaterial, setIsRendering]);

    // 10-second Auto-save Interval
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            setLastSaved(new Date());
        }, 10000);
        return () => clearInterval(autoSaveInterval);
    }, [setLastSaved]);

    // Handle Plain Text Changes
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Handle Rich Text Changes
    const handleRichTextChange = () => {
        if (richTextRef.current) {
            setText(richTextRef.current.innerHTML);
        }
    };

    // Sync Rich Text Ref on mode switch or load
    useEffect(() => {
        if (editorMode === 'rich' && richTextRef.current && richTextRef.current.innerHTML !== text) {
            richTextRef.current.innerHTML = text;
        }
    }, [editorMode, text]);

    // File Upload Logic
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxFileSize = 5 * 1024 * 1024; // 5MB limit
        if (file.size > maxFileSize) {
            addToast('File too large (max 5MB)', 'error');
            return;
        }

        setIsLoading(true);
        try {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    setText(content);
                    setUploadedFileName(file.name);
                    addToast('Text file loaded!', 'success');
                };
                reader.readAsText(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await (await import('mammoth')).convertToHtml({ arrayBuffer });
                setText(result.value);
                setUploadedFileName(file.name);
                addToast('DOCX file loaded!', 'success');
            } else if (file.type === 'application/pdf') {
                const pdfjs = await import('pdfjs-dist');
                // Set worker src - assuming the CDN is fine for now or it's handled by vite
                pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
                
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items
                        .map((item) => {
                            const textItem = item as { str?: string };
                            return textItem.str || '';
                        })
                        .join(' ') + '\n\n';
                }
                setText(fullText);
                setUploadedFileName(file.name);
                addToast('PDF text extracted!', 'success');
            } else {
                addToast('Unsupported file type. Use .txt, .docx, or .pdf', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            addToast('Failed to read file', 'error');
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const loadSampleText = () => {
        setIsSampleLoading(true);
        setTimeout(() => {
            const sample = `<h1>Welcome to InkPad!</h1>
<p>This is a <b>digital manuscript</b> that feels like it was written by hand. You can format your text with <i>italics</i>, <u>underlines</u>, and different heading levels.</p>

<h3>Writing Experience</h3>
<p>InkPad is designed for those who miss the touch of paper but love the convenience of digital. Whether you're drafting a letter, a journal entry, or just some quick notes, we bring the soul back to your writing.</p>

<ul>
  <li>Instant Handwriting Conversion</li>
  <li>Custom Paper & Ink Styles</li>
  <li>High-Resolution PDF Exports</li>
</ul>

<p>Try changing the handwriting style in the sidebar or adjusting the typography to find your perfect flow.</p>`;
            setText(sample);
            setEditorMode('rich');
            addToast('Sample text loaded!', 'success');
            setIsSampleLoading(false);
        }, 600);
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleRichTextChange();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                execCommand('insertImage', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearContent = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all text and saved data?')) {
            setText('');
            setUploadedFileName(null);
            setLastSaved(null);
            if (richTextRef.current) richTextRef.current.innerHTML = '';
            localStorage.removeItem('inkpad-core-storage');
        }
    }, [setText, setUploadedFileName, setLastSaved]);




    const wordCount = useMemo(() => {
        const plainText = text.replace(/<[^>]*>/g, ' ');
        return plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    }, [text]);

    const charCount = text.replace(/<[^>]*>/g, '').length;

    // Headless SEO / Accessibility Titles
    useEffect(() => {
        document.title = text ? `Editing: ${text.slice(0, 20)}... | InkPad` : 'InkPad | Beautiful Handwriting Generator';
    }, [text]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'g') {
                    e.preventDefault();
                    handleExportPDF();
                }
                if (e.key === 'd') {
                    e.preventDefault();
                    handleExportPNG();
                }
                if (e.key === 'k') {
                    e.preventDefault();
                    clearContent();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [clearContent, handleExportPDF, handleExportPNG]);

    const zoomLevels = [
        { label: 'Fit', value: 0.65 }, // Roughly fit for most displays
        { label: '75%', value: 0.75 },
        { label: '100%', value: 1 },
        { label: '125%', value: 1.25 },
        { label: '150%', value: 1.5 },
    ];

    return (
        <div className="flex flex-col h-screen bg-white font-sans text-gray-900 overflow-hidden select-none">
            {/* TOP HEADER */}
            <WorkspaceHeader />
            
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SLIM BAR */}
                <SlimActionBar />

                {/* MAIN CONTENT AREA */}
                <CenterStage />

                {/* RIGHT SETTINGS SIDEBAR */}
                <RightSettingsSidebar />
            </div>

            {/* GLOBAL MODALS */}
            <HelpModal />
            
            {/* HIDDEN INPUTS */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.docx,.pdf" />
            <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    );
}
