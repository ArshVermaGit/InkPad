import { useState, useMemo, useDeferredValue, useEffect, useRef } from 'react';


import { 
    Settings2, FileText, RefreshCw, Type, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, 
    Sparkles, Ruler, Zap, Download, Wand2, Clock, X
} from 'lucide-react';

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
        textAlign, setTextAlign,
        history: storeHistory, addToHistory
    } = useStore();

    // Local UI State
    const [progress, setProgress] = useState(0);
    const [randomSeed, setRandomSeed] = useState(0);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'zip'>('pdf');
    const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'export', format: 'pdf' | 'zip' } | null>(null);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
    const [activeMobileTab, setActiveMobileTab] = useState<'write' | 'design' | 'paper' | 'effects'>('write');
    const [mobileView, setMobileView] = useState<'write' | 'preview'>('write');
    const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Responsive Canvas Scaling
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { clientWidth } = containerRef.current;
                const targetWidth = 800; // Base width of the paper
                const padding = 32; // Safety margin
                const availableWidth = clientWidth - padding;
                
                // Only scale down, never up (max 1)
                const newScale = Math.min(1, availableWidth / targetWidth);
                setScale(newScale);
            }
        };

        // Initial check
        updateScale();

        // Observer
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [mobileView]);

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
        if (!text.trim()) {
            addToast('Please enter some text first.', 'warning');
            return;
        }

        const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (!openRouterKey) {
            addToast('OpenRouter Key Missing. Please add VITE_OPENROUTER_API_KEY to .env', 'error');
            return;
        }

        setIsHumanizing(true);
        
        const systemPrompt = `You are a text humanizer. Your task is to rewrite the input text to sound like natural, organic human prose for a handwriting simulator. 
        - Use a casual, friendly tone.
        - Use common contractions (e.g., "I'm" instead of "I am").
        - Vary sentence structure and length to make it feel spontaneous.
        - Maintain the original meaning and core facts.
        - Output ONLY the rewritten text, without any conversational filler or markdown formatting.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openRouterKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Handwritten AI Humanizer'
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ],
                    temperature: 0.7,
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const rewritten = data.choices?.[0]?.message?.content;

            if (rewritten?.trim()) {
                setText(normalizeInput(rewritten.trim()));
                addToast('Text Humanized via OpenRouter! ✨', 'success');
            } else {
                throw new Error("Empty response from AI service");
            }
        } catch (err: unknown) {
            const error = err as Error;
            console.error('OpenRouter Humanizer error:', error);
            addToast(`AI Error: ${error.message}`, 'error');
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

    const executeExport = async (customName: string, explicitFormat?: 'pdf' | 'zip') => {
        const currentFormat = explicitFormat || exportFormat;
        setExportStatus('processing');
        setProgress(0);
        console.log("Starting Pixel-Perfect Export...");
        
        const restoreActions: (() => void)[] = [];
        const ctx = document.createElement('canvas').getContext('2d');
        
        const getSafeColor = (color: string) => {
            if (!ctx || !color || color === 'none' || color === 'transparent') return color;
            if (color.startsWith('#') || color.startsWith('rgb')) return color;
            try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, 1, 1);
                const d = ctx.getImageData(0, 0, 1, 1).data;
                return `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3]/255).toFixed(3)})`;
            } catch { return color; }
        };

        const lockComputedStyles = () => {
            const targets = document.querySelectorAll('.handwritten-export-target, .handwritten-export-target *');
            targets.forEach((el) => {
                const hEl = el as HTMLElement;
                const computed = window.getComputedStyle(hEl);
                const originalStyle = hEl.getAttribute('style') || '';
                restoreActions.push(() => hEl.setAttribute('style', originalStyle));

                // PIN ALL VISUAL PROPERTIES
                const props = [
                    'color', 'background-color', 'border-color',
                    'display', 'position', 'top', 'left', 'right', 'bottom',
                    'width', 'height', 'margin', 'padding',
                    'font-size', 'font-family', 'font-weight', 'line-height', 'text-align',
                    'letter-spacing', 'word-spacing', 'white-space', 'text-decoration',
                    'opacity', 'z-index', 'transform', 'transform-origin',
                    'border-width', 'border-style', 'border-radius', 'box-shadow'
                ];

                props.forEach(p => {
                    const val = computed.getPropertyValue(p);
                    if (val && val !== 'none' && val !== 'normal' && val !== '0px auto') {
                        if (p.includes('color')) {
                            const safeColor = getSafeColor(val);
                            if (safeColor) hEl.style.setProperty(p, safeColor);
                        } else {
                            hEl.style.setProperty(p, val);
                        }
                    }
                });

                // Explicit Background Logic
                if (computed.backgroundImage !== 'none') {
                    hEl.style.backgroundImage = computed.backgroundImage;
                    hEl.style.backgroundSize = computed.backgroundSize;
                    hEl.style.backgroundPosition = computed.backgroundPosition;
                    hEl.style.backgroundRepeat = computed.backgroundRepeat;
                }
            });
        };

        const ignoreNonFontStyles = () => {
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(tag => {
                const isGoogleFont = tag.tagName === 'LINK' && (tag as HTMLLinkElement).href.includes('fonts.googleapis');
                if (!isGoogleFont) {
                    tag.setAttribute('data-html2canvas-ignore', 'true');
                    restoreActions.push(() => tag.removeAttribute('data-html2canvas-ignore'));
                }
            });
        };

        try {
            await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]);
            
            const rawElements = document.querySelectorAll('.handwritten-export-target');
            if (rawElements.length === 0) throw new Error('No content found to export');

            lockComputedStyles();
            ignoreNonFontStyles();
            await new Promise(resolve => setTimeout(resolve, 300)); // Slightly longer for stability

            // FILENAME LOGIC (Sanitized)
            let cleanName = customName || `handwritten-${Date.now()}`;
            cleanName = cleanName.replace(/\.[^/.]+$/, "").replace(/[<>:"/\\|?*]/g, '').trim() || `handwritten-${Date.now()}`;
            const finalFileName = `${cleanName}.${currentFormat}`;

            if (currentFormat === 'pdf') {
                const pdf = new jsPDF({ 
                    orientation: 'p', 
                    unit: 'mm', 
                    format: 'a4', 
                    putOnlyUsedFonts: true,
                    compress: true 
                });

                for (let i = 0; i < rawElements.length; i++) {
                    if (i > 0) pdf.addPage();
                    
                    const canvas = await html2canvas(rawElements[i] as HTMLElement, { 
                        scale: 3, 
                        useCORS: true, 
                        backgroundColor: '#ffffff',
                        logging: false,
                        onclone: (doc) => {
                            const clonedPages = doc.querySelectorAll('.handwritten-export-target');
                            clonedPages.forEach((p) => {
                                const pageEl = p as HTMLElement;
                                // Reset the scaling container but KEEP child transforms (nudge/jitter)
                                pageEl.style.transform = 'none';
                                pageEl.style.margin = '0';
                                pageEl.style.position = 'relative';
                                pageEl.style.top = '0';
                                pageEl.style.left = '0';
                                
                                // Reset any parent containers that might have transforms (like the page render wrapper)
                                let parent = pageEl.parentElement;
                                while (parent && !parent.classList.contains('handwritten-export-target')) {
                                    parent.style.transform = 'none';
                                    parent.style.margin = '0';
                                    parent = parent.parentElement;
                                }

                                // Handle html2canvas blend mode / filter quirks
                                const problemNodes = pageEl.querySelectorAll('*');
                                problemNodes.forEach(n => {
                                    const node = n as HTMLElement;
                                    node.style.mixBlendMode = 'normal';
                                    node.style.filter = 'none';
                                });
                            });
                        }
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 0.98); // High quality
                    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'SLOW');
                    setProgress(Math.round(((i + 1) / rawElements.length) * 100));
                }
                
                const pdfBlob = pdf.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = finalFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                try { await saveExportedFile(pdfBlob, finalFileName, 'pdf'); } catch { /* Ignore local save failure */ }

            } else {
                const zip = new JSZip();
                for (let i = 0; i < rawElements.length; i++) {
                    const canvas = await html2canvas(rawElements[i] as HTMLElement, { 
                        scale: 3, 
                        useCORS: true, 
                        backgroundColor: '#ffffff',
                        onclone: (doc) => {
                            const clonedPages = doc.querySelectorAll('.handwritten-export-target');
                            clonedPages.forEach((p) => {
                                const pageEl = p as HTMLElement;
                                pageEl.style.transform = 'none';
                                pageEl.style.margin = '0';
                            });
                        }
                    });
                    const imgData = canvas.toDataURL('image/png', 1.0).split(',')[1];
                    zip.file(`page-${i + 1}.png`, imgData, { base64: true });
                    setProgress(Math.round(((i + 1) / rawElements.length) * 100));
                }
                const content = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(content);
                const link = document.createElement('a');
                link.href = url;
                link.download = finalFileName;
                link.click();
                URL.revokeObjectURL(url);
                try { await saveExportedFile(content, finalFileName, 'zip'); } catch { /* Ignore local save failure */ }
            }
            
            setExportStatus('complete');
            addToast('Pixel-Perfect Export Successful! ✨', 'success');
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Export Failure:', error);
            setExportStatus('error');
            addToast(`Export Failed: ${error.message}`, 'error');
        } finally {
            restoreActions.forEach(undo => undo());
        }
    };

    return (
        <div className="relative selection:bg-indigo-500/30 font-sans">
            
            {/* ==================== MOBILE LAYOUT (lg:hidden) ==================== */}
            <div className="lg:hidden flex flex-col h-screen bg-neutral-50">
                
                {/* Mobile Header */}
                {/* Mobile Header - Premium Window Style */}
                <div className="flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-neutral-100 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {/* Decorative Window Dots */}
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                        </div>
                        <div className="h-4 w-px bg-neutral-200 ml-1 mr-1" />
                        <div>
                            <h1 className="font-display font-bold text-neutral-900 truncate max-w-[150px] leading-tight">
                                {headerText || 'Untitled'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Live</span>
                    </div>
                </div>

                {/* Mobile Content Area */}
                <div className="flex-1 overflow-hidden">
                    
                    {/* WRITE VIEW */}
                    {mobileView === 'write' && (
                        <div className="h-full flex flex-col bg-white">
                            
                            {/* Quick Settings Bar */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/5 overflow-x-auto shrink-0">
                                <select 
                                    value={font} 
                                    onChange={e => setFont(e.target.value)}
                                    className="px-3 py-2 bg-neutral-100 rounded-xl text-xs font-medium min-w-[100px]"
                                >
                                    {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                </select>
                                <div className="flex gap-1.5">
                                    {COLORS.slice(0, 4).map(c => (
                                        <button 
                                            key={c.name} 
                                            onClick={() => setColor(c.value)}
                                            className={`w-7 h-7 rounded-lg border-2 transition-all ${color === c.value ? 'border-neutral-900 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setMobileSettingsOpen(true)}
                                    className="ml-auto px-3 py-2 bg-neutral-100 rounded-xl"
                                >
                                    <Settings2 size={16} className="text-neutral-600" />
                                </button>
                            </div>
                            
                            {/* Main Text Input with Premium Feel */}
                            <div className="flex-1 p-4 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
                                <textarea 
                                    ref={sourceRef}
                                    value={text} 
                                    onChange={(e) => setText(normalizeInput(e.target.value))} 
                                    className="relative z-10 w-full h-full p-6 bg-white border border-neutral-100 rounded-[1.5rem] text-base resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900/5 focus:border-neutral-200 shadow-sm leading-relaxed"
                                    placeholder="Start writing your text here...

Your words will be transformed into beautiful handwriting."
                                    style={{ fontFamily: font }}
                                />
                            </div>
                            
                            {/* AI Humanize Button */}
                            <div className="px-4 pb-4 shrink-0">
                                <button 
                                    onClick={handleHumanize}
                                    disabled={isHumanizing || !text.trim()}
                                    className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg active:scale-[0.98] transition-all"
                                >
                                    <Wand2 size={18} className={isHumanizing ? 'animate-spin' : ''} />
                                    {isHumanizing ? 'Humanizing...' : 'AI Humanize Text'}
                                    <Sparkles size={12} className="text-amber-400" />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* PREVIEW VIEW */}
                    {mobileView === 'preview' && (
                        <div className="h-full flex flex-col">
                            
                            {/* Preview Canvas Area */}
                            <div ref={containerRef} className="flex-1 overflow-auto p-4 bg-neutral-100">
                                <div className="flex flex-col items-center gap-6 pb-24">
                                    {pages.map((page, pIdx) => (
                                        <div 
                                            key={pIdx}
                                            style={{ 
                                                width: 800 * scale, 
                                                height: (800 * 1.414) * scale,
                                            }}
                                            className="relative shrink-0"
                                        >
                                            <div 
                                                className={`handwritten-page-render absolute top-0 left-0 w-[800px] aspect-[1/1.414] ${pIdx === 0 ? 'paper-stack' : 'shadow-2xl'} overflow-hidden bg-white ring-1 ring-black/5 rounded-sm origin-top-left`} 
                                                style={{ 
                                                    transform: `scale(${scale})`,
                                                    transformOrigin: 'top left'
                                                }}
                                            >
                                                {/* Export Container */}
                                                <div className={`handwritten-export-target w-full h-full relative ${paper.css}`} style={paper.style}>
                                                    {marginNote && pIdx === 0 && (
                                                        <div 
                                                            className="absolute left-4 top-1/3 -rotate-90 origin-left z-20"
                                                            style={{ fontFamily: font, color: color, opacity: 0.5, fontSize: fontSize * 0.6 }}
                                                        >
                                                            {marginNote}
                                                        </div>
                                                    )}
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
                                                    {showStickyNote && pIdx === 0 && (
                                                        <div 
                                                            className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200 shadow-lg p-4 z-40 flex flex-col"
                                                            style={{ 
                                                                fontFamily: 'Caveat', 
                                                                color: '#854d0e',
                                                                transform: `rotate(${getDeterminRandom('sticky'+randomSeed)*10 - 5}deg)`,
                                                            }}
                                                        >
                                                            <div className="text-xs uppercase font-black opacity-20 mb-2">Note:</div>
                                                            <div className="text-lg leading-tight">{stickyNoteText}</div>
                                                        </div>
                                                    )}
                                                    {showHeader && pIdx === 0 && (
                                                        <div 
                                                            className="absolute left-0 right-0 z-10 flex flex-col items-center"
                                                            style={{ 
                                                                top: marginTop - paper.lineHeight,
                                                                textAlign: 'center',
                                                                paddingLeft: marginLeft,
                                                                paddingRight: marginRight,
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
                                                                }} 
                                                                className="w-full whitespace-nowrap overflow-hidden"
                                                            >
                                                                {line.text.split(' ').map((word, wIdx) => {
                                                                    const seed = `${pIdx}-${lIdx}-${wIdx}-${word}-${randomSeed}`;
                                                                    const y = (getDeterminRandom(seed+'y')-0.5)*jitter*3;
                                                                    const r = (getDeterminRandom(seed+'r')-0.5)*jitter*1.5;
                                                                    const op = 1-(getDeterminRandom(seed+'o')*pressure*0.2);
                                                                    const bl = smudge > 0 ? getDeterminRandom(seed+'b')*smudge*0.4 : 0;
                                                                    return (
                                                                        <span 
                                                                            key={wIdx} 
                                                                            className="inline-block" 
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Export Buttons - Fixed at bottom */}
                            <div className="absolute bottom-16 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-neutral-100 via-neutral-100 to-transparent pt-8">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleStartExport('pdf')}
                                        disabled={exportStatus === 'processing'}
                                        className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
                                    >
                                        <Download size={18} />
                                        Export PDF
                                    </button>
                                    <button 
                                        onClick={() => handleStartExport('zip')}
                                        disabled={exportStatus === 'processing'}
                                        className="py-4 px-5 bg-white text-neutral-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-black/5 disabled:opacity-50 active:scale-[0.98] transition-all"
                                    >
                                        <Sparkles size={16} />
                                        ZIP
                                    </button>
                                    <button 
                                        onClick={() => setMobileSettingsOpen(true)}
                                        className="py-4 px-5 bg-white text-neutral-700 rounded-2xl font-bold flex items-center justify-center border border-black/5 active:scale-[0.98] transition-all"
                                    >
                                        <Settings2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="flex bg-white border-t border-black/5 shrink-0 safe-area-bottom">
                    <button
                        onClick={() => setMobileView('write')}
                        className={`flex-1 py-4 flex flex-col items-center gap-1.5 relative group ${
                            mobileView === 'write' 
                                ? 'text-neutral-900' 
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        {mobileView === 'write' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-900 rounded-b-full" />
                        )}
                        <Type size={22} strokeWidth={mobileView === 'write' ? 2.5 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Write</span>
                    </button>
                    <button
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 py-4 flex flex-col items-center gap-1.5 relative group ${
                            mobileView === 'preview' 
                                ? 'text-neutral-900' 
                                : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        {mobileView === 'preview' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-900 rounded-b-full" />
                        )}
                        <FileText size={22} strokeWidth={mobileView === 'preview' ? 2.5 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                    </button>
                </div>

                {/* Mobile Settings Overlay */}
                {mobileSettingsOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-neutral-900/40 z-50 backdrop-blur-md"
                            onClick={() => setMobileSettingsOpen(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                            {/* Premium Header with macOS dots */}
                            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                                        <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-neutral-900">Settings</h3>
                                        <p className="text-[10px] text-neutral-400 font-medium">Customize your document</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setMobileSettingsOpen(false)}
                                    className="p-3 hover:bg-neutral-100 rounded-full transition-all"
                                >
                                    <X size={20} className="text-neutral-400" />
                                </button>
                            </div>
                            {/* Content Area with grid pattern */}
                            <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA] relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />
                                <div className="relative z-10 space-y-5">
                                {/* Header */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Document Heading</label>
                                    <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                                        <input 
                                            type="checkbox" 
                                            checked={showHeader} 
                                            onChange={e => setPageOptions({ showHeader: e.target.checked })} 
                                            className="w-5 h-5 rounded-lg"
                                        />
                                        <span className="text-sm font-medium">Enable Heading</span>
                                    </label>
                                    {showHeader && (
                                        <textarea 
                                            value={headerText} 
                                            onChange={(e) => setPageOptions({ headerText: e.target.value })}
                                            className="w-full h-20 p-4 bg-neutral-50 rounded-2xl text-sm resize-none"
                                            placeholder="Type your heading..."
                                        />
                                    )}
                                </div>
                                
                                {/* Paper */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Paper Style</label>
                                    <div className="flex bg-neutral-100 rounded-2xl p-1.5">
                                        {PAPERS.map(p => (
                                            <button 
                                                key={p.id} 
                                                onClick={() => setPaper(p)}
                                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${paper.id === p.id ? 'bg-white shadow' : ''}`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                    <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                                        <input 
                                            type="checkbox" 
                                            checked={showPageNumbers} 
                                            onChange={e => setPageOptions({ showPageNumbers: e.target.checked })} 
                                            className="w-5 h-5 rounded-lg"
                                        />
                                        <span className="text-sm font-medium">Show Page Numbers</span>
                                    </label>
                                </div>
                                
                                {/* Typography */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Typography</label>
                                    <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                                        <div>
                                            <label className="text-xs text-neutral-500 mb-2 flex justify-between">
                                                Font Size <span className="font-bold text-neutral-900">{fontSize}px</span>
                                            </label>
                                            <input type="range" min="14" max="64" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500 mb-2 flex justify-between">
                                                Line Nudge <span className="font-bold text-neutral-900">{baseline}</span>
                                            </label>
                                            <input type="range" min="-10" max="30" value={baseline} onChange={e => setBaseline(Number(e.target.value))} className="w-full" />
                                        </div>
                                    </div>
                                    <div className="flex bg-neutral-100 rounded-2xl p-1.5">
                                        {[
                                            { id: 'left' as const, icon: AlignLeft },
                                            { id: 'center' as const, icon: AlignCenter },
                                            { id: 'right' as const, icon: AlignRight },
                                            { id: 'justify' as const, icon: AlignJustify }
                                        ].map(opt => (
                                            <button 
                                                key={opt.id} 
                                                onClick={() => setTextAlign(opt.id)}
                                                className={`flex-1 p-3 flex justify-center rounded-xl transition-all ${textAlign === opt.id ? 'bg-white shadow' : ''}`}
                                            >
                                                <opt.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Effects */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Handwriting Effects</label>
                                    <button 
                                        onClick={() => setRandomSeed(prev => prev + 1)}
                                        className="w-full py-3 bg-neutral-100 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Re-Randomize
                                    </button>
                                    <div className="bg-neutral-50 rounded-2xl p-4 space-y-4">
                                        <div>
                                            <label className="text-xs text-neutral-500 mb-2 flex justify-between">
                                                Jitter <span className="font-bold text-neutral-900">{jitter}</span>
                                            </label>
                                            <input type="range" min="0" max="6" step="0.5" value={jitter} onChange={e => setJitter(Number(e.target.value))} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500 mb-2 flex justify-between">
                                                Pressure <span className="font-bold text-neutral-900">{Math.round(pressure*100)}%</span>
                                            </label>
                                            <input type="range" min="0" max="1" step="0.1" value={pressure} onChange={e => setPressure(Number(e.target.value))} className="w-full" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500 mb-2 flex justify-between">
                                                Smudge <span className="font-bold text-neutral-900">{smudge}</span>
                                            </label>
                                            <input type="range" min="0" max="2" step="0.1" value={smudge} onChange={e => setSmudge(Number(e.target.value))} className="w-full" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Special Effects */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Special Effects</label>
                                    <input 
                                        type="text" 
                                        value={marginNote} 
                                        onChange={(e) => setMarginNote(e.target.value)}
                                        className="w-full p-4 bg-neutral-50 rounded-2xl text-sm"
                                        placeholder="Margin note..."
                                    />
                                    <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                                        <input 
                                            type="checkbox" 
                                            checked={showCoffeeStain} 
                                            onChange={(e) => setShowCoffeeStain(e.target.checked)} 
                                            className="w-5 h-5 rounded-lg"
                                        />
                                        <span className="text-sm font-medium">Coffee Stain Effect</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                                        <input 
                                            type="checkbox" 
                                            checked={showStickyNote} 
                                            onChange={(e) => setShowStickyNote(e.target.checked)} 
                                            className="w-5 h-5 rounded-lg"
                                        />
                                        <span className="text-sm font-medium">Sticky Note</span>
                                    </label>
                                    {showStickyNote && (
                                        <textarea 
                                            value={stickyNoteText} 
                                            onChange={(e) => setStickyNoteText(e.target.value)}
                                            className="w-full h-16 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm resize-none"
                                            placeholder="Note text..."
                                        />
                                    )}
                                </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* ==================== END MOBILE LAYOUT ==================== */}

            {/* MOBILE BOTTOM PANEL OVERLAY - Keep for backwards compat but hidden */}
            {isMobilePanelOpen && (
                <div 
                    className="lg:hidden hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                    onClick={() => setIsMobilePanelOpen(false)}
                />
            )}

            {/* MAIN WINDOW CONTAINER - Desktop Only */}
            <div className="hidden lg:flex w-full max-w-[1600px] min-h-[60vh] lg:h-[85vh] bg-white rounded-2xl lg:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-black/5 flex-col lg:flex-row overflow-hidden relative z-10 transition-all">
                
                {/* DESKTOP SIDEBAR - Hidden on mobile */}
                <aside 
                    className="hidden lg:flex w-80 bg-[#F9F9F9] border-r border-black/5 flex-col shrink-0 overflow-hidden"
                >
                    {/* MACOS DOTS - Fixed Header */}
                    <div className="px-8 pt-8 shrink-0">
                         <div className="flex gap-2 mb-10">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                        <div 
                            className="flex flex-col gap-6"
                        >
                        <div>
                             <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3"><Type size={12}/> Document Heading</label>
                             <div className="space-y-3 p-1">
                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-white border border-black/5 hover:border-black/10 transition-colors">
                                    <input type="checkbox" checked={showHeader} onChange={e=>setPageOptions({ showHeader:e.target.checked })} className="w-4 h-4 rounded border-black/20 text-neutral-900 focus:ring-0 transition-all cursor-pointer"/><span className="text-xs font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">Enable Heading</span>
                                </label>
                                {showHeader && (
                                    <textarea 
                                        value={headerText} 
                                        onChange={(e) => setPageOptions({ headerText: e.target.value })}
                                        className="w-full h-24 p-4 bg-white border border-black/5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/20 resize-none font-sans transition-all placeholder:text-neutral-300 shadow-sm"
                                        placeholder="Type your heading..."
                                    />
                                )}
                             </div>
                        </div>

                        <div className="h-px bg-black/5 w-full my-2" />

                        {/* 2. THE SOURCE */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3"><FileText size={12}/> The Source</label>
                            <div className="relative group">
                                 <div className="absolute -inset-2 bg-linear-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-1000 group-focus-within:opacity-100" />
                                <textarea 
                                    ref={sourceRef}
                                    value={text} 
                                    onChange={(e) => setText(normalizeInput(e.target.value))} 
                                    className="relative w-full h-64 p-5 bg-white border border-black/5 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none font-sans shadow-sm transition-all focus:shadow-md" 
                                    placeholder="Start writing your masterpiece..."
                                />
                            </div>
                        </div>

                        {/* 3. AI HUMANIZER */}
                         <div className="relative">
                              <button 
                                 onClick={handleHumanize}
                                 disabled={isHumanizing || !text.trim()}
                                 className="w-full py-4 px-5 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 disabled:opacity-50 disabled:shadow-none transition-all group overflow-hidden relative"
                              >
                                 <div className="absolute inset-0 bg-linear-to-r from-indigo-50/50 via-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                 <div className="flex items-center justify-between relative z-10">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-neutral-900 rounded-xl text-white flex items-center justify-center shadow-lg shadow-neutral-900/20">
                                             <Wand2 size={18} className={isHumanizing ? 'animate-spin' : ''}/>
                                         </div>
                                         <div className="text-left leading-tight">
                                             <div className="text-xs font-black uppercase tracking-widest text-neutral-900 flex items-center gap-1.5">
                                                 AI Humanizer
                                                 <Sparkles size={10} className="text-amber-500 animate-pulse" />
                                             </div>
                                             <div className="text-[10px] font-bold text-neutral-400">One-Click Organic Rewriting</div>
                                         </div>
                                     </div>
                                     {isHumanizing && <RefreshCw size={14} className="animate-spin text-neutral-300" />}
                                  </div>
                              </button>
                         </div>

                        <div className="h-px bg-black/5 w-full my-2" />

                        {/* 4. PAPER & SETUP (Cleaned up) */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4"><Ruler size={12}/> Paper & Setup</label>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex p-1 bg-white border border-black/5 rounded-xl shadow-xs">
                                     {PAPERS.map(p=>(
                                        <button 
                                            key={p.id} 
                                            onClick={()=>setPaper(p)} 
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${paper.id===p.id?'bg-neutral-900 text-white shadow-lg':'text-neutral-400 hover:text-neutral-900'}`}
                                        >
                                            {p.name}
                                        </button>
                                     ))}
                                </div>
                                <div className="mt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={showPageNumbers} onChange={e=>setPageOptions({ showPageNumbers:e.target.checked })} className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0 transition-all"/><span className="text-[11px] font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors uppercase tracking-tight">Show Page Numbers</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-black/5 w-full my-2" />

                        {/* 5. TYPOGRAPHY */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4"><Settings2 size={12}/> Typography</label>
                            <div className="space-y-4">
                                <div className="flex bg-white border border-black/5 p-1 rounded-xl shadow-xs">
                                    {[{id:'left', icon:AlignLeft},{id:'center', icon:AlignCenter},{id:'right', icon:AlignRight},{id:'justify', icon:AlignJustify}].map(opt=>(
                                        <button key={opt.id} onClick={()=>setTextAlign(opt.id as 'left' | 'center' | 'right' | 'justify')} className={`flex-1 p-2 flex justify-center rounded-lg transition-all ${textAlign===opt.id?'bg-neutral-900 text-white shadow-lg':'text-neutral-400 hover:text-neutral-900'}`}><opt.icon size={14}/></button>
                                    ))}
                                </div>
                                <select value={font} onChange={e=>setFont(e.target.value)} className="w-full p-3 bg-white border border-black/5 rounded-xl text-[11px] font-bold text-neutral-700 shadow-xs focus:outline-none">{FONTS.map(f=><option key={f.name} value={f.name}>{f.label}</option>)}</select>
                                <div className="space-y-4">
                                    <div><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-2 flex justify-between">Font Size <span>{fontSize}px</span></span><input type="range" min="14" max="64" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"/></div>
                                    <div><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-2 flex justify-between">Line Nudge <span>{baseline}</span></span><input type="range" min="-10" max="30" value={baseline} onChange={e=>setBaseline(Number(e.target.value))} className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer"/></div>
                                </div>
                                <div className="flex gap-2 pt-2">{COLORS.map(c=>(<button key={c.name} onClick={()=>setColor(c.value)} className={`w-5 h-5 rounded-full border-2 ${color === c.value?'border-neutral-900 scale-110':'border-transparent'} shadow-xs transition-all`} style={{backgroundColor:c.value}}/>))}</div>
                            </div>
                        </div>

                        <div className="h-px bg-black/5 w-full my-2" />

                        {/* 6. RENDERING */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4"><Sparkles size={12}/> Rendering</label>
                            <div className="space-y-4">
                                 <button 
                                    onClick={() => setRandomSeed(prev => prev + 1)}
                                    className="w-full py-3 bg-white border border-black/5 text-[10px] font-bold uppercase tracking-widest text-neutral-600 rounded-xl hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xs group"
                                >
                                    <RefreshCw size={12} className={`group-hover:rotate-180 transition-transform duration-500 ${exportStatus === 'processing' ? 'animate-spin' : ''}`}/> Re-Randomize
                                </button>
                                <div className="space-y-4">
                                    <div><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-2 flex justify-between">Jitter <span>{jitter}</span></span><input type="range" min="0" max="6" step="0.5" value={jitter} onChange={(e) => setJitter(Number(e.target.value))} className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer" /></div>
                                    <div><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-2 flex justify-between">Pressure <span>{Math.round(pressure*100)}%</span></span><input type="range" min="0" max="1" step="0.1" value={pressure} onChange={(e) => setPressure(Number(e.target.value))} className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer" /></div>
                                    <div><span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter mb-2 flex justify-between">Smudge <span>{smudge}</span></span><input type="range" min="0" max="2" step="0.1" value={smudge} onChange={(e) => setSmudge(Number(e.target.value))} className="w-full h-1 bg-black/5 rounded-full appearance-none accent-neutral-900 cursor-pointer" /></div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-black/5 w-full my-2" />

                        {/* 7. EFFECTS */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4"><Zap size={12}/> Effects</label>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    value={marginNote} 
                                    onChange={(e) => setMarginNote(e.target.value)}
                                    className="w-full p-3 bg-white border border-black/5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-xs transition-all"
                                    placeholder="Margin Note..."
                                />
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={showCoffeeStain} onChange={(e) => setShowCoffeeStain(e.target.checked)} className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0 transition-all"/><span className="text-[11px] font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors uppercase">Coffee Stain</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={showStickyNote} onChange={(e) => setShowStickyNote(e.target.checked)} className="w-4 h-4 rounded border-black/10 text-neutral-900 focus:ring-0 transition-all"/><span className="text-[11px] font-bold text-neutral-600 group-hover:text-neutral-900 transition-colors uppercase">Sticky Note</span>
                                    </label>
                                    {showStickyNote && (
                                        <textarea 
                                            value={stickyNoteText} 
                                            onChange={(e) => setStickyNoteText(e.target.value)}
                                            className="w-full h-16 p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-xl text-xs font-medium focus:outline-none resize-none shadow-xs transition-all"
                                            placeholder="Note text..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <button 
                                onClick={() => handleStartExport('pdf')} 
                                disabled={exportStatus === 'processing'} 
                                className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-bold text-sm shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] hover:shadow-2xl active:translate-y-0 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                Export PDF
                            </button>
                            <button 
                                onClick={() => handleStartExport('zip')} 
                                disabled={exportStatus === 'processing'} 
                                className="w-full py-3 rounded-2xl bg-white border border-black/5 text-neutral-600 font-bold text-[11px] uppercase tracking-widest hover:bg-neutral-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} />
                                Export Images (ZIP)
                            </button>
                        </div>
                        </div>
                    </div>
                </aside>

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

                    <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 md:p-12 lg:p-24 flex flex-col items-center gap-8 sm:gap-12 md:gap-24 custom-scrollbar relative pb-24 lg:pb-12">
                        {/* THE "DESK" TEXTURE */}
                        <div className="absolute inset-0 bg-[radial-gradient(#00000003_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

                        {pages.map((page, pIdx) => (
                             // SCALING WRAPPER forces layout size to match visual size
                             <div 
                                key={pIdx}
                                style={{ 
                                    width: 800 * scale, 
                                    height: (800 * 1.414) * scale,
                                    marginBottom: 20 // Extra gap
                                }}
                                className="relative shrink-0 transition-all duration-300 ease-out"
                             >
                                 <div 
                                    className={`handwritten-page-render absolute top-0 left-0 w-[800px] aspect-[1/1.414] ${pIdx === 0 ? 'paper-stack' : 'shadow-2xl'} overflow-hidden bg-white ring-1 ring-black/5 rounded-none origin-top-left`} 
                                    style={{ 
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'top left'
                                    }}
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
                                        <div 
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
                                        </div>
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
                                 </div>
                        </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* MOBILE BOTTOM SHEET PANEL - Completely Redesigned */}
            <div 
                className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-50 transition-transform duration-300 ease-out ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '85vh' }}
            >
                {/* Panel Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
                </div>
                
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-900 rounded-xl flex items-center justify-center">
                            <Settings2 size={14} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900 text-sm">Editor Controls</h3>
                            <p className="text-[10px] text-neutral-400">Customize your handwriting</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMobilePanelOpen(false)}
                        className="w-10 h-10 hover:bg-neutral-100 rounded-full transition-colors flex items-center justify-center"
                    >
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>
                
                {/* Tab Navigation - 4 Tabs */}
                <div className="flex border-b border-black/5 bg-neutral-50/50">
                    {[
                        { id: 'write' as const, label: 'Write', icon: FileText },
                        { id: 'design' as const, label: 'Design', icon: Type },
                        { id: 'paper' as const, label: 'Paper', icon: Ruler },
                        { id: 'effects' as const, label: 'Effects', icon: Sparkles }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMobileTab(tab.id)}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                                activeMobileTab === tab.id 
                                    ? 'text-neutral-900 bg-white border-b-2 border-neutral-900' 
                                    : 'text-neutral-400'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Tab Content */}
                <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: 'calc(85vh - 200px)' }}>
                    
                    {/* WRITE TAB */}
                    {activeMobileTab === 'write' && (
                        <>
                            {/* Source Text */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Your Text</label>
                                <div className="relative">
                                    <textarea 
                                        value={text} 
                                        onChange={(e) => setText(normalizeInput(e.target.value))} 
                                        className="w-full h-36 p-4 bg-neutral-50 border border-black/5 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all shadow-sm"
                                        placeholder="Start writing your masterpiece..."
                                    />
                                </div>
                            </div>
                            
                            {/* AI Humanizer Button */}
                            <button 
                                onClick={handleHumanize}
                                disabled={isHumanizing || !text.trim()}
                                className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-neutral-900/20 active:scale-[0.98] transition-all"
                            >
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Wand2 size={16} className={isHumanizing ? 'animate-spin' : ''} />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1.5">
                                        {isHumanizing ? 'Humanizing...' : 'AI Humanize'}
                                        <Sparkles size={10} className="text-amber-400" />
                                    </div>
                                    <div className="text-[10px] text-white/60 font-normal">One-click organic rewriting</div>
                                </div>
                            </button>
                            
                            {/* Header Section */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={showHeader} 
                                        onChange={e => setPageOptions({ showHeader: e.target.checked })} 
                                        className="w-5 h-5 rounded-lg border-black/10 text-neutral-900 focus:ring-0"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-neutral-900">Enable Heading</span>
                                        <p className="text-[10px] text-neutral-400">Add a title to your document</p>
                                    </div>
                                </label>
                                
                                {showHeader && (
                                    <textarea 
                                        value={headerText} 
                                        onChange={(e) => setPageOptions({ headerText: e.target.value })}
                                        className="w-full h-20 p-4 bg-white border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none shadow-sm transition-all"
                                        placeholder="Type your heading..."
                                    />
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* DESIGN TAB */}
                    {activeMobileTab === 'design' && (
                        <>
                            {/* Font Selection */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Handwriting Style</label>
                                <select 
                                    value={font} 
                                    onChange={e => setFont(e.target.value)}
                                    className="w-full p-4 bg-white border border-black/5 rounded-2xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                                </select>
                            </div>
                            
                            {/* Font Size */}
                            <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex justify-between">
                                    Font Size <span className="text-neutral-900">{fontSize}px</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="14" 
                                    max="64" 
                                    value={fontSize} 
                                    onChange={e => setFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-neutral-100 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                                />
                            </div>
                            
                            {/* Line Nudge (Baseline) */}
                            <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex justify-between">
                                    Line Nudge <span className="text-neutral-900">{baseline}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="-10" 
                                    max="30" 
                                    value={baseline} 
                                    onChange={e => setBaseline(Number(e.target.value))}
                                    className="w-full h-2 bg-neutral-100 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                                />
                            </div>
                            
                            {/* Ink Color */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Ink Color</label>
                                <div className="flex gap-3 bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                    {COLORS.map(c => (
                                        <button 
                                            key={c.name} 
                                            onClick={() => setColor(c.value)}
                                            className={`w-10 h-10 rounded-xl border-2 transition-all shadow-sm ${color === c.value ? 'border-neutral-900 scale-110 shadow-md' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Text Alignment */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Alignment</label>
                                <div className="flex bg-white border border-black/5 rounded-2xl p-1.5 shadow-sm">
                                    {[
                                        { id: 'left' as const, icon: AlignLeft },
                                        { id: 'center' as const, icon: AlignCenter },
                                        { id: 'right' as const, icon: AlignRight },
                                        { id: 'justify' as const, icon: AlignJustify }
                                    ].map(opt => (
                                        <button 
                                            key={opt.id} 
                                            onClick={() => setTextAlign(opt.id)}
                                            className={`flex-1 p-3 flex justify-center rounded-xl transition-all ${textAlign === opt.id ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-400'}`}
                                        >
                                            <opt.icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* PAPER TAB */}
                    {activeMobileTab === 'paper' && (
                        <>
                            {/* Paper Type */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Paper Style</label>
                                <div className="flex bg-white border border-black/5 rounded-2xl p-1.5 shadow-sm">
                                    {PAPERS.map(p => (
                                        <button 
                                            key={p.id} 
                                            onClick={() => setPaper(p)}
                                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${paper.id === p.id ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-400'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Page Numbers */}
                            <label className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                                <input 
                                    type="checkbox" 
                                    checked={showPageNumbers} 
                                    onChange={e => setPageOptions({ showPageNumbers: e.target.checked })} 
                                    className="w-5 h-5 rounded-lg border-black/10 text-neutral-900 focus:ring-0"
                                />
                                <div>
                                    <span className="text-sm font-bold text-neutral-900">Show Page Numbers</span>
                                    <p className="text-[10px] text-neutral-400">Display page count at bottom</p>
                                </div>
                            </label>
                            
                            {/* Paper Preview Visual */}
                            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 text-center">Preview</div>
                                <div 
                                    className={`w-full aspect-[1/1.414] bg-white rounded-lg shadow-lg border border-black/5 relative overflow-hidden ${paper.css}`}
                                    style={paper.style}
                                >
                                    {paper.id !== 'plain' && <div className="absolute top-0 bottom-0 left-[12%] w-px bg-red-300 opacity-30"/>}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-neutral-300 text-xs font-medium">{paper.name}</span>
                                    </div>
                                    {showPageNumbers && (
                                        <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-neutral-300">Page 1 of 1</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* EFFECTS TAB */}
                    {activeMobileTab === 'effects' && (
                        <>
                            {/* Re-Randomize */}
                            <button 
                                onClick={() => setRandomSeed(prev => prev + 1)}
                                className="w-full py-4 bg-white border border-black/5 text-neutral-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <RefreshCw size={18} className="text-neutral-400" />
                                Re-Randomize Handwriting
                            </button>
                            
                            {/* Jitter */}
                            <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex justify-between">
                                    Jitter <span className="text-neutral-900">{jitter}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="6" 
                                    step="0.5"
                                    value={jitter} 
                                    onChange={e => setJitter(Number(e.target.value))}
                                    className="w-full h-2 bg-neutral-100 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                                />
                            </div>
                            
                            {/* Pressure */}
                            <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex justify-between">
                                    Pressure <span className="text-neutral-900">{Math.round(pressure * 100)}%</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1"
                                    value={pressure} 
                                    onChange={e => setPressure(Number(e.target.value))}
                                    className="w-full h-2 bg-neutral-100 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                                />
                            </div>
                            
                            {/* Smudge */}
                            <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex justify-between">
                                    Smudge <span className="text-neutral-900">{smudge}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="2" 
                                    step="0.1"
                                    value={smudge} 
                                    onChange={e => setSmudge(Number(e.target.value))}
                                    className="w-full h-2 bg-neutral-100 rounded-full appearance-none accent-neutral-900 cursor-pointer"
                                />
                            </div>
                            
                            <div className="h-px bg-black/5" />
                            
                            {/* Margin Note */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 block">Margin Note</label>
                                <input 
                                    type="text" 
                                    value={marginNote} 
                                    onChange={(e) => setMarginNote(e.target.value)}
                                    className="w-full p-4 bg-white border border-black/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                                    placeholder="Add a margin annotation..."
                                />
                            </div>
                            
                            {/* Coffee Stain */}
                            <label className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                                <input 
                                    type="checkbox" 
                                    checked={showCoffeeStain} 
                                    onChange={(e) => setShowCoffeeStain(e.target.checked)} 
                                    className="w-5 h-5 rounded-lg border-black/10 text-neutral-900 focus:ring-0"
                                />
                                <div>
                                    <span className="text-sm font-bold text-neutral-900">Coffee Stain</span>
                                    <p className="text-[10px] text-neutral-400">Add realistic coffee ring effect</p>
                                </div>
                            </label>
                            
                            {/* Sticky Note */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-4 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                                    <input 
                                        type="checkbox" 
                                        checked={showStickyNote} 
                                        onChange={(e) => setShowStickyNote(e.target.checked)} 
                                        className="w-5 h-5 rounded-lg border-black/10 text-neutral-900 focus:ring-0"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-neutral-900">Sticky Note</span>
                                        <p className="text-[10px] text-neutral-400">Add a post-it note overlay</p>
                                    </div>
                                </label>
                                
                                {showStickyNote && (
                                    <textarea 
                                        value={stickyNoteText} 
                                        onChange={(e) => setStickyNoteText(e.target.value)}
                                        className="w-full h-20 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm focus:outline-none resize-none shadow-sm transition-all"
                                        placeholder="Note text..."
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
                
            {/* Export Buttons - Fixed at Bottom */}
            <div className="p-4 border-t border-black/5 bg-white flex gap-3">
                <button 
                    onClick={() => { setIsMobilePanelOpen(false); handleStartExport('pdf'); }}
                    disabled={exportStatus === 'processing'}
                    className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/20 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                    <Download size={18} />
                    Export PDF
                </button>
                <button 
                    onClick={() => { setIsMobilePanelOpen(false); handleStartExport('zip'); }}
                    disabled={exportStatus === 'processing'}
                    className="py-4 px-5 bg-neutral-100 text-neutral-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                    <Sparkles size={16} />
                    ZIP
                </button>
            </div>
        </div>

        <ExportModal 
            key={isExportModalOpen ? 'open' : 'closed'}
            isOpen={isExportModalOpen}
            onClose={() => {
                setIsExportModalOpen(false);
                if (exportStatus !== 'processing') setExportStatus('idle');
            }}
            onStart={(name) => executeExport(name, exportFormat)}
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