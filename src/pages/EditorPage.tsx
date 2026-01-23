import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, ZoomIn, ZoomOut, Loader2, Upload, FileText, Download, FileDown, 
    Bold, Italic, Underline, List, Layers, ChevronLeft, ChevronRight, Search, 
    Zap, Type, Settings2, Sparkles, Palette, FileImage, Layout, CheckCircle2, 
    Image as ImageIcon, PanelLeftClose, PanelLeft, Minimize2
} from 'lucide-react';
import { useStore } from '../lib/store';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import type { HandwritingCanvasHandle } from '../components/HandwritingCanvas';
import type { PaperMaterial } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../hooks/useToast';
import logo from '../assets/logo.png';

// --- CONSTANTS & CONFIG ---

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

const INK_COLORS = [
    { id: 'blue-dark', name: 'Blue Dark', color: '#0051a8' },
    { id: 'blue-light', name: 'Blue Light', color: '#0066cc' },
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'black-gray', name: 'Black Gray', color: '#333333' },
    { id: 'red', name: 'Red', color: '#cc0000' },
];

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

const PRESETS = {
    homework: { handwritingStyle: 'gloria-hallelujah', inkColor: '#0051a8', paperMaterial: 'college' as const, fontSize: 18, lineHeight: 1.6, paperShadow: true, paperTilt: false },
    love: { handwritingStyle: 'indie-flower', inkColor: '#cc0000', paperMaterial: 'love-letter' as const, fontSize: 20, lineHeight: 1.4, paperShadow: true, paperTilt: true },
    professional: { handwritingStyle: 'patrick-hand', inkColor: '#000000', paperMaterial: 'professional' as const, fontSize: 16, lineHeight: 1.5, paperShadow: false, paperTilt: false },
    history: { handwritingStyle: 'caveat', inkColor: '#333333', paperMaterial: 'aged' as const, fontSize: 17, lineHeight: 1.8, paperShadow: true, paperTilt: false }
} as const;

// --- COMPONENTS ---

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div className="group relative flex items-center justify-center">
        {children}
        <div className="absolute left-full ml-3 px-2 py-1 bg-ink text-white text-[10px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {text}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-ink" />
        </div>
    </div>
);

const SectionLabel = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 mb-3 text-ink/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
    </div>
);

// --- MAIN PAGE COMPONENT ---

