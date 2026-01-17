import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, 
    Clock, 
    ZoomIn, 
    ZoomOut, 
    Loader2,
    Upload,
    FileText,
    Download,
    Share2,
    FileDown,
    Bold,
    Italic,
    Underline,
    List,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Check,
    RotateCcw,
    Sparkles,
    Heading1,
    Heading2,
    Heading3,
    ListOrdered,
    Image,
    Plus,
    Minus,
    MoveDiagonal,
    Layers,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    HelpCircle,
    LayoutTemplate,
    Zap,
    Info,
    Monitor
} from 'lucide-react';
import { useStore } from '../lib/store';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import { useToast } from '../components/ui/Toast';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

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
    { id: 'white', name: 'White Paper', bg: '#ffffff', pattern: 'none' },
    { id: 'ruled', name: 'Ruled Lines', bg: '#ffffff', pattern: 'repeating-linear-gradient(transparent, transparent 27px, #e0e0e0 27px, #e0e0e0 28px)' },
    { id: 'graph', name: 'Graph Paper', bg: '#ffffff', pattern: 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)' },
    { id: 'dotted', name: 'Dotted Paper', bg: '#ffffff', pattern: 'radial-gradient(circle, #c0c0c0 1px, transparent 1px)' },
    { id: 'vintage', name: 'Vintage Paper', bg: '#f5f0e1', pattern: 'none' },
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
        resetTypography,
        inkColor,
        setInkColor,
        paperMaterial,
        setPaperMaterial,
        customPaperImage,
        setCustomPaperImage,
        applyPreset,
        expandedPanels,
        togglePanel,
        reset
    } = useStore();
    
    const [isLoading, setIsLoading] = useState(true);
    const [secondsAgo, setSecondsAgo] = useState(0);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isPresetsOpen, setIsPresetsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [fontSearch, setFontSearch] = useState('');
    const richTextRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const paperImageRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Rendering State
    const [debouncedText, setDebouncedText] = useState(text);
    const [isRendering, setIsRendering] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const { addToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const presets = {
        homework: {
            handwritingStyle: 'gloria',
            inkColor: '#1e40af',
            paperMaterial: 'ruled' as const,
            fontSize: 18,
            lineHeight: 1.6,
            paperShadow: true,
            paperTilt: false,
        },
        love: {
            handwritingStyle: 'indie',
            inkColor: '#be123c',
            paperMaterial: 'white' as const,
            fontSize: 20,
            lineHeight: 1.4,
            paperShadow: true,
            paperTilt: true,
        },
        professional: {
            handwritingStyle: 'patrick',
            inkColor: '#111827',
            paperMaterial: 'white' as const,
            fontSize: 16,
            lineHeight: 1.5,
            paperShadow: false,
            paperTilt: false,
        },
        journal: {
            handwritingStyle: 'caveat',
            inkColor: '#1e3a8a',
            paperMaterial: 'vintage' as const,
            fontSize: 17,
            lineHeight: 1.8,
            paperShadow: true,
            paperTilt: false,
        }
    } as const;


    // Components
    const Tooltip = ({ text }: { text: string }) => (
        <div className="group relative inline-block ml-1">
            <Info size={12} className="text-gray-300 hover:text-blue-500 cursor-help transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
            </div>
        </div>
    );

    const HelpModal = () => (
        <AnimatePresence>
            {isHelpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsHelpModalOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
                    >
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                            <Zap className="text-blue-500" fill="currentColor" /> Quick Guide
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Shortcuts</h3>
                                    <ul className="space-y-2 text-xs font-bold">
                                        <li className="flex justify-between"><span>Generate</span> <span className="text-gray-400">Ctrl+G</span></li>
                                        <li className="flex justify-between"><span>PNG Export</span> <span className="text-gray-400">Ctrl+D</span></li>
                                        <li className="flex justify-between"><span>Clear Editor</span> <span className="text-gray-400">Ctrl+K</span></li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Modes</h3>
                                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                                        Switch to <span className="text-black">Rich Mode</span> for Bold, Italic, Headings, and Image insertion.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pro Tips</h3>
                                <div className="flex gap-4 items-start p-3 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <Monitor size={20} className="text-gray-400 shrink-0" />
                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                        Use <span className="text-black">Presets</span> to instantly apply curated styles for assignments, letters, or journaling.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsHelpModalOpen(false)}
                            className="w-full mt-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                        >
                            Got it, thanks!
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
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

    // 300ms Debounce for text rendering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedText(text);
            setIsRendering(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [text]);

    // 10-second Auto-save Interval
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            setLastSaved(new Date());
        }, 10000);
        return () => clearInterval(autoSaveInterval);
    }, [setLastSaved]);

    // Handle Plain Text Changes
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIsRendering(true);
        setText(e.target.value);
    };

    // Handle Rich Text Changes
    const handleRichTextChange = () => {
        if (richTextRef.current) {
            setIsRendering(true);
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
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'text/plain') {
                alert('Please upload a .txt file');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setText(content);
                setUploadedFileName(file.name);
                setLastSaved(new Date());
            };
            reader.readAsText(file);
        }
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

    const clearContent = () => {
        if (window.confirm('Are you sure you want to clear all text and saved data?')) {
            setText('');
            setUploadedFileName(null);
            setLastSaved(null);
            if (richTextRef.current) richTextRef.current.innerHTML = '';
            localStorage.removeItem('inkpad-core-storage');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            addToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            addToast('Failed to copy link', 'error');
        });
    };

    const handleDownload = async (format: 'png' | 'pdf' | 'zip' | 'pdf-all') => {
        if (!canvasRef.current) {
            addToast('Canvas Not Ready', 'error');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);

        try {
            const timestamp = new Date().getTime();
            const fileNameBase = `InkPad-handwriting-${timestamp}`;

            if (format === 'png') {
                const dataUrl = canvasRef.current.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `${fileNameBase}.png`;
                link.href = dataUrl;
                link.click();
                addToast('PNG Downloaded Successfully!', 'success');
            } else if (format === 'pdf') {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvasRef.current.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                pdf.save(`${fileNameBase}.pdf`);
                addToast('PDF Downloaded Successfully!', 'success');
            } else if (format === 'pdf-all' || format === 'zip') {
                const total = totalPages;
                const zip = format === 'zip' ? new JSZip() : null;
                const pdf = format === 'pdf-all' ? new jsPDF('p', 'mm', 'a4') : null;

                for (let i = 1; i <= total; i++) {
                    setExportProgress(Math.round((i / total) * 100));
                    setCurrentPage(i);
                    // Wait for render to complete (300ms debounce + render time)
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    
                    const imgData = canvasRef.current.toDataURL('image/png');
                    
                    if (zip) {
                        const base64Data = imgData.split(',')[1];
                        zip.file(`Page-${i}.png`, base64Data, { base64: true });
                    }
                    
                    if (pdf) {
                        if (i > 1) pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                    }
                }

                if (zip) {
                    const content = await zip.generateAsync({ type: 'blob' });
                    const link = document.createElement('a');
                    link.download = `${fileNameBase}.zip`;
                    link.href = URL.createObjectURL(content);
                    link.click();
                }

                if (pdf) {
                    pdf.save(`${fileNameBase}.pdf`);
                }
                
                addToast(`${format.toUpperCase()} Downloaded Successfully!`, 'success');
                // Return to first page
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Export error:', error);
            addToast('Export failed. Please try again.', 'error');
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const wordCount = useMemo(() => {
        const plainText = text.replace(/<[^>]*>/g, ' ');
        return plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    }, [text]);

    const charCount = text.replace(/<[^>]*>/g, '').length;

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'g') {
                    e.preventDefault();
                    handleDownload(totalPages > 1 ? 'pdf-all' : 'pdf');
                }
                if (e.key === 'd') {
                    e.preventDefault();
                    handleDownload('png');
                }
                if (e.key === 'k') {
                    e.preventDefault();
                    clearContent();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [totalPages, clearContent, handleDownload]);

    const zoomLevels = [
        { label: 'Fit', value: 0.65 }, // Roughly fit for most displays
        { label: '75%', value: 0.75 },
        { label: '100%', value: 1 },
        { label: '125%', value: 1.25 },
        { label: '150%', value: 1.5 },
    ];

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white font-sans text-gray-900">
            {/* LEFT PANEL (40%) */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ x: -450, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -450, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full md:w-[40%] h-full flex flex-col border-r border-gray-100 relative z-10 bg-white"
                    >
                <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
                    {/* Header with Mode Toggle and Upload */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Editor Workspace</h2>
                            {uploadedFileName && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                                    <FileText size={10} /> {uploadedFileName}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".txt" 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-black hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                <Upload size={14} /> Upload File
                            </button>
                            
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button 
                                    onClick={() => setEditorMode('plain')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${editorMode === 'plain' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-black'}`}
                                >
                                    Plain
                                </button>
                                <button 
                                    onClick={() => setEditorMode('rich')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${editorMode === 'rich' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-black'}`}
                                >
                                    Rich
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="relative flex-1 flex flex-col group min-h-[250px]">
                        {editorMode === 'rich' && (
                            <div className="flex flex-wrap items-center gap-1 mb-2 p-1 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide">
                                {/* Text Style Group */}
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => execCommand('bold')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Bold (Ctrl+B)"><Bold size={16} /></button>
                                    <button onClick={() => execCommand('italic')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Italic (Ctrl+I)"><Italic size={16} /></button>
                                    <button onClick={() => execCommand('underline')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Underline (Ctrl+U)"><Underline size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1" />
                                
                                {/* Headings Group */}
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Heading 1"><Heading1 size={16} /></button>
                                    <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Heading 2"><Heading2 size={16} /></button>
                                    <button onClick={() => execCommand('formatBlock', 'h3')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Heading 3"><Heading3 size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1" />
                                
                                {/* Lists Group */}
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Bullet List"><List size={16} /></button>
                                    <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Numbered List"><ListOrdered size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1" />

                                {/* Font Size Group */}
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => execCommand('fontSize', '4')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Increase Size"><Plus size={16} /></button>
                                    <button onClick={() => execCommand('fontSize', '2')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Decrease Size"><Minus size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1" />
                                
                                {/* Alignment Group */}
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Align Left"><AlignLeft size={16} /></button>
                                    <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Align Center"><AlignCenter size={16} /></button>
                                    <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Align Right"><AlignRight size={16} /></button>
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1" />
                                
                                {/* Media Group */}
                                <div className="flex items-center gap-0.5">
                                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                    <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Insert Image"><Image size={16} /></button>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 relative">
                            {editorMode === 'plain' ? (
                                <textarea
                                    value={text}
                                    onChange={handleTextChange}
                                    placeholder="Type or paste your text here..."
                                    className="w-full h-full p-6 text-lg leading-relaxed bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-black/5 focus:bg-white transition-all duration-300 outline-none resize-none font-medium placeholder:text-gray-300"
                                />
                            ) : (
                                <div
                                    ref={richTextRef}
                                    contentEditable
                                    onInput={handleRichTextChange}
                                    onKeyDown={(e) => {
                                        if (e.ctrlKey || e.metaKey) {
                                            if (e.key === 'b') { e.preventDefault(); execCommand('bold'); }
                                            if (e.key === 'i') { e.preventDefault(); execCommand('italic'); }
                                            if (e.key === 'u') { e.preventDefault(); execCommand('underline'); }
                                        }
                                    }}
                                    className="w-full h-full p-6 text-lg leading-relaxed bg-gray-50/50 rounded-2xl border-2 border-transparent focus:border-black/5 focus:bg-white transition-all duration-300 outline-none overflow-y-auto font-medium"
                                    style={{ minHeight: '100%' }}
                                />
                            )}
                            
                            {!text && editorMode === 'rich' && (
                                <div className="absolute top-6 left-6 pointer-events-none text-gray-300 italic text-lg font-medium">
                                    Type or paste your text here...
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4 flex items-center gap-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <button 
                                    onClick={clearContent}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 border-2 border-red-500/20 hover:border-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Trash2 size={14} /> Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <span className="text-black">{wordCount}</span> words <span className="mx-2 text-gray-200">|</span> <span className="text-black">{charCount}</span> characters
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock size={12} className="text-gray-300" />
                            {lastSaved ? (
                                <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-500">
                                    Last saved: {secondsAgo}s ago
                                </span>
                            ) : (
                                <span className="animate-pulse">Waiting...</span>
                            )}
                        </div>
                    </div>
                    
                    {/* ========== QUICK PRESETS & HELP ========== */}
                    <div className="mt-8 flex items-center gap-2 px-6">
                        <div className="relative flex-1">
                            <button
                                onClick={() => setIsPresetsOpen(!isPresetsOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <LayoutTemplate size={16} />
                                    Quick Presets
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isPresetsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isPresetsOpen && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsPresetsOpen(false)}
                                            className="fixed inset-0 z-40"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-2 p-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                        >
                                            {Object.entries(presets).map(([key, value]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        applyPreset(value);
                                                        setIsPresetsOpen(false);
                                                        addToast(`${key.charAt(0).toUpperCase() + key.slice(1)} preset applied!`, 'success');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl text-left transition-colors group"
                                                >
                                                    <div className="p-2 bg-gray-50 group-hover:bg-white rounded-lg transition-colors">
                                                        <Zap size={14} className="text-blue-500" fill="currentColor" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                                                </button>
                                            ))}
                                            <div className="p-3 border-t border-gray-50">
                                                <button 
                                                    onClick={() => { reset(); setIsPresetsOpen(false); }}
                                                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                                >
                                                    Reset All
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button
                            onClick={() => setIsHelpModalOpen(true)}
                            className="p-3 bg-gray-50 hover:bg-white text-gray-400 hover:text-blue-500 rounded-2xl border border-transparent hover:border-gray-100 transition-all hover:scale-105"
                            title="Help Guide"
                        >
                            <HelpCircle size={20} />
                        </button>
                    </div>

                    {/* ========== HANDWRITING STYLE PANEL ========== */}
                    <div className="mt-6 border-t border-gray-100 pt-6 px-6">
                        <button
                            onClick={() => togglePanel('handwriting')}
                            className="w-full flex items-center justify-between group"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                Handwriting Style <Tooltip text="Select the handwriting font that best fits your document." />
                            </h3>
                            <motion.div
                                animate={{ rotate: expandedPanels.includes('handwriting') ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedPanels.includes('handwriting') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-4">
                                        {/* Search Box */}
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text"
                                                value={fontSearch}
                                                onChange={(e) => setFontSearch(e.target.value)}
                                                placeholder="Search fonts..."
                                                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 rounded-xl border border-transparent focus:border-gray-200 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                            />
                                        </div>

                                        {/* Font Grid */}
                                        <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
                                            {filteredFonts.map((font) => (
                                                <motion.button
                                                    key={font.id}
                                                    onClick={() => setHandwritingStyle(font.id)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`relative p-4 rounded-xl text-left transition-all duration-200 ${
                                                        handwritingStyle === font.id
                                                            ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                                                    }`}
                                                >
                                                    {handwritingStyle === font.id && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <Check size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                                        {font.name}
                                                    </p>
                                                    <p 
                                                        className="text-lg text-gray-700 leading-tight truncate"
                                                        style={{ fontFamily: font.family }}
                                                    >
                                                        The quick brown fox
                                                    </p>
                                                </motion.button>
                                            ))}
                                        </div>

                                        {filteredFonts.length === 0 && (
                                            <p className="text-center text-sm text-gray-400 py-4">No fonts found</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ========== TYPOGRAPHY SETTINGS PANEL ========== */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <button
                            onClick={() => togglePanel('typography')}
                            className="w-full flex items-center justify-between group"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                Typography Settings <Tooltip text="Adjust text size and spacing to match natural handwriting flow." />
                            </h3>
                            <motion.div
                                animate={{ rotate: expandedPanels.includes('typography') ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedPanels.includes('typography') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-6">
                                        {/* Font Size */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Font Size</label>
                                                <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{fontSize}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="30"
                                                value={fontSize}
                                                onChange={(e) => setFontSize(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        {/* Letter Spacing */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Letter Spacing</label>
                                                <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{letterSpacing}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-2"
                                                max="10"
                                                value={letterSpacing}
                                                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        {/* Line Height */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Line Height</label>
                                                <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{lineHeight.toFixed(1)}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1.0"
                                                max="3.0"
                                                step="0.1"
                                                value={lineHeight}
                                                onChange={(e) => setLineHeight(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        {/* Word Spacing */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Word Spacing</label>
                                                <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{wordSpacing}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                value={wordSpacing}
                                                onChange={(e) => setWordSpacing(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        {/* Reset Button */}
                                        <button
                                            onClick={resetTypography}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <RotateCcw size={12} /> Reset Typography
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ========== PAPER & INK PANEL ========== */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <button
                            onClick={() => togglePanel('paper')}
                            className="w-full flex items-center justify-between group"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                Paper & Ink <Tooltip text="Customize the paper appearance and ink color." />
                            </h3>
                            <motion.div
                                animate={{ rotate: expandedPanels.includes('paper') ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedPanels.includes('paper') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-6">
                                        {/* Ink Color Section */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ink Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {INK_COLORS.map((ink) => (
                                                    <button
                                                        key={ink.id}
                                                        onClick={() => setInkColor(ink.color)}
                                                        title={ink.name}
                                                        className={`relative w-8 h-8 rounded-full transition-all duration-200 ${inkColor === ink.color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                                                        style={{ backgroundColor: ink.color }}
                                                    >
                                                        {inkColor === ink.color && (
                                                            <Check size={14} className="absolute inset-0 m-auto text-white" />
                                                        )}
                                                    </button>
                                                ))}
                                                {/* Custom Color Picker */}
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={inkColor}
                                                        onChange={(e) => setInkColor(e.target.value)}
                                                        className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                                                    />
                                                    <div
                                                        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                                                        style={{ background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` }}
                                                    >
                                                        <span className="text-[8px] font-bold text-white bg-black/50 px-1 rounded">+</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Paper Type Section */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Paper Type</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {PAPER_TYPES.map((paper) => (
                                                    <button
                                                        key={paper.id}
                                                        onClick={() => {
                                                            setPaperMaterial(paper.id as 'white' | 'ruled' | 'graph' | 'dotted' | 'vintage' | 'custom');
                                                            if (paper.id !== 'custom') setCustomPaperImage(null);
                                                            if (paper.id === 'custom') paperImageRef.current?.click();
                                                        }}
                                                        title={paper.name}
                                                        className={`relative aspect-3/4 rounded-lg overflow-hidden transition-all duration-200 group ${
                                                            paperMaterial === paper.id
                                                                ? 'ring-2 ring-blue-500 shadow-md'
                                                                : 'border border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                backgroundColor: paper.bg,
                                                                backgroundImage: paper.pattern !== 'none' ? paper.pattern : undefined,
                                                                backgroundSize: paper.id === 'graph' ? '20px 20px' : paper.id === 'dotted' ? '15px 15px' : undefined,
                                                            }}
                                                        />
                                                        {paper.id === 'custom' && customPaperImage && (
                                                            <div
                                                                className="absolute inset-0 bg-cover bg-center"
                                                                style={{ backgroundImage: `url(${customPaperImage})` }}
                                                            />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[8px] font-bold text-white uppercase truncate block">{paper.name}</span>
                                                        </div>
                                                        {paperMaterial === paper.id && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <Check size={10} className="text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Hidden file input for custom paper */}
                                            <input
                                                type="file"
                                                ref={paperImageRef}
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setCustomPaperImage(event.target?.result as string);
                                                            setPaperMaterial('custom');
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ========== VISUAL EFFECTS PANEL ========== */}
                    <div className="mt-6 border-t border-gray-100 pt-6 px-6">
                        <button
                            onClick={() => togglePanel('effects')}
                            className="w-full flex items-center justify-between group"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                Visual Effects <Tooltip text="Add organic depth with shadows, tilt, and realistic ink artifacts." />
                            </h3>
                            <motion.div
                                animate={{ rotate: expandedPanels.includes('effects') ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedPanels.includes('effects') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-6 pb-4">
                                        {/* Paper Shadow & Tilt toggles */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => useStore.getState().setPaperShadow(!useStore.getState().paperShadow)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${useStore.getState().paperShadow ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                                            >
                                                <Layers size={16} className={useStore.getState().paperShadow ? 'text-blue-500' : 'text-gray-400'} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Shadow</span>
                                            </button>
                                            <button
                                                onClick={() => useStore.getState().setPaperTilt(!useStore.getState().paperTilt)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${useStore.getState().paperTilt ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                                            >
                                                <MoveDiagonal size={16} className={useStore.getState().paperTilt ? 'text-blue-500' : 'text-gray-400'} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Tilt</span>
                                            </button>
                                            <button
                                                onClick={() => useStore.getState().setPaperTexture(!useStore.getState().paperTexture)}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${useStore.getState().paperTexture ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                                            >
                                                <Sparkles size={16} className={useStore.getState().paperTexture ? 'text-blue-500' : 'text-gray-400'} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Texture</span>
                                            </button>
                                        </div>

                                        {/* Ink Blur */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ink Blur (Bleed)</label>
                                                <span className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-md">{useStore.getState().inkBlur}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="5"
                                                step="0.5"
                                                value={useStore.getState().inkBlur}
                                                onChange={(e) => useStore.getState().setInkBlur(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </div>

                                        {/* Resolution Quality */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Resolution Quality</label>
                                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                                {[1, 2, 3].map((q) => (
                                                    <button
                                                        key={q}
                                                        onClick={() => useStore.getState().setResolutionQuality(q)}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${useStore.getState().resolutionQuality === q ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}
                                                    >
                                                        {q === 1 ? 'Normal' : q === 2 ? 'High (2x)' : 'Ultra (3x)'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ========== GENERATE & DOWNLOAD SECTION ========== */}
                    <div className="mt-auto pt-8 space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Export Manuscript</span>
                            </div>
                            
                            <button
                                onClick={() => handleDownload(totalPages > 1 ? 'pdf-all' : 'pdf')}
                                disabled={isExporting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Capturing {exportProgress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <FileDown size={18} className="group-hover:scale-110 transition-transform" />
                                        <span>Convert to Handwriting</span>
                                    </>
                                )}
                            </button>

                            {!isExporting && (
                                <p className="text-[10px] text-center text-gray-400 font-medium">
                                    Estimated time: {Math.max(2, Math.round(totalPages * 1.5))} seconds
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleDownload('png')}
                                    disabled={isExporting}
                                    className="py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:border-gray-300 hover:text-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={12} /> PNG
                                </button>
                                <button
                                    onClick={() => handleDownload('zip')}
                                    disabled={isExporting || totalPages <= 1}
                                    className="py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-tight hover:border-gray-300 hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:border-gray-200"
                                >
                                    <Download size={12} /> Multiple (ZIP)
                                </button>
                            </div>

                            <button
                                onClick={handleShare}
                                className="w-full py-2.5 text-gray-400 hover:text-blue-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={12} /> Share Project
                            </button>
                        </div>
                    </div>
                </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* RIGHT PANEL (60%) */}
            <div className="flex-1 h-full bg-[#f5f5f5] relative flex flex-col overflow-hidden">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-8 left-8 z-20 p-3 bg-white/80 backdrop-blur-md hover:bg-black hover:text-white rounded-xl shadow-lg transition-all group border border-white/50"
                    title={isSidebarOpen ? "Collapse Sidebar" : "Expand User Settings"}
                >
                    <div className="flex items-center gap-2">
                        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        {!isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest mr-1">Settings</span>}
                    </div>
                </button>
                {/* TOOLBAR */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50">
                    {zoomLevels.map((lvl) => (
                        <button
                            key={lvl.label}
                            onClick={() => setZoom(lvl.value)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                                Math.abs(zoom - lvl.value) < 0.01 
                                ? 'bg-black text-white px-6' 
                                : 'hover:bg-gray-100 text-gray-400'
                            }`}
                        >
                            {lvl.label}
                        </button>
                    ))}
                </div>

                {/* CANVAS AREA */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-12 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {isLoading || isRendering ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <Loader2 className="w-10 h-10 text-black/10 animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                    {isRendering ? 'Refining Handwriting...' : 'Rendering Workspace'}
                                </span>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center gap-8">
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

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={`p-2 rounded-full transition-all ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            Page <span className="text-black">{currentPage}</span> of <span className="text-black">{totalPages}</span>
                                        </span>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={`p-2 rounded-full transition-all ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ZOOM HUD */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                    <button 
                        onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                        className="p-3 bg-white hover:bg-black hover:text-white rounded-xl shadow-md transition-all group"
                    >
                        <ZoomIn size={18} className="text-gray-400 group-hover:text-white" />
                    </button>
                    <button 
                        onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                        className="p-3 bg-white hover:bg-black hover:text-white rounded-xl shadow-md transition-all group"
                    >
                        <ZoomOut size={18} className="text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            {/* HELP MODAL */}
            <HelpModal />

            {/* PROCESSING OVERLAY */}
            <AnimatePresence>
                {isExporting && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
                    >
                        <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full">
                            <div className="relative">
                                <Loader2 className="animate-spin text-blue-500" size={48} />
                                <div className="absolute inset-0 m-auto w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Generating Manuscript</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                    Crafting your pages with care... {exportProgress}%
                                </p>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${exportProgress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
}
