import { useState, useMemo, useDeferredValue, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings2, FileText, RefreshCw, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, 
    Sparkles, Download, Wand2, Clock
} from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { useStore } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { saveExportedFile } from '../lib/fileStorage';
import HistoryModal from '../components/HistoryModal';
import ExportModal from '../components/ExportModal';

// --- PIPELINE TYPES ---
interface LineData {
    text: string;
    type: 'text' | 'bullet' | 'number' | 'empty';
    indent: number;
    dir?: 'ltr' | 'rtl';
    charIndex: number; // For reverse lookup
}

interface PageData {
    lines: LineData[];
    index: number;
}


// --- PIPELINE STAGE 1 & 2: TOKENIZE & BUILD LINES ---
function buildDocumentLines(text: string, charsPerLine: number): LineData[] {
    const lines: LineData[] = [];
    const paragraphs = text.split('\n');
    let currentTotalIndex = 0;

    paragraphs.forEach((para) => {
        if (para.trim().length === 0) {
            lines.push({ text: "", type: 'empty', indent: 0, charIndex: currentTotalIndex });
            currentTotalIndex += para.length + 1; // +1 for the \n
            return;
        }

        // Direction Detection
        const dir: 'ltr' | 'rtl' = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/.test(para) ? 'rtl' : 'ltr';

        // List Detection
        const bulletMatch = para.match(/^([*\-+])\s+/);
        const numberMatch = para.match(/^(\d+[.)])\s+/);
        let listIndent = 0;
        let type: LineData['type'] = 'text';

        if (bulletMatch) {
            listIndent = 2;
            type = 'bullet';
        } else if (numberMatch) {
            listIndent = numberMatch[0].length;
            type = 'number';
        }

        // Greedy Wrap + Long Word Splitting
        const words = para.split(' ');
        let currentLine = "";
        let isFirstInPara = true;
        let pCharOffset = 0;

        const pushLine = (txt: string, isFirst: boolean, indent: number) => {
            lines.push({ 
                text: txt, 
                type: isFirst ? type : 'text', 
                indent: isFirst ? 0 : indent,
                dir,
                charIndex: currentTotalIndex + pCharOffset
            });
        };

        words.forEach((word) => {
            const limit = isFirstInPara ? charsPerLine : (charsPerLine - listIndent);
            
            if (word.length > limit) {
                if (currentLine.length > 0) {
                    pushLine(currentLine, isFirstInPara, listIndent);
                    pCharOffset += currentLine.length + 1;
                    currentLine = "";
                    isFirstInPara = false;
                }
                
                let wordPart = word;
                while (wordPart.length > limit) {
                    pushLine(wordPart.substring(0, limit), isFirstInPara, listIndent);
                    pCharOffset += limit;
                    wordPart = wordPart.substring(limit);
                    isFirstInPara = false;
                }
                currentLine = wordPart;
            } else if ((currentLine.length + word.length + 1) <= limit) {
                currentLine += (currentLine.length > 0 ? " " : "") + word;
            } else {
                pushLine(currentLine, isFirstInPara, listIndent);
                pCharOffset += currentLine.length + 1;
                currentLine = word;
                isFirstInPara = false;
            }
        });

        if (currentLine.length > 0) {
            pushLine(currentLine, isFirstInPara, listIndent);
        }

        currentTotalIndex += para.length + 1; 
    });

    return lines;
}

// --- PIPELINE STAGE 3: PAGINATION ENGINE (WIDOW/ORPHAN) ---
function paginateLines(lines: LineData[], linesPerPage: number, firstPageLines?: number): PageData[] {
    const pages: PageData[] = [];
    let currentLines: LineData[] = [];
    const actualFirstPageLimit = firstPageLines ?? linesPerPage;

    lines.forEach((line, idx) => {
        const pageLimit = pages.length === 0 ? actualFirstPageLimit : linesPerPage;
        const isFirstOfPara = line.type !== 'text' || (idx > 0 && lines[idx-1].type === 'empty');
        const nextLine = lines[idx + 1];
        const isLastOfPara = !nextLine || nextLine.type === 'empty' || nextLine.type !== 'text';

        // ORPHAN PROTECTION
        if (isFirstOfPara && currentLines.length === pageLimit - 1 && !isLastOfPara) {
            pages.push({ lines: currentLines, index: pages.length });
            currentLines = [];
        }

        currentLines.push(line);

        // WIDOW PROTECTION
        if (currentLines.length === pageLimit) {
            const nextIdx = idx + 1;
            const nextIsWidow = lines[nextIdx] && (lines[nextIdx].type === 'text' && (!lines[nextIdx+1] || lines[nextIdx+1].type === 'empty'));
            
            if (nextIsWidow) {
                const tempLine = currentLines.pop()!;
                pages.push({ lines: currentLines, index: pages.length });
                currentLines = [tempLine];
            } else {
                pages.push({ lines: currentLines, index: pages.length });
                currentLines = [];
            }
        }
    });

    if (currentLines.length > 0) {
        pages.push({ lines: currentLines, index: pages.length });
    }

    return pages.length > 0 ? pages : [{ lines: [{ text: "", type: 'empty', indent: 0, charIndex: 0 }], index: 0 }];
}