export default function EditorPage() {
    const {
        text, setText, lastSaved, setLastSaved, zoom, setZoom, editorMode, setEditorMode,
        uploadedFileName, setUploadedFileName, handwritingStyle, setHandwritingStyle,
        fontSize, setFontSize, letterSpacing, setLetterSpacing, lineHeight, setLineHeight,
        wordSpacing, setWordSpacing, inkColor, setInkColor, paperMaterial, setPaperMaterial,
        paperShadow, setPaperShadow, paperTexture, setPaperTexture, paperTilt, setPaperTilt,
        isRendering, setIsRendering, applyPreset
    } = useStore();

    const [fontSearch, setFontSearch] = useState('');
    const richTextRef = useRef<HTMLDivElement>(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [activePanel, setActivePanel] = useState<'style' | 'paper' | 'export' | null>('style'); 
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true); 
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Page State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [secondsAgo, setSecondsAgo] = useState(0);

    // Render & Export State
    const [isLoading, setIsLoading] = useState(true);
    const debouncedText = useDebounce(text, 300);
    const debouncedFontFamily = useDebounce(handwritingStyle, 300);
    const debouncedPaperMaterial = useDebounce(paperMaterial, 300);
    const [isExporting, setIsExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [exportQuality, setExportQuality] = useState(1.0);
    const canvasRef = useRef<HandwritingCanvasHandle>(null);
    const { addToast } = useToast();

    // Derived
    const wordCount = useMemo(() => text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length, [text]);
    const charCount =  text.replace(/<[^>]*>/g, '').length;
    const filteredFonts = useMemo(() => HANDWRITING_FONTS.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase())), [fontSearch]);

    // --- EFFECTS ---

    useEffect(() => { setTimeout(() => setIsLoading(false), 800); }, []);

    useEffect(() => {
        if (!lastSaved) return;
        const i = setInterval(() => setSecondsAgo(Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000)), 1000);
        return () => clearInterval(i);
    }, [lastSaved]);

    useEffect(() => {
        if (text !== debouncedText || handwritingStyle !== debouncedFontFamily || paperMaterial !== debouncedPaperMaterial) setIsRendering(true);
    }, [text, debouncedText, handwritingStyle, debouncedFontFamily, paperMaterial, debouncedPaperMaterial, setIsRendering]);

    useEffect(() => {
        const i = setInterval(() => setLastSaved(new Date()), 10000);
        return () => clearInterval(i);
    }, [setLastSaved]);

    // --- HANDLERS ---

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);
    
    const handleRichTextChange = () => {
        if (richTextRef.current) setText(richTextRef.current.innerHTML);
    };

    useEffect(() => {
        if (editorMode === 'rich' && richTextRef.current && richTextRef.current.innerHTML !== text) {
            richTextRef.current.innerHTML = text;
        }
    }, [editorMode, text]);

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleRichTextChange();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
         const file = e.target.files?.[0];
         if (!file) return;
         if (file.size > 5 * 1024 * 1024) return addToast('File too large (max 5MB)', 'error');
         
         setIsLoading(true);
         try {
             if (file.type === 'text/plain') {
                 const textContent = await file.text();
                 setText(textContent);
             } else if (file.type.includes('wordprocessingml')) {
                 const arrayBuffer = await file.arrayBuffer();
                 const mammoth = await import('mammoth');
                 const result = await mammoth.convertToHtml({ arrayBuffer });
                 setText(result.value);
             } else if (file.type === 'application/pdf') {
                 const pdfjs = await import('pdfjs-dist');
                 pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
                 const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
                 let fullText = '';
                 for (let i = 1; i <= pdf.numPages; i++) {
                     const page = await pdf.getPage(i);
                     const tx = await page.getTextContent();
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     fullText += tx.items.map((item: any) => item.str).join(' ') + '\n\n';
                 }
                 setText(fullText);
             }
             setUploadedFileName(file.name);
             addToast('Document loaded successfully', 'success');
         } catch (err) {
             console.error(err);
             addToast('Failed to load document', 'error');
         } finally {
             setIsLoading(false);
             if (e.target) e.target.value = '';
         }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => execCommand('insertImage', ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };



    const handleExportPDF = useCallback(async () => { 
        if(!canvasRef.current || isExporting) return; 
        setIsExporting(true); 
        addToast('Preparing PDF...'); 
        try { 
            (await canvasRef.current.exportPDF()).save('inkpad-doc.pdf'); 
            addToast('PDF Downloaded'); 
        } catch(error){ 
            console.error(error);
            addToast('Export failed', 'error'); 
        } finally { 
            setIsExporting(false); 
        }
    }, [isExporting, addToast]);

    const handleExportPNG = useCallback(async () => { 
        if(!canvasRef.current || isExporting) return; 
        setIsExporting(true); 
        addToast('Capturing Image...'); 
        try { 
            const url = await canvasRef.current.exportPNG(exportQuality, exportFormat); 
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = `inkpad-page.${exportFormat.split('/')[1]}`; 
            a.click(); 
            addToast('Image Downloaded'); 
        } catch(error){ 
            console.error(error);
            addToast('Export failed', 'error'); 
        } finally { 
            setIsExporting(false); 
        }
    }, [isExporting, addToast, exportQuality, exportFormat]);

    const handleExportZIP = useCallback(async () => { 
        if(!canvasRef.current || isExporting) return; 
        setIsExporting(true); 
        addToast('Zipping...'); 
        try { 
            const blob = await canvasRef.current.exportZIP(); 
            const url = URL.createObjectURL(blob); 
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = 'inkpad-all.zip'; 
            a.click(); 
            URL.revokeObjectURL(url); 
            addToast('ZIP Downloaded'); 
        } catch(error){ 
            console.error(error);
            addToast('Export failed', 'error'); 
        } finally { 
            setIsExporting(false); 
        }
    }, [isExporting, addToast]);

    const shortcuts = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); handleExportPDF(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); handleExportPNG(); }
    }, [handleExportPDF, handleExportPNG]);

    useEffect(() => { window.addEventListener('keydown', shortcuts); return () => window.removeEventListener('keydown', shortcuts); }, [shortcuts]);


    return (
        <div className="relative w-full h-screen bg-[#F2F0E9] text-ink font-sans overflow-hidden selection:bg-accent/20">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply" />
            
            {/* --- HEADER (Floating Desk Bar) --- */}
            <header className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 bg-[#F2F0E9]/80 backdrop-blur-md border-b border-black/5">
                <div className="flex items-center gap-4">
                     <a href="/" className="flex items-center gap-3 group">
                        <img src={logo} alt="InkPad" className="w-8 h-8 object-contain transition-transform group-hover:rotate-12" />
                        <span className="text-xl font-display font-bold uppercase tracking-tight text-ink">InkPad</span>
                    </a>
                    <div className="h-6 w-px bg-black/10 mx-2" />
                    <div className="flex flex-col">
                        <input 
                            value={uploadedFileName || 'Untitled Document'}
                            onChange={(e) => setUploadedFileName(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-bold text-ink focus:ring-0 placeholder:text-ink/40 w-48"
                            placeholder="Name your file..."
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-ink/30">
                            {isRendering ? 'Refining Ink...' : lastSaved ? `Saved ${secondsAgo}s ago` : 'Ready'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl border border-black/5">
                         <button onClick={() => setEditorMode('plain')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editorMode === 'plain' ? 'bg-ink text-white shadow-lg' : 'text-ink/40 hover:text-ink'}`}>Plain</button>
                         <button onClick={() => setEditorMode('rich')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editorMode === 'rich' ? 'bg-ink text-white shadow-lg' : 'text-ink/40 hover:text-ink'}`}>Rich</button>
                    </div>
                    
                    <button onClick={handleExportPDF} disabled={isExporting} className="btn-premium rounded-xl py-2 px-6 text-[10px] shadow-lg shadow-ink/10 flex items-center gap-2">
                        {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        <span>Export PDF</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div className="absolute inset-x-0 bottom-0 top-16 flex overflow-hidden">
                
                {/* 1. LEFT PANEL: INPUT EDITOR (Collapsible) */}
                <motion.div 
                    initial={false}
                    animate={{ width: isLeftPanelOpen ? 400 : 0, opacity: isLeftPanelOpen ? 1 : 0 }}
                    className="relative h-full bg-white border-r border-black/5 shadow-xl shadow-ink/5 z-30 flex flex-col"
                >
                    <div className="flex-1 overflow-hidden relative flex flex-col min-w-[400px]">
                        <div className="p-4 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                            <SectionLabel icon={<FileText size={14} />} title="Input Source" />
                            <div className="flex gap-2">
                                <Tooltip text="Clear">
                                    <button onClick={() => { if(confirm('Clear all?')) setText(''); }} className="p-2 hover:bg-red-50 text-ink/30 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </Tooltip>
                                <Tooltip text="Import">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-black/5 text-ink/30 hover:text-ink rounded-lg transition-colors"><Upload size={16}/></button>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {editorMode === 'plain' ? (
                                <textarea 
                                    value={text} 
                                    onChange={handleTextChange} 
                                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none p-0 text-sm leading-relaxed text-ink/80 placeholder:text-ink/30 font-medium"
                                    placeholder="Start typing your masterpiece..." 
                                />
                            ) : (
                                <div 
                                    ref={richTextRef}
                                    contentEditable
                                    onInput={handleRichTextChange}
                                    className="prose prose-sm max-w-none outline-none text-ink/80 min-h-full"
                                    dangerouslySetInnerHTML={{ __html: text || '<p>Start typing...</p>' }}
                                />
                            )}
                        </div>

                        {/* Rich Text Toolbar (Floating at bottom of input) */}
                        {editorMode === 'rich' && (
                            <div className="p-2 border-t border-black/5 bg-gray-50 flex gap-1 justify-center">
                                <button onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded shadow-sm transition-all"><Bold size={14}/></button>
                                <button onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded shadow-sm transition-all"><Italic size={14}/></button>
                                <button onClick={() => execCommand('underline')} className="p-2 hover:bg-white rounded shadow-sm transition-all"><Underline size={14}/></button>
                                <div className="w-px h-6 bg-black/10 mx-2" />
                                <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded shadow-sm transition-all"><List size={14}/></button>
                                <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-white rounded shadow-sm transition-all"><ImageIcon size={14}/></button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Left Panel Toggle (Floating on 'Desk') */}
                <button 
                    onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                    className={`absolute bottom-6 left-6 z-40 p-3 bg-white border border-black/5 rounded-full shadow-lg text-ink/50 hover:text-ink transition-all ${isLeftPanelOpen ? 'translate-x-[380px]' : 'translate-x-0'}`}
                >
                    {isLeftPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                </button>


                {/* 2. CENTER STAGE: THE DESK & CANVAS */}
                <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center perspective-1000">
                    
                    {/* Zoom HUD */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/40 shadow-xl shadow-ink/5">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-white rounded-full transition-colors"><ZoomOut size={16} className="text-ink/60"/></button>
                        <span className="text-[10px] font-black w-12 text-center text-ink/80">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-white rounded-full transition-colors"><ZoomIn size={16} className="text-ink/60"/></button>
                    </div>

                    {/* Pagination HUD */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 py-2 px-4 bg-ink/5 backdrop-blur-sm rounded-2xl border border-white/20">
                         <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="disabled:opacity-20 hover:text-accent"><ChevronLeft size={18}/></button>
                         <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-ink/60">Page {currentPage} of {totalPages}</span>
                            <span className="text-[8px] font-bold text-ink/30">{wordCount} words / {charCount} chars</span>
                         </div>
                         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="disabled:opacity-20 hover:text-accent"><ChevronRight size={18}/></button>
                    </div>

                    {/* CANVAS CONTAINER */}
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-20 scrollbar-hide">
                         
                        <div className="relative"> 
                            {/* Loader Overlay */}
                            <AnimatePresence>
                                {(isLoading || isRendering) && (
                                    <motion.div 
                                        initial={{opacity:0}} 
                                        animate={{opacity:1}} 
                                        exit={{opacity:0}} 
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-sm"
                                    >
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-ink/10 border-t-accent animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 size={24} className="text-accent animate-pulse" /></div>
                                        </div>
                                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-ink/40 animate-pulse">Inking...</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Canvas - ALWAYS RENDERED */}
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: zoom, y: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                className="relative shadow-2xl shadow-ink/20"
                            >
                                <HandwritingCanvas 
                                    ref={canvasRef}
                                    text={debouncedText}
                                    currentPage={currentPage}
                                    onRenderComplete={setTotalPages}
                                />
                            </motion.div>
                        </div>

                    </div>
                </div>


                {/* 3. RIGHT PANEL: TOOLS & SETTINGS (Notebook Style) */}
                <div className="relative w-[340px] bg-white border-l border-black/5 shadow-2xl shadow-ink/10 z-30 flex flex-col">
                    {/* Tabs */}
                    <div className="flex p-2 bg-gray-50 border-b border-black/5 gap-1">
                        {[
                            { id: 'style', icon: <Palette size={16}/>, label: 'Style' },
                            { id: 'paper', icon: <Layout size={16}/>, label: 'Paper' },
                            { id: 'export', icon: <FileDown size={16}/>, label: 'Export' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActivePanel(tab.id as 'style' | 'paper' | 'export')}
                                className={`flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activePanel === tab.id ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink hover:bg-black/5'}`}
                            >
                                {tab.icon}
                                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-fixed">
                        
                        {/* STYLE TAB */}
                        {activePanel === 'style' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                
                                {/* Presets */}
                                <div className="space-y-3">
                                    <SectionLabel icon={<Zap size={14}/>} title="Quick Looks" />
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(PRESETS).map(([key, preset]) => (
                                            <button 
                                                key={key}
                                                onClick={() => { applyPreset(preset); addToast(`Applied ${key} theme`); }}
                                                className="px-3 py-2 bg-white border border-black/5 rounded-lg text-left hover:border-accent hover:shadow-md transition-all group"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest block group-hover:text-accent">{key}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Selector */}
                                <div className="space-y-3">
                                    <SectionLabel icon={<Type size={14}/>} title="Handwriting" />
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-3 text-ink/30" />
                                        <input 
                                            value={fontSearch}
                                            onChange={e => setFontSearch(e.target.value)}
                                            placeholder="Filter fonts..."
                                            className="w-full bg-white border border-black/5 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                                        {filteredFonts.map(font => (
                                            <button
                                                key={font.id}
                                                onClick={() => setHandwritingStyle(font.id)}
                                                className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${handwritingStyle === font.id ? 'bg-ink text-white border-ink' : 'bg-white border-black/5 hover:border-ink/20'}`}
                                            >
                                                <span style={{ fontFamily: font.family }} className="text-lg">{font.name}</span>
                                                {handwritingStyle === font.id && <CheckCircle2 size={14} className="text-accent" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ink Color */}
                                <div className="space-y-3">
                                     <SectionLabel icon={<Palette size={14}/>} title="Ink Color" />
                                     <div className="flex flex-wrap gap-2">
                                        {INK_COLORS.map(c => (
                                            <button 
                                                key={c.id} 
                                                onClick={() => setInkColor(c.color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform ${inkColor === c.color ? 'scale-110 border-ink shadow-md' : 'border-transparent hover:scale-105'}`} 
                                                style={{ backgroundColor: c.color }}
                                            />
                                        ))}
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-black/10">
                                            <input type="color" value={inkColor} onChange={e => setInkColor(e.target.value)} className="absolute -inset-1 w-[150%] h-[150%] cursor-pointer" />
                                        </div>
                                     </div>
                                </div>

                                {/* Sliders */}
                                <div className="space-y-6 pt-6 border-t border-black/5">
                                    {[
                                        { l: 'Size', v: fontSize, s: setFontSize, min: 10, max: 40, step: 1 },
                                        { l: 'Spacing', v: letterSpacing, s: setLetterSpacing, min: -2, max: 10, step: 0.1 },
                                        { l: 'Leading', v: lineHeight, s: setLineHeight, min: 1, max: 2.5, step: 0.1 },
                                        { l: 'Word Gap', v: wordSpacing, s: setWordSpacing, min: 0, max: 20, step: 1 },
                                    ].map(slider => (
                                        <div key={slider.l} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ink/40">
                                                <span>{slider.l}</span>
                                                <span>{slider.v}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min={slider.min} max={slider.max} step={slider.step} 
                                                value={slider.v} 
                                                onChange={e => slider.s(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-black/10 rounded-full appearance-none cursor-pointer accent-ink"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PAPER TAB */}
                        {activePanel === 'paper' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-3">
                                    {PAPER_TYPES.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => setPaperMaterial(p.id as PaperMaterial)}
                                            className={`p-3 rounded-xl border text-left transition-all ${paperMaterial === p.id ? 'bg-ink text-white border-ink shadow-lg' : 'bg-white border-black/5 hover:border-black/20'}`}
                                        >
                                            <div className={`w-full h-12 mb-2 rounded border bg-gray-50/50 ${paperMaterial === p.id ? 'border-white/20' : 'border-black/5'}`} style={{ background: p.bg }} />
                                            <span className="text-[9px] font-black uppercase tracking-widest block truncate">{p.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-black/5">
                                    <SectionLabel icon={<Sparkles size={14}/>} title="Realism" />
                                    {[
                                        { label: 'Paper Shadow', active: paperShadow, toggle: () => setPaperShadow(!paperShadow) },
                                        { label: 'Texture Grain', active: paperTexture, toggle: () => setPaperTexture(!paperTexture) },
                                        { label: 'Human Tilt', active: paperTilt, toggle: () => setPaperTilt(!paperTilt) },
                                    ].map(opt => (
                                        <button 
                                            key={opt.label}
                                            onClick={opt.toggle}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${opt.active ? 'bg-accent/10 border-accent text-accent' : 'bg-white border-black/5 text-ink/40'}`}
                                        >
                                            <span className="text-xs font-bold">{opt.label}</span>
                                            <div className={`w-8 h-4 rounded-full relative ${opt.active ? 'bg-accent' : 'bg-gray-200'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${opt.active ? 'left-[18px]' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EXPORT TAB */}
                        {activePanel === 'export' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                     <SectionLabel icon={<Settings2 size={14}/>} title="Format" />
                                     <div className="flex bg-black/5 p-1 rounded-xl">
                                         {['image/png', 'image/jpeg'].map(f => (
                                             <button 
                                                key={f}
                                                onClick={() => setExportFormat(f as 'image/png' | 'image/jpeg')}
                                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${exportFormat === f ? 'bg-white shadow-sm text-ink' : 'text-ink/40 hover:text-ink'}`}
                                             >
                                                {f.split('/')[1]}
                                             </button>
                                         ))}
                                     </div>
                                </div>

                                <div className="space-y-4">
                                     <SectionLabel icon={<Minimize2 size={14}/>} title="Quality" />
                                     <div className="grid grid-cols-3 gap-2">
                                         {[0.7, 0.9, 1.0].map(q => (
                                             <button 
                                                key={q}
                                                onClick={() => setExportQuality(q)}
                                                className={`py-2 border rounded-lg text-xs font-bold transition-all ${exportQuality === q ? 'bg-accent text-white border-accent' : 'bg-white border-black/5 hover:border-black/20'}`}
                                             >
                                                {q === 1 ? 'Ultra' : q === 0.9 ? 'High' : 'Med'}
                                             </button>
                                         ))}
                                     </div>
                                </div>

                                <div className="pt-6 space-y-3">
                                    <button onClick={handleExportPNG} disabled={isExporting} className="w-full py-4 bg-ink text-white rounded-xl shadow-xl shadow-ink/20 hover:-translate-y-1 transition-all font-bold flex items-center justify-center gap-2">
                                        <FileImage size={18}/> Download Image
                                    </button>
                                    <button onClick={handleExportZIP} disabled={isExporting} className="w-full py-4 bg-white border border-black/5 text-ink rounded-xl hover:bg-gray-50 transition-all font-bold flex items-center justify-center gap-2">
                                        <Layers size={18}/> Export ZIP (All)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

             {/* HELP MODAL */}
             <AnimatePresence>
                {isHelpOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-2xl font-display font-bold">Help & Guide</h2>
                                 <button onClick={() => setIsHelpOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><Trash2 className="rotate-45" size={20}/></button>
                             </div>
                             {/* ... content ... */}
                             <button onClick={() => setIsHelpOpen(false)} className="w-full btn-premium py-3 rounded-xl mt-6">Got it</button>
                        </motion.div>
                    </div>
                )}
             </AnimatePresence>

             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.docx,.pdf" />
             <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    );
}
