import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { getFontFamily, renderHandwriting } from '../utils/handwriting';
import { Move } from 'lucide-react';

export default function CanvasRenderer({ overridePreset, overrideShowLines }: { overridePreset?: string, overrideShowLines?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const {
        text,
        previousText,
        handwritingStyle,
        fontSize,
        inkColor,
        paperMaterial,
        paperPattern,
        paperSize,
        paperOrientation,
        customFonts,
        settings,
        zoom,
        rotation,
        showGrid,
        compareMode,
        pan,
        setPan,
        pagePreset,
        customBackground,
        showPaperLines,
        showMarginLine,
        outputEffect,
    } = useStore();

    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const getDimensions = () => {
        let width = 595;  // A4 at 72 DPI
        let height = 842;

        switch (paperSize) {
            case 'letter': width = 612; height = 792; break;
            case 'a5': width = 420; height = 595; break;
            case 'a6': width = 298; height = 420; break;
            case 'legal': width = 612; height = 1008; break;
            case 'tabloid': width = 792; height = 1224; break;
            case 'a4':
            default: width = 595; height = 842; break;
        }

        if (paperOrientation === 'landscape') {
            return { width: height, height: width };
        }
        return { width, height };
    };

    const dimensions = getDimensions();
    const baseWidth = dimensions.width;
    const baseHeight = dimensions.height;

    const render = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const effectiveWidth = compareMode ? baseWidth * 2 + 80 : baseWidth;

        canvas.width = effectiveWidth * dpr;
        canvas.height = baseHeight * dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);

        const currentPreset = overridePreset || pagePreset;
        const currentShowLines = overrideShowLines !== undefined ? overrideShowLines : showPaperLines;

        const drawBg = async (offsetX: number = 0) => {
            if (currentPreset === 'custom' && customBackground) {
                const img = new Image();
                img.src = customBackground;
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, offsetX, 0, baseWidth, baseHeight);
                        resolve(null);
                    };
                    img.onerror = () => resolve(null);
                });
            } else if (currentPreset && currentPreset !== 'custom') {
                const img = new Image();
                img.src = `/page_presets/${currentPreset}.jpg`;
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, offsetX, 0, baseWidth, baseHeight);
                        resolve(null);
                    };
                    img.onerror = () => resolve(null);
                });
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(offsetX, 0, baseWidth, baseHeight);
            }
        };

        if (compareMode) {
            await drawBg(0);
            await drawBg(baseWidth + 80);

            // Render Previous
            ctx.save();
            renderHandwriting(canvas, previousText || "No previous state captured.", getFontFamily(handwritingStyle, customFonts), fontSize, inkColor, settings, paperMaterial, paperPattern, {
                skipClear: true,
                regionWidth: baseWidth,
                regionHeight: baseHeight
            });

            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 20px Inter';
            ctx.fillText('HISTORICAL DRAFT', 60, baseHeight - 60);
            ctx.restore();

            // Divider
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(baseWidth, 0, 80, baseHeight);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(baseWidth + 40, 0);
            ctx.lineTo(baseWidth + 40, baseHeight);
            ctx.stroke();

            // Render Current
            ctx.save();
            ctx.translate(baseWidth + 80, 0);
            renderHandwriting(canvas, text, getFontFamily(handwritingStyle, customFonts), fontSize, inkColor, settings, paperMaterial, paperPattern, {
                skipClear: true,
                regionWidth: baseWidth,
                regionHeight: baseHeight
            });

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 20px Inter';
            ctx.fillText('LIVE SYNTHESIS', 60, baseHeight - 60);
            ctx.restore();
        } else {
            await drawBg(0);
            renderHandwriting(canvas, text, getFontFamily(handwritingStyle, customFonts), fontSize, inkColor, settings, paperMaterial, paperPattern, {
                skipClear: true,
                regionWidth: baseWidth,
                regionHeight: baseHeight
            });

            if (currentShowLines) {
                // Overlay lines if necessary - renderHandwriting currently draws them if pattern is set
                // But for presets, we might want manual control. 
                // Currently renderHandwriting handles paperPattern.
            }

            if (showMarginLine) {
                const marginX = settings.margins.left * 0.5 - 4;
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(marginX, 0);
                ctx.lineTo(marginX, baseHeight);
                ctx.stroke();
            }
        }

        if (showGrid) {
            ctx.save();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 0.5;
            const step = 40;
            ctx.beginPath();
            for (let x = 0; x <= effectiveWidth; x += step) {
                ctx.moveTo(x, 0); ctx.lineTo(x, baseHeight);
            }
            for (let y = 0; y <= baseHeight; y += step) {
                ctx.moveTo(0, y); ctx.lineTo(effectiveWidth, y);
            }
            ctx.stroke();
            ctx.restore();
        }
    };

    useEffect(() => {
        const timer = setTimeout(render, 50);
        return () => clearTimeout(timer);
    }, [text, previousText, handwritingStyle, fontSize, inkColor, paperMaterial, paperPattern, paperSize, paperOrientation, settings, customFonts, showGrid, compareMode, pagePreset, customBackground, showPaperLines, showMarginLine, outputEffect, zoom, pan, overridePreset, overrideShowLines]);

    useEffect(() => {
        const handleEditorScroll = (e: any) => {
            if (scrollContainerRef.current) {
                const scrollPercent = e.detail;
                const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
                scrollContainerRef.current.scrollTo({
                    top: maxScroll * scrollPercent,
                    behavior: 'auto'
                });
            }
        };

        window.addEventListener('editor-scroll', handleEditorScroll);
        return () => window.removeEventListener('editor-scroll', handleEditorScroll);
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && e.altKey) {
            setIsPanning(true);
            setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    };

    const onMouseUp = () => setIsPanning(false);

    const effectiveWidth = compareMode ? baseWidth * 2 + 80 : baseWidth;

    return (
        <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-auto custom-scrollbar bg-gray-100/30 selection:bg-transparent"
        >
            <div className="min-h-full min-w-full flex items-center justify-center p-24">
                <div
                    ref={containerRef}
                    className="relative cursor-grab active:cursor-grabbing shrink-0"
                    style={{
                        width: `${effectiveWidth * zoom}px`,
                        height: `${baseHeight * zoom}px`,
                        transform: `rotate(${rotation}deg) translate(${pan.x}px, ${pan.y}px)`,
                        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] bg-white"
                    />
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-20">
                <div className="bg-white border border-gray-100 px-4 py-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-3 shadow-premium">
                    <Move size={12} className="text-gray-400" />
                    <span className="text-gray-400">Alt + Drag to Pan</span>
                </div>
            </div>
        </div>
    );
}