// --- PIPELINE STAGE 4: SIMULATION SEEDING ---
function getDeterminRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
}

// --- DATA CONSTANTS ---
const FONTS = [
    { name: 'Caveat', label: 'Real Handwriting' },
    { name: 'Homemade Apple', label: 'Messy Apple' },
    { name: 'Indie Flower', label: 'Indie Flower' },
    { name: 'Gloria Hallelujah', label: 'Gloria' },
    { name: 'Reenie Beanie', label: 'Beanie' },
    { name: 'Shadows Into Light', label: 'Shadows' },
    { name: 'Patrick Hand', label: 'Patrick' },
    { name: 'Kalam', label: 'Kalam' },
];

const COLORS = [
    { name: 'Blue Ink', value: '#1e3a8a' },
    { name: 'Black Ink', value: '#171717' },
    { name: 'Red Ink', value: '#991b1b' },
    { name: 'Pencil', value: '#4b5563' },
];

const PAPERS = [
    { id: 'plain', name: 'Plain White', css: 'bg-white', lineHeight: 32 },
    { id: 'lined', name: 'Lined Paper', css: 'bg-white', lineHeight: 32, style: { backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 32px' } },
];

export default function EditorPage() {
    const { addToast } = useToast();
    const sourceRef = useRef<HTMLTextAreaElement>(null);
    const { user, setAuthModalOpen } = useAuth();
    
    // Global Store State
    const { 
        text, setText, 
        handwritingStyle: font, setHandwritingStyle: setFont,
        fontSize, setFontSize,
        inkColor: color, setInkColor: setColor,
        paperMaterial, setPaperMaterial,
        marginTop, marginBottom, marginLeft, marginRight,
        showPageNumbers, showHeader, headerText, setPageOptions,
        jitter, setJitter,
        pressure, setPressure,
        smudge, setSmudge,
        baseline, setBaseline,
        history: storeHistory, addToHistory
    } = useStore();

    // Text Align state (used for layout calculations)
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

    // Local UI State
    const [progress, setProgress] = useState(0);
    const [randomSeed, setRandomSeed] = useState(0);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'zip'>('pdf');
    const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'export', format: 'pdf' | 'zip' } | null>(null);
    const [isDockExpanded, setIsDockExpanded] = useState(false);
    const [activeDockTab, setActiveDockTab] = useState<'content' | 'style' | 'effects' | 'export'>('content');
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Initial Login Pop-up (Handled by AuthContext, but we ensure persistence of intent)
    useEffect(() => {
        if (user && pendingAction) {
            if (pendingAction.type === 'export') {
                setExportFormat(pendingAction.format);
                setExportStatus('idle');
                setIsExportModalOpen(true);
                setProgress(0);
            }
            setPendingAction(null);
        }
    }, [user, pendingAction]);

    const deferredText = useDeferredValue(text);

    // Sync Paper (Store uses 'white'|'ruled', but Editor uses object)
    const paper = useMemo(() => {
        const p = PAPERS.find(p => p.id === (paperMaterial === 'white' ? 'plain' : 'lined')) || PAPERS[1];
        return p;
    }, [paperMaterial]);

    const setPaper = (p: { id: string }) => setPaperMaterial(p.id === 'plain' ? 'white' : 'ruled');

    // History Snapshots (Zustand addToHistory)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user && text && text.length > 10) {
                const latest = storeHistory[0];
                if (!latest || latest.text !== text) {
                    addToHistory({
                        id: Date.now().toString(),
                        timestamp: Date.now(),
                        text
                    });
                }
            }
        }, 10000); 
        return () => clearTimeout(timer);
    }, [text, user, storeHistory, addToHistory]);

    const normalizeInput = (val: string) => {
        return val
            .replace(/-- /g, '— ') 
            .replace(/\.\.\./g, '…'); 
    };

    // Extras & Realism
    const [marginNote, setMarginNote] = useState("");
    const [showCoffeeStain, setShowCoffeeStain] = useState(false);
    const [showStickyNote, setShowStickyNote] = useState(false);
    const [stickyNoteText, setStickyNoteText] = useState("Don't forget!");

    // --- PIPELINE EXECUTION ---
    const pages = useMemo(() => {
        const bodyHeight = 1123 - marginTop - marginBottom;
        const linesPerPage = Math.floor(bodyHeight / paper.lineHeight);
        const charsPerLine = Math.floor((800 - marginLeft - marginRight) / (fontSize * 0.38));
        
        // Calculate header lines to reduce page 1 capacity
        const headerLineCount = showHeader ? headerText.split('\n').length : 0;
        const page1Lines = Math.max(1, linesPerPage - headerLineCount + 1); 

        const rawLines = buildDocumentLines(deferredText, charsPerLine);
        return paginateLines(rawLines, linesPerPage, page1Lines);
    }, [deferredText, fontSize, paper.lineHeight, marginTop, marginBottom, marginLeft, marginRight, showHeader, headerText]);

    const handleHumanize = async () => {
        const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
        
        if (!googleKey) {
            addToast('AI Configuration Missing. Please connect API Key.', 'error');
            return;
        }

        setIsHumanizing(true);
        
        // Debug: Check if key is even loaded
        console.log('Gemini API Key loaded:', googleKey ? 'Yes (starting with ' + googleKey.substring(0, 8) + '...)' : 'No');

        // Strategy: Intensive Model Fallback Waterfall
        const modelsToTry = [
            "gemini-1.5-flash", 
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-8b", 
            "gemini-1.5-pro", 
            "gemini-1.5-pro-latest",
            "gemini-pro"
        ];
        let lastError: Error | null = null;

        const attemptWithModel = async (modelName: string): Promise<string> => {
             const genAI = new GoogleGenerativeAI(googleKey);
             const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            });

            const systemInstruction = `Rewrite the input text to sound like natural human prose for a handwriting simulator. 
            Keep it casual, use contractions, and vary sentence length. 
            Output ONLY the rewritten text.`;

            const result = await model.generateContent(`${systemInstruction}\n\nInput Text:\n${text}`);
            const response = await result.response;
            return response.text();
        }

        try {
            let rewrittenText: string | null = null;
            
            for (const modelName of modelsToTry) {
                try {
                    console.log(`Trying model: ${modelName}`);
                    rewrittenText = await attemptWithModel(modelName);
                    if (rewrittenText) break;
                } catch (e: unknown) {
                    const err = e as Error;
                    console.warn(`Model ${modelName} fail:`, err.message);
                    lastError = err;
                    // If it's a key/auth error, stop immediately
                    if (err.message.includes('API_KEY_INVALID') || err.message.includes('403')) break;
                    // If it's a model not found (404), try the next one in the list
                }
            }

            if (rewrittenText) {
                setText(normalizeInput(rewrittenText.trim()));
                addToast('Text Humanized!', 'success');
            } else {
                throw lastError || new Error('All models unavailable');
            }

        } catch (e: unknown) {
            console.error('AI Error:', e);
            const err = e as { message?: string };
            const msg = err.message || '';
            
            if (msg.includes('429')) {
                addToast('Rate limit. Please wait 1 minute.', 'warning');
            } else if (msg.includes('403') || msg.includes('API key')) {
                addToast('Invalid API Key. Use Google AI Studio, not GCP.', 'error');
            } else if (msg.includes('404')) {
                addToast('Key is working, but models are restricted in your region.', 'error');
            } else {
                addToast('AI unavailable. Check connection or key settings.', 'error');
            }
        } finally {
            setIsHumanizing(false);
        }
    };

    const handleWordClick = (charIndex: number) => {
        if (sourceRef.current) {
            sourceRef.current.focus();
            sourceRef.current.setSelectionRange(charIndex, charIndex);
            sourceRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleStartExport = (format: 'pdf' | 'zip') => {
        if (!user) {
            setPendingAction({ type: 'export', format });
            setAuthModalOpen(true);
            return;
        }
        setExportFormat(format);
        setExportStatus('idle');
        setIsExportModalOpen(true);
        setProgress(0);
    };

    const executeExport = async (customName: string) => {
        setExportStatus('processing');
        setProgress(0);
        
        try {
            const elements = document.querySelectorAll('.handwritten-export-target');
            if (elements.length === 0) throw new Error('No pages found');

            const baseFileName = customName || `handwritten-${Date.now()}`;

            if (exportFormat === 'pdf') {
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4',
                    putOnlyUsedFonts: true
                });

                for (let i = 0; i < elements.length; i++) {
                    if (i > 0) pdf.addPage();
                    // FIX: oklch error by using hex background and scale
                    const canvas = await html2canvas(elements[i] as HTMLElement, { 
                        scale: 3, 
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff', // Ensure solid hex color
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 800,
                        windowHeight: 1131,
                        onclone: (clonedDoc) => {
                            // Secondary fix: Ensure any modern color bleeding is stripped
                            const clonedElement = clonedDoc.querySelector('.handwritten-export-target');
                            if (clonedElement) {
                                (clonedElement as HTMLElement).style.background = '#ffffff';
                            }
                        }
                    });
                    const imgData = canvas.toDataURL('image/png', 1.0);
                    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW');
                    setProgress(Math.round(((i + 1) / elements.length) * 100));
                }
                pdf.save(`${baseFileName}.pdf`);
                // Save to local history
                const pdfBlob = pdf.output('blob');
                await saveExportedFile(pdfBlob, `${baseFileName}.pdf`, 'pdf');
            } else {
                const zip = new JSZip();
                for (let i = 0; i < elements.length; i++) {
                    const canvas = await html2canvas(elements[i] as HTMLElement, { 
                        scale: 3, 
                        useCORS: true, 
                        logging: false,
                        backgroundColor: '#ffffff',
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 800,
                        windowHeight: 1131
                    });
                    const imgData = canvas.toDataURL('image/png', 1.0).split(',')[1];
                    zip.file(`page-${i + 1}.png`, imgData, { base64: true });
                    setProgress(Math.round(((i + 1) / elements.length) * 100));
                }
                const content = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${baseFileName}.zip`;
                link.click();
                // Save to local history
                await saveExportedFile(content, `${baseFileName}.zip`, 'zip');
            }

            setExportStatus('complete');
            addToast(`${exportFormat.toUpperCase()} Export Complete!`, 'success');
        } catch (e: unknown) { 
            const err = e as { message?: string };
            console.error('Export Error:', err);
            setExportStatus('error');
            addToast(`Export Failed: ${err.message || 'Unknown Error'}`, 'error'); 
        }
    };

    return (
        <div className="relative selection:bg-indigo-500/30 font-sans">
            {/* 
               MASTER DOCK - The Unified Control Center
               Sticks to the bottom-right with premium glassmorphism.
            */}
            <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-100 flex flex-col items-end gap-4">
                {/* 1. THE DOCK PANEL */}
                <motion.div 
                    initial={false}
                    animate={{ 
                        width: isDockExpanded ? (window.innerWidth < 1024 ? 'calc(100vw - 48px)' : '420px') : '0px',
                        height: isDockExpanded ? 'auto' : '0px',
                        opacity: isDockExpanded ? 1 : 0,
                        scale: isDockExpanded ? 1 : 0.9,
                        y: isDockExpanded ? 0 : 20
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`glass-premium rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/40 ${
                        isDockExpanded ? 'p-0' : 'p-0 pointer-events-none'
                    }`}
                >
                    {/* MODAL HEADER / TABS */}
                    <div className="flex px-4 pt-2 border-b border-black/5 bg-white/40">
                        {[
                            { id: 'content' as const, icon: FileText, label: 'Content' },
                            { id: 'style' as const, label: 'Style', icon: Settings2 },
                            { id: 'effects' as const, label: 'Effects', icon: Sparkles },
                            { id: 'export' as const, label: 'Save', icon: Download }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveDockTab(tab.id)}
                                className={`flex-1 py-4 flex flex-col items-center gap-1.5 transition-all relative ${
                                    activeDockTab === tab.id 
                                        ? 'text-indigo-600' 
                                        : 'text-neutral-400 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span className="text-[8px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                                {activeDockTab === tab.id && (
                                    <motion.div layoutId="dockTab" className="absolute bottom-0 left-4 right-4 h-1 bg-indigo-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* DOCK CONTENT AREA */}
                    <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-8">
                        {activeDockTab === 'content' && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your Masterpiece</label>
                                        <button 
                                            onClick={handleHumanize}
                                            disabled={isHumanizing || !text.trim()}
                                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
                                        >
                                            <Wand2 size={10} className={isHumanizing ? 'animate-spin' : ''} />
                                            {isHumanizing ? 'Thinking...' : 'AI Humanize'}
                                        </button>
                                    </div>
                                    <textarea 
                                        value={text} 
                                        onChange={(e) => setText(normalizeInput(e.target.value))}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                        className="w-full h-48 p-5 bg-white/50 border border-black/5 rounded-4xl text-sm leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 placeholder:text-neutral-300 shadow-inner"
                                        placeholder="Start typing your story..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 block">Document Heading</label>
                                    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-2xl border border-black/5">
                                        <input 
                                            type="checkbox" 
                                            checked={showHeader} 
                                            onChange={e => setPageOptions({ showHeader: e.target.checked })} 
                                            className="w-5 h-5 rounded-lg border-black/10 text-indigo-600 focus:ring-0"
                                        />
                                        <input 
                                            value={headerText} 
                                            onChange={e => setPageOptions({ headerText: e.target.value })}
                                            placeholder="Enter Heading..." 
                                            className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDockTab === 'style' && (
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 block">Handwriting Style</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {FONTS.map(f => (
                                            <button 
                                                key={f.name}
                                                onClick={() => setFont(f.name)}
                                                className={`p-4 rounded-2xl border transition-all text-[11px] font-bold ${
                                                    font === f.name 
                                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl' 
                                                        : 'bg-white/50 border-black/5 text-neutral-600 hover:bg-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Alignment</span>
                                            <div className="flex gap-1.5 p-1 bg-white/40 rounded-xl border border-black/5">
                                                {[
                                                    { id: 'left' as const, icon: AlignLeft },
                                                    { id: 'center' as const, icon: AlignCenter },
                                                    { id: 'right' as const, icon: AlignRight },
                                                    { id: 'justify' as const, icon: AlignJustify }
                                                ].map(opt => (
                                                    <button 
                                                        key={opt.id} 
                                                        onClick={() => setTextAlign(opt.id)}
                                                        className={`p-1.5 rounded-lg transition-all ${textAlign === opt.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-600'}`}
                                                    >
                                                        <opt.icon size={14} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Font Size</span>
                                            <span className="text-xs font-bold text-indigo-600">{fontSize}px</span>
                                        </div>
                                        <input type="range" min="14" max="64" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-black/5 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ink Color</span>
                                        <div className="flex gap-3 bg-white/40 p-2 rounded-full border border-black/5">
                                            {COLORS.map(c => (
                                                <button 
                                                    key={c.name} 
                                                    onClick={() => setColor(c.value)}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.value ? 'border-neutral-900 scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c.value }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDockTab === 'effects' && (
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    {[
                                        { label: 'Human Jitter', value: jitter, setter: setJitter, min: 0, max: 6, step: 0.5 },
                                        { label: 'Pen Pressure', value: pressure, setter: setPressure, min: 0, max: 1, step: 0.1 },
                                        { label: 'Ink Smudge', value: smudge, setter: setSmudge, min: 0, max: 2, step: 0.1 },
                                        { label: 'Baseline Warp', value: baseline, setter: setBaseline, min: -10, max: 20, step: 1 }
                                    ].map(ef => (
                                        <div key={ef.label}>
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{ef.label}</label>
                                                <span className="text-xs font-bold text-indigo-600">{ef.label.includes('Pressure') ? Math.round(ef.value*100)+'%' : ef.value}</span>
                                            </div>
                                            <input type="range" min={ef.min} max={ef.max} step={ef.step} value={ef.value} onChange={e => ef.setter(Number(e.target.value))} className="w-full h-1.5 bg-black/5 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 block">Paper Texture</label>
                                    <div className="flex gap-3 p-1 bg-white/40 border border-black/5 rounded-2xl">
                                        {PAPERS.map(p => (
                                            <button 
                                                key={p.id} 
                                                onClick={() => setPaper(p)}
                                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                                    paper.id === p.id ? 'bg-neutral-900 text-white shadow-xl' : 'text-neutral-400 hover:text-neutral-900'
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <input 
                                        value={marginNote} 
                                        onChange={e => setMarginNote(e.target.value)}
                                        placeholder="Add Margin Note..."
                                        className="w-full p-4 bg-white/50 border border-black/5 rounded-2xl text-[11px] font-bold focus:outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-black/5 cursor-pointer">
                                            <input type="checkbox" checked={showCoffeeStain} onChange={e => setShowCoffeeStain(e.target.checked)} className="w-4 h-4 rounded-lg border-black/10 text-indigo-600 focus:ring-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Coffee Stain</span>
                                        </label>
                                        <label className="flex items-center gap-3 p-3 bg-white/40 rounded-2xl border border-black/5 cursor-pointer">
                                            <input type="checkbox" checked={showStickyNote} onChange={e => setShowStickyNote(e.target.checked)} className="w-4 h-4 rounded-lg border-black/10 text-indigo-600 focus:ring-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Sticky Note</span>
                                        </label>
                                    </div>
                                    {showStickyNote && (
                                        <textarea 
                                            value={stickyNoteText}
                                            onChange={e => setStickyNoteText(e.target.value)}
                                            placeholder="Type note content..."
                                            className="w-full h-20 p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-2xl text-[11px] font-bold focus:outline-none resize-none"
                                        />
                                    )}
                                </div>
                                <button 
                                    onClick={() => setRandomSeed(prev => prev + 1)}
                                    className="w-full py-4 bg-white border border-dashed border-black/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 hover:border-black/20 transition-all flex items-center justify-center gap-3"
                                >
                                    <RefreshCw size={14} />
                                    Regenerate Simulation
                                </button>
                            </div>
                        )}

                        {activeDockTab === 'export' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-indigo-50/50 rounded-4xl border border-indigo-100 flex flex-col items-center text-center">
                                    <div className="p-4 bg-white rounded-3xl text-indigo-600 shadow-xl mb-4">
                                        <Download size={32} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-2">Save Document</h4>
                                    <p className="text-[11px] font-medium text-neutral-400 leading-relaxed uppercase tracking-tighter">Your simulation will be processed into high-resolution assets.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button 
                                        onClick={() => handleStartExport('pdf')}
                                        disabled={exportStatus === 'processing'}
                                        className="w-full py-5 bg-neutral-900 text-white rounded-4xl font-bold text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <FileText size={18} />
                                        Export as PDF
                                    </button>
                                    <button 
                                        onClick={() => handleStartExport('zip')}
                                        disabled={exportStatus === 'processing'}
                                        className="w-full py-5 bg-white border border-black/5 text-neutral-600 rounded-4xl font-bold text-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Sparkles size={18} />
                                        Batch Images (ZIP)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 2. THE FLOATING TRIGGER BUTTON */}
                <motion.button 
                    initial={false}
                    animate={{ 
                        opacity: isInputFocused ? 0 : 1,
                        scale: isInputFocused ? 0.8 : 1,
                        pointerEvents: isInputFocused ? 'none' : 'auto'
                    }}
                    onClick={() => setIsDockExpanded(!isDockExpanded)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
                        isDockExpanded 
                            ? 'bg-neutral-900 text-white rotate-90 transform' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                    }`}
                >
                    <Settings2 size={isDockExpanded ? 24 : 28} className="transition-transform duration-500" />
                </motion.button>
            </div>
                
            {/* MAIN WINDOW CONTAINER - Optimized for full-width layout */}
            <div className="w-full h-dvh bg-white flex flex-col overflow-hidden relative z-10">

                {/* MAIN VISUAL PREVIEW AREA */}
                <main className="flex-1 bg-[#FAFAFA] flex flex-col relative overflow-hidden group/canvas">
                    {/* TOP BAR / BREADCRUMB STYLE */}
                    <div className="h-12 sm:h-14 border-b border-black/5 flex items-center px-4 sm:px-6 lg:px-12 justify-between bg-white/50 backdrop-blur-sm relative z-30">
                        <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-400 truncate">
                            <FileText size={12} className="text-neutral-300 hidden sm:block"/>
                            <span className="hidden sm:inline">/ Documents /</span>
                            <span className="truncate max-w-[120px] sm:max-w-none">{headerText || 'Untitled'}</span>
                            {user && (
                                <button 
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors"
                                >
                                    <Clock size={10} />
                                    History
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-60">Engine Active</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 md:p-12 lg:p-24 flex flex-col items-center gap-8 sm:gap-12 md:gap-24 custom-scrollbar relative pb-24 lg:pb-12">
                        {/* THE "DESK" TEXTURE */}
                        <div className="absolute inset-0 bg-[radial-gradient(#00000003_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

                        {pages.map((page, pIdx) => (
                             <motion.div 
                                key={pIdx} 
                                initial={{opacity:0, y: 20, rotate: 0}} 
                                animate={{opacity:1, y: 0, rotate: 0}} 
                                className={`handwritten-page-render relative w-full max-w-[800px] aspect-[1/1.414] ${pIdx === 0 ? 'paper-stack' : 'shadow-2xl'} overflow-hidden shrink-0 transition-transform duration-700 ease-out ring-1 ring-black/5 rounded-0`} 
                                style={{ transformOrigin: 'center center' }}
                             >
                                {/* CLEAN EXPORT CONTAINER */}
                                <div className={`handwritten-export-target w-full h-full relative ${paper.css}`} style={paper.style}>
                                    {/* MARGIN ANNOTATION */}
                                    {marginNote && pIdx === 0 && (
                                        <div 
                                            className="absolute left-4 top-1/3 -rotate-90 origin-left z-20"
                                            style={{ fontFamily: font, color: color, opacity: 0.5, fontSize: fontSize * 0.6 }}
                                        >
                                            {marginNote}
                                        </div>
                                    )}

                                    {/* COFFEE STAIN */}
                                    {showCoffeeStain && pIdx === 0 && (
                                        <div 
                                            className="absolute -top-10 -right-10 pointer-events-none opacity-[0.08] blur-sm z-30"
                                            style={{ transform: `rotate(${getDeterminRandom('stain'+randomSeed)*360}deg) scale(${0.8 + getDeterminRandom('scale'+randomSeed) * 0.5})` }}
                                        >
                                            <svg width="300" height="300" viewBox="0 0 200 200">
                                                <path fill="#78350f" d="M100 20C55.8 20 20 55.8 20 100s35.8 80 80 80 80-35.8 80-80S144.2 20 100 20zm0 145c-35.9 0-65-29.1-65-65s29.1-65 65-65 65 29.1 65 65-29.1 65-65 65z"/>
                                                <circle cx="100" cy="100" r="55" fill="#78350f" opacity="0.3"/>
                                            </svg>
                                        </div>
                                    )}

                                    {/* STICKY NOTE */}
                                    {showStickyNote && pIdx === 0 && (
                                        <motion.div 
                                            initial={{ x: 100, y: 100, rotate: 5 }}
                                            className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200 shadow-lg p-4 z-40 flex flex-col font-handwriting"
                                            style={{ 
                                                fontFamily: 'Caveat', 
                                                color: '#854d0e',
                                                transform: `rotate(${getDeterminRandom('sticky'+randomSeed)*10 - 5}deg)`,
                                                boxShadow: '2px 5px 15px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <div className="text-xs uppercase font-black opacity-20 mb-2">Note:</div>
                                            <div className="text-lg leading-tight">{stickyNoteText}</div>
                                            <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-300/30" />
                                        </motion.div>
                                    )}

                                    {showHeader && pIdx === 0 && (
                                        <div 
                                            className="absolute left-0 right-0 z-10 flex flex-col items-center"
                                            style={{ 
                                                top: marginTop - paper.lineHeight,
                                                textAlign: 'center',
                                                paddingLeft: marginLeft,
                                                paddingRight: marginRight,
                                                width: '100%'
                                            }}
                                        >
                                            {headerText.split('\n').map((hLine: string, hlIdx: number) => (
                                                <div 
                                                    key={hlIdx} 
                                                    style={{
                                                        fontFamily: font, 
                                                        fontSize, 
                                                        color, 
                                                        height: paper.lineHeight, 
                                                        lineHeight: `${paper.lineHeight}px`,
                                                        transform: `translateY(${baseline}px)`
                                                    }} 
                                                    className="w-full whitespace-nowrap overflow-hidden"
                                                >
                                                    {hLine.split(' ').map((word: string, wIdx: number) => {
                                                        const seed = `header-${hlIdx}-${wIdx}-${word}-${randomSeed}`;
                                                        const y = (getDeterminRandom(seed+'y')-0.5)*jitter*3;
                                                        const r = (getDeterminRandom(seed+'r')-0.5)*jitter*1.5;
                                                        const op = 1-(getDeterminRandom(seed+'o')*pressure*0.2);
                                                        const bl = smudge > 0 ? getDeterminRandom(seed+'b')*smudge*0.4 : 0;
                                                        return <span key={wIdx} className="inline-block" style={{transform:`translateY(${y}px) rotate(${r}deg)`, opacity:op, filter:bl?`blur(${bl}px)`:'none', marginRight:'0.25em'}}>{word}</span>;
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div 
                                        className="w-full h-full relative" 
                                        style={{
                                            paddingTop: (pIdx === 0 ? marginTop - paper.lineHeight : marginTop) + (pIdx === 0 && showHeader ? (headerText.split('\n').length) * paper.lineHeight : 0), 
                                            paddingBottom: marginBottom, 
                                            paddingLeft: marginLeft, 
                                            paddingRight: marginRight
                                        }}
                                    >   
                                        {page.lines.map((line, lIdx) => (
                                            <div 
                                                key={lIdx} 
                                                dir={line.dir}
                                                style={{
                                                    fontFamily:font, 
                                                    fontSize, 
                                                    color, 
                                                    height:paper.lineHeight, 
                                                    lineHeight:`${paper.lineHeight}px`, 
                                                    transform:`translateY(${baseline}px)`, 
                                                    textAlign: line.dir === 'rtl' ? (textAlign === 'left' ? 'right' : textAlign === 'right' ? 'left' : textAlign) : textAlign, 
                                                    paddingLeft: line.indent ? line.indent * (fontSize * 0.4) : 0,
                                                    paddingRight: line.dir === 'rtl' && line.indent ? line.indent * (fontSize * 0.4) : 0
                                                }} 
                                                className="w-full whitespace-nowrap overflow-hidden"
                                            >
                                                {line.text.split(' ').map((word, wIdx) => {
                                                    const seed = `${pIdx}-${lIdx}-${wIdx}-${word}-${randomSeed}`;
                                                    const y = (getDeterminRandom(seed+'y')-0.5)*jitter*3;
                                                    const r = (getDeterminRandom(seed+'r')-0.5)*jitter*1.5;
                                                    const op = 1-(getDeterminRandom(seed+'o')*pressure*0.2);
                                                    const bl = smudge > 0 ? getDeterminRandom(seed+'b')*smudge*0.4 : 0;
                                                    
                                                    const wordInLineOffset = line.text.split(' ').slice(0, wIdx).join(' ').length + (wIdx > 0 ? 1 : 0);

                                                    return (
                                                        <span 
                                                            key={wIdx} 
                                                            onClick={() => handleWordClick(line.charIndex + wordInLineOffset)}
                                                            className="inline-block cursor-pointer transition-opacity hover:opacity-50" 
                                                            style={{transform:`translateY(${y}px) rotate(${r}deg)`, opacity:op, filter:bl?`blur(${bl}px)`:'none', marginRight:'0.25em'}}
                                                        >
                                                            {word}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    {showPageNumbers && (
                                        <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] font-black text-gray-300 tracking-widest uppercase">Page {pIdx+1} of {pages.length}</div>
                                    )}
                                    <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')]"/>
                                    {paper.id !== 'plain' && <div className="absolute top-0 bottom-0 left-[50px] w-px bg-red-300 opacity-20"/>}
                                </div>
                             </motion.div>
                        ))}
                    </div>
                </main>
            </div>
            

            <ExportModal 
                key={isExportModalOpen ? 'open' : 'closed'}
                isOpen={isExportModalOpen}
                onClose={() => {
                    setIsExportModalOpen(false);
                    if (exportStatus !== 'processing') setExportStatus('idle');
                }}
                onStart={executeExport}
                format={exportFormat}
                progress={progress}
                status={exportStatus}
                initialFileName={headerText || 'handwritten-document'}
            />

            <HistoryModal 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)} 
            />
        </div>
    );
}

