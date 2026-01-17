import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useStore } from '../lib/store';

interface HandwritingCanvasProps {
    text: string;
    onRenderComplete?: (totalPages: number) => void;
    currentPage: number;
}

const PAPER_CONFIG = {
    width: 210, // mm
    height: 297, // mm
    margins: {
        top: 120,    // px at 300 DPI
        bottom: 100, // px at 300 DPI
        left: 100,   // px at 300 DPI
        right: 100   // px at 300 DPI
    },
    ppi: 300,
    lineSpacing: 40 // px
};

// Convert mm to pixels at 300 PPI (approx 2480x3508 for A4)
const mmToPx = (mm: number) => Math.round((mm * PAPER_CONFIG.ppi) / 25.4);

interface Token {
    type: 'tag' | 'text';
    tagName?: string;
    isClosing?: boolean;
    attributes?: { src?: string };
    content?: string;
}

const tokenizeHTML = (html: string): Token[] => {
    const tokens: Token[] = [];
    const cleanHtml = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
        
    const regex = /(<[^>]+>|[^<]+)/g;
    let match;
    while ((match = regex.exec(cleanHtml)) !== null) {
        const part = match[0];
        if (part.startsWith('<')) {
            const lower = part.toLowerCase();
            const isClosing = lower.startsWith('</');
            const tagName = lower.replace(/[<>/]/g, '').split(' ')[0];
            
            const attributes: { src?: string } = {};
            if (tagName === 'img') {
                const srcMatch = part.match(/src="([^"]+)"/i);
                if (srcMatch) attributes.src = srcMatch[1];
            }
            
            tokens.push({ type: 'tag', tagName, isClosing, attributes });
        } else {
            const words = part.split(/(\s+)/);
            words.forEach(word => {
                if (word) tokens.push({ type: 'text', content: word });
            });
        }
    }
    return tokens;
};

export const HandwritingCanvas = forwardRef<HTMLCanvasElement, HandwritingCanvasProps>(({ 
    text,
    onRenderComplete,
    currentPage
}, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    
    useImperativeHandle(ref, () => internalCanvasRef.current!);
    const { 
        handwritingStyle, 
        fontSize, 
        letterSpacing, 
        wordSpacing,
        inkColor,
        paperMaterial,
        customPaperImage,
        paperShadow,
        paperTexture
    } = useStore();

    const [totalPages, setTotalPages] = useState(1);

    // Calculate canvas dimensions using 300 DPI as base
    const baseWidth = mmToPx(PAPER_CONFIG.width);
    const baseHeight = mmToPx(PAPER_CONFIG.height);
    
    // For display, we use a smaller size or fit to container
    const displayWidth = (PAPER_CONFIG.width * 96) / 25.4;
    const displayHeight = (PAPER_CONFIG.height * 96) / 25.4;

    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) * 2 : 2;

    // Font family mapping
    const fontFamilies: Record<string, string> = {
        'caveat': 'Caveat',
        'gloria': 'Gloria Hallelujah',
        'indie': 'Indie Flower',
        'shadows': 'Shadows Into Light',
        'patrick': 'Patrick Hand',
        'marker': 'Permanent Marker',
        'kalam': 'Kalam'
    };

    const currentFontFamily = fontFamilies[handwritingStyle] || 'Caveat';

    useEffect(() => {
        const render = async () => {
            const canvas = internalCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) return;

            // Set high resolution pixel dimensions
            canvas.width = baseWidth * dpr;
            canvas.height = baseHeight * dpr;
            
            // Set CSS display size
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
            
            ctx.scale(dpr, dpr);

            // 1. Draw Paper Background
            const isVintage = paperMaterial === 'vintage';
            const isCream = (paperMaterial as string) === 'cream';
            
            ctx.fillStyle = isVintage ? '#f5f0e1' : isCream ? '#fffaf0' : '#ffffff';
            ctx.fillRect(0, 0, baseWidth, baseHeight);

            // Aging effect for vintage paper
            if (isVintage) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 230, 150, 0.05)';
                ctx.fillRect(0, 0, baseWidth, baseHeight);
                ctx.restore();
            }

            // Custom Background
            if (paperMaterial === 'custom' && customPaperImage) {
                const img = new Image();
                img.src = customPaperImage;
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
                        resolve(null);
                    };
                });
            } 
            
            // Ruled Lines System
            if (paperMaterial === 'ruled' || paperMaterial === 'white' || isVintage || isCream) {
                if (paperMaterial === 'ruled') {
                    ctx.strokeStyle = '#d0d0d0';
                    ctx.lineWidth = 1;
                    
                    for (let y = PAPER_CONFIG.margins.top; y < baseHeight - PAPER_CONFIG.margins.bottom; y += PAPER_CONFIG.lineSpacing) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(baseWidth, y);
                        ctx.stroke();
                    }
                    
                    ctx.strokeStyle = '#ffb3ba';
                    ctx.beginPath();
                    ctx.moveTo(PAPER_CONFIG.margins.left - 5, 0);
                    ctx.lineTo(PAPER_CONFIG.margins.left - 5, baseHeight);
                    ctx.stroke();
                }
            } else if (paperMaterial === 'graph') {
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                const step = 40;
                for (let x = 0; x < baseWidth; x += step) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, baseHeight); ctx.stroke();
                }
                for (let y = 0; y < baseHeight; y += step) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(baseWidth, y); ctx.stroke();
                }
            } else if (paperMaterial === 'dotted') {
                ctx.fillStyle = '#c0c0c0';
                const step = 30;
                for (let x = step; x < baseWidth; x += step) {
                    for (let y = step; y < baseHeight; y += step) {
                        ctx.beginPath();
                        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            if (!text.trim()) {
                const cx = baseWidth / 2;
                const cy = baseHeight / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#f0f0f0';
                ctx.font = `bold 60px ${currentFontFamily}`;
                ctx.fillText('InkPad', cx, cy - 40);
                ctx.fillStyle = '#a0a0a0';
                ctx.font = `italic 16px sans-serif`;
                ctx.fillText('Start typing in the editor...', cx, cy + 20);
                ctx.restore();
                if (onRenderComplete) onRenderComplete(1);
                return;
            }

            // Global document imperfections
            const globalSlant = (Math.random() - 0.5) * 0.08; // ±4.5 deg
            const driftAmplitude = 2.5;
            const driftWavelength = 700;

            const adjustBrightness = (hex: string, factor: number) => {
                const r = parseInt(hex.slice(1, 3), 16) || 0;
                const g = parseInt(hex.slice(3, 5), 16) || 0;
                const b = parseInt(hex.slice(5, 7), 16) || 0;
                const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
                const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
                const nb = Math.min(255, Math.max(0, Math.round(b * factor)));
                return `rgb(${nr}, ${ng}, ${nb})`;
            };

            // 2. Render Tokens
            const tokens = tokenizeHTML(text);
            const leftMargin = PAPER_CONFIG.margins.left;
            const rightMargin = baseWidth - PAPER_CONFIG.margins.right;
            const topMargin = PAPER_CONFIG.margins.top;
            const bottomMargin = baseHeight - PAPER_CONFIG.margins.bottom;
            const lineSpacing = PAPER_CONFIG.lineSpacing;

            const renderPass = async (isMeasuring: boolean) => {
                let currentLineY = topMargin;
                let currentX = leftMargin;
                let pageNum = 1;

                let bold = false;
                let italic = false;
                let baseFSize = fontSize * (PAPER_CONFIG.ppi / 96);
                
                ctx.textBaseline = 'alphabetic';

                const setCtxFont = (sizeVariation = 0) => {
                    const finalSize = baseFSize + sizeVariation;
                    ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${finalSize}px "${currentFontFamily}"`;
                };

                const usableWidth = rightMargin - leftMargin;

                for (const token of tokens) {
                    if (token.type === 'tag') {
                        const tag = token.tagName;
                        if (tag === 'b' || tag === 'strong') bold = !token.isClosing;
                        else if (tag === 'i' || tag === 'em') italic = !token.isClosing;
                        else if (tag === 'h1') baseFSize = (token.isClosing ? fontSize : 28) * (PAPER_CONFIG.ppi / 96);
                        else if (tag === 'h2') baseFSize = (token.isClosing ? fontSize : 24) * (PAPER_CONFIG.ppi / 96);
                        else if (tag === 'h3') baseFSize = (token.isClosing ? fontSize : 20) * (PAPER_CONFIG.ppi / 96);
                        else if (tag === 'br' || tag === 'div' || tag === 'p') {
                            if (!token.isClosing || tag === 'br') {
                                currentLineY += lineSpacing;
                                currentX = leftMargin;
                                if (currentLineY > bottomMargin) {
                                    pageNum++;
                                    currentLineY = topMargin;
                                }
                            }
                        } else if (tag === 'img' && token.attributes?.src) {
                            const img = new Image();
                            img.src = token.attributes.src;
                            await new Promise(r => img.onload = r);
                            const iW = Math.min(img.width, usableWidth);
                            const iH = (img.height * iW) / img.width;
                            if (currentLineY + iH > bottomMargin) {
                                pageNum++;
                                currentX = leftMargin;
                                currentLineY = topMargin;
                            }
                            if (!isMeasuring && pageNum === currentPage) {
                                ctx.drawImage(img, currentX, currentLineY, iW, iH);
                            }
                            currentLineY += iH + lineSpacing;
                            currentX = leftMargin;
                        }
                    } else if (token.type === 'text' && token.content) {
                        setCtxFont();
                        const words = token.content.split(/(\s+)/);
                        
                        for (let w = 0; w < words.length; w++) {
                            const word = words[w];
                            if (!word) continue;
                            const isSpace = /\s+/.test(word);
                            
                            if (isSpace) {
                                const spaceVariation = (Math.random() - 0.5) * 8; 
                                currentX += ctx.measureText(word).width + wordSpacing + spaceVariation;
                                continue;
                            }

                            setCtxFont();
                            const wordWidth = ctx.measureText(word).width + (word.length * letterSpacing);
                            
                            // 1. Wrapping Logic
                            if (currentX + wordWidth > rightMargin) {
                                // If word is so long it can't fit on ANY line, hyphenate it
                                if (wordWidth > usableWidth) {
                                    const chars = word.split('');
                                    for (const char of chars) {
                                        const charWidth = ctx.measureText(char).width + letterSpacing;
                                        if (currentX + charWidth + 20 > rightMargin) { 
                                            if (!isMeasuring && pageNum === currentPage) {
                                                ctx.save();
                                                ctx.fillStyle = inkColor;
                                                ctx.fillText('-', currentX, currentLineY);
                                                ctx.restore();
                                            }
                                            currentLineY += lineSpacing;
                                            currentX = leftMargin;
                                            if (currentLineY > bottomMargin) { pageNum++; currentLineY = topMargin; }
                                        }
                                        if (!isMeasuring && pageNum === currentPage) {
                                            const w = drawCharWithEffects(char, currentX, currentLineY, baseFSize, bold, italic);
                                            currentX += w;
                                        } else {
                                            currentX += charWidth;
                                        }
                                    }
                                    continue; 
                                } else {
                                    currentLineY += lineSpacing;
                                    currentX = leftMargin;
                                    if (currentLineY > bottomMargin) { pageNum++; currentLineY = topMargin; }
                                }
                            }

                            // 2. Draw Word
                            if (!isMeasuring && pageNum === currentPage) {
                                for (let i = 0; i < word.length; i++) {
                                    const w = drawCharWithEffects(word[i], currentX, currentLineY, baseFSize, bold, italic);
                                    currentX += w;
                                }
                            } else {
                                currentX += wordWidth;
                            }
                        }
                    }
                }
                return pageNum;
            };

            const drawCharWithEffects = (char: string, x: number, lineY: number, bFSize: number, isBold: boolean, isItalic: boolean) => {
                // 1. Baseline Drift
                const driftY = driftAmplitude * Math.sin(x / driftWavelength);
                const targetY = lineY + driftY;

                // 2. Random Variations
                const jitterX = (Math.random() - 0.5) * 2;
                const jitterY = (Math.random() - 0.5) * 4;
                const charSlant = (Math.random() - 0.5) * 0.02; // ±1 deg
                const rotation = globalSlant + charSlant;
                
                // Pressure simulation
                const scaleVariation = 0.95 + Math.random() * 0.1; // ±5%
                const alpha = 0.85 + Math.random() * 0.15;
                const inkWetness = 0.3 + Math.random() * 0.5; // 0.3-0.8 shadowBlur

                // 3. Ink Color Variation
                let charColor = inkColor;
                if (Math.random() > 0.9) {
                    const shift = 0.85 + Math.random() * 0.15;
                    charColor = adjustBrightness(inkColor, shift);
                }

                ctx.save();
                
                // 4. Soft Edges (Bleeding)
                ctx.shadowBlur = inkWetness;
                ctx.shadowColor = charColor;
                
                const finalSize = bFSize * scaleVariation;
                ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${finalSize}px "${currentFontFamily}"`;
                
                ctx.translate(x + jitterX, targetY + jitterY);
                ctx.rotate(rotation);

                // 5. Ink Texture (Gradient)
                const gradient = ctx.createLinearGradient(0, -finalSize, 0, 0);
                gradient.addColorStop(0, charColor);
                gradient.addColorStop(1, adjustBrightness(inkColor, 0.9));
                ctx.fillStyle = gradient;

                // 6. Dual layer for depth
                ctx.globalAlpha = alpha * 0.4;
                ctx.fillText(char, 0.3, 0.3);
                ctx.globalAlpha = alpha;
                ctx.fillText(char, 0, 0);

                ctx.restore();

                // 7. Ink Dots Near Baseline
                if (Math.random() < 0.05) {
                    ctx.save();
                    ctx.fillStyle = charColor;
                    ctx.globalAlpha = 0.3;
                    const dx = x + Math.random() * 10 - 5;
                    const dy = targetY + Math.random() * 4 - 2;
                    ctx.beginPath();
                    ctx.arc(dx, dy, 0.5 + Math.random(), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                
                const letterVariation = (Math.random() - 0.5) * 4 - 2;
                return ctx.measureText(char).width + letterSpacing + letterVariation;
            };

            const totalP = await renderPass(true);
            if (totalP !== totalPages) {
                setTotalPages(totalP);
                onRenderComplete?.(totalP);
            }

            await renderPass(false);

            // 3. Draw Texture Overlay
            if (paperTexture) {
                const grainCanvas = document.createElement('canvas');
                grainCanvas.width = 128;
                grainCanvas.height = 128;
                const grainCtx = grainCanvas.getContext('2d')!;
                const grainData = grainCtx.createImageData(128, 128);
                
                for (let i = 0; i < grainData.data.length; i += 4) {
                    const val = 150 + Math.random() * 105;
                    grainData.data[i] = val;     
                    grainData.data[i + 1] = val; 
                    grainData.data[i + 2] = val; 
                    grainData.data[i + 3] = isVintage ? 45 : 35;  
                }
                grainCtx.putImageData(grainData, 0, 0);
                
                ctx.save();
                ctx.globalCompositeOperation = 'multiply';
                const pattern = ctx.createPattern(grainCanvas, 'repeat')!;
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, baseWidth, baseHeight);
                ctx.restore();
            }

            // 4. Subtle Page Edge Shadow
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, baseWidth - 2, baseHeight - 2);
            ctx.restore();
        };

        render();
    }, [text, handwritingStyle, fontSize, letterSpacing, wordSpacing, inkColor, paperMaterial, customPaperImage, currentPage, baseWidth, baseHeight, dpr, currentFontFamily, totalPages, onRenderComplete, paperTexture, displayWidth, displayHeight]);

    return (
        <div className="relative transition-all duration-500 ease-in-out">
            <div 
                className={`transform-gpu transition-all duration-500 ${paperShadow ? 'shadow-2xl' : ''}`}
                style={{
                    width: displayWidth,
                    height: displayHeight,
                    backgroundColor: paperMaterial === 'vintage' ? '#f5f0e1' : 
                                   (paperMaterial as string) === 'cream' ? '#fffaf0' : '#ffffff'
                }}
            >
                <canvas
                    ref={internalCanvasRef}
                    className="w-full h-full rounded-sm"
                />
            </div>
            
            {/* Pagination Indicator */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center items-center gap-4 text-sm text-gray-400 font-medium">
                <span>Page {currentPage} of {totalPages}</span>
            </div>
        </div>
    );
});

HandwritingCanvas.displayName = 'HandwritingCanvas';
