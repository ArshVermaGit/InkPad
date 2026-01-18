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

            // 1. SETUP CANVAS
            // Use window.devicePixelRatio * 2 for ultra-sharp rendering
            const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) * 2 : 2;
            
            // Set high resolution pixel dimensions (A4 @ 300 DPI)
            canvas.width = baseWidth * dpr;
            canvas.height = baseHeight * dpr;
            
            // Set CSS display size
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
            
            // Normalize coordinate system to 300 DPI equivalent
            // scale = dpr allows us to draw using baseWidth/baseHeight coordinates
            ctx.scale(dpr, dpr);

            // 2. RENDER PAPER BACKGROUND
            const isVintage = paperMaterial === 'vintage';
            const isCream = (paperMaterial as string) === 'cream';
            
            // Base fill
            ctx.fillStyle = isVintage ? '#f5f0e1' : isCream ? '#fffaf0' : '#ffffff';
            ctx.fillRect(0, 0, baseWidth, baseHeight);

            // Vintage aging
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

            // 3. RULED LINES SYSTEM (Draw BEFORE text)
            const marginL = PAPER_CONFIG.margins.left;
            const marginR = PAPER_CONFIG.margins.right;
            const marginT = PAPER_CONFIG.margins.top;
            const marginB = PAPER_CONFIG.margins.bottom;
            const lineH = PAPER_CONFIG.lineSpacing;

            if (paperMaterial === 'ruled' || paperMaterial === 'white' || isVintage || isCream) {
                if (paperMaterial === 'ruled') {
                    ctx.save();
                    
                    // Horizontal Lines
                    ctx.strokeStyle = '#d0d0d0'; // Light gray
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    
                    // Draw lines from margin top to bottom
                    // We interpret these lines as the BASELINES where text sits
                    for (let y = marginT; y < baseHeight - marginB; y += lineH) {
                        ctx.moveTo(0, y);
                        ctx.lineTo(baseWidth, y);
                    }
                    ctx.stroke();
                    
                    // Vertical Margin Line
                    ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)'; // Faint red/pink
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(marginL, 0); 
                    ctx.lineTo(marginL, baseHeight);
                    ctx.stroke();
                    
                    ctx.restore();
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
                for (let x = 30; x < baseWidth; x += step) {
                    for (let y = 30; y < baseHeight; y += step) {
                        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }

            // 4. REALISTIC PAPER NOISE
            // Add subtle noise for valid paper types
            const needsTexture = paperMaterial === 'white' || paperMaterial === 'ruled' || isVintage || isCream;
            if (needsTexture) {
                const noseCanvas = document.createElement('canvas');
                // Create a small tileable noise pattern
                const noiseSize = 128;
                noseCanvas.width = noiseSize;
                noseCanvas.height = noiseSize;
                const nCtx = noseCanvas.getContext('2d')!;
                const imgData = nCtx.createImageData(noiseSize, noiseSize);
                const data = imgData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    const v = Math.random() * 20; // subtly varying random value
                    // We want a very transparent dark/light noise
                    const brightness = 255; 
                    data[i] = brightness - v;     // R
                    data[i+1] = brightness - v;   // G
                    data[i+2] = brightness - v;   // B
                    data[i+3] = 12; // Very low alpha (~5%)
                }
                nCtx.putImageData(imgData, 0, 0);

                ctx.save();
                ctx.fillStyle = ctx.createPattern(noseCanvas, 'repeat')!;
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillRect(0, 0, baseWidth, baseHeight);
                ctx.restore();
            }

            if (!text.trim()) {
                const cx = baseWidth / 2;
                const cy = baseHeight / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.font = `bold 60px ${currentFontFamily}`;
                ctx.fillText('InkPad', cx, cy - 40);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.font = `italic 16px sans-serif`;
                ctx.fillText('Start typing in the editor...', cx, cy + 20);
                ctx.restore();
                if (onRenderComplete) onRenderComplete(1);
                return;
            }

            /* --- TEXT RENDERING ENGINE --- */
            
            // Helper: Color Adjustment
            const adjustBrightness = (hex: string, factor: number) => {
                const r = parseInt(hex.slice(1, 3), 16) || 0;
                const g = parseInt(hex.slice(3, 5), 16) || 0;
                const b = parseInt(hex.slice(5, 7), 16) || 0;
                const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
                const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
                const nb = Math.min(255, Math.max(0, Math.round(b * factor)));
                return `rgb(${nr}, ${ng}, ${nb})`;
            };

            // Global imperfections for this "session"
            // Slant: ±5 degrees global, consistent for doc
            const globalSlant = (Math.random() - 0.5) * 0.09; 
            // Drift: Sinusoidal wave, amp 2-3px, wave 500-800px
            const driftAmplitude = 2 + Math.random(); 
            const driftWavelength = 500 + Math.random() * 300;
            
            // Ink Color Base (for variations)
            // Function to mix colors for realism
            const getInkVariation = (baseColor: string) => {
               // 10% chance of distinct variation, otherwise slight noise
               if (Math.random() > 0.9) {
                   return adjustBrightness(baseColor, 0.85); // Darker
               }
               return adjustBrightness(baseColor, 0.95 + Math.random() * 0.1); // subtle
            };
            
            // Tokenize
            const tokens = tokenizeHTML(text);
            
            // Rendering State
            const renderPass = async (isMeasuring: boolean) => {
                // We start writing on the FIRST ruled line
                // marginT is the Y of the first ruled line
                let currentBaselineY = marginT; 
                let currentX = marginL;
                let pageNum = 1;

                let bold = false;
                let italic = false;
                // Base Font Size scaled to PPI
                // 1pt = 1/72 inch. 1px (web) is often treated as 1/96 inch.
                // At 300 PPI, 12pt font = 12/72 * 300 = 50px?
                // Lets basically scale the logical fontSize (px relative to 96dpi) to 300dpi
                const fontScale = PAPER_CONFIG.ppi / 96; 
                let baseFSize = fontSize * fontScale;

                ctx.textBaseline = 'alphabetic'; // Text sits ON the line

                const usableWidth = baseWidth - marginR - marginL;

                for (const token of tokens) {
                    if (token.type === 'tag') {
                        const tag = token.tagName;
                        if (tag === 'b' || tag === 'strong') bold = !token.isClosing;
                        else if (tag === 'i' || tag === 'em') italic = !token.isClosing;
                        else if (tag === 'h1') baseFSize = (token.isClosing ? fontSize : 28) * fontScale;
                        else if (tag === 'h2') baseFSize = (token.isClosing ? fontSize : 24) * fontScale;
                        else if (tag === 'h3') baseFSize = (token.isClosing ? fontSize : 20) * fontScale;
                        else if (tag === 'br' || tag === 'div' || tag === 'p') {
                            if (!token.isClosing || tag === 'br') {
                                // New Line = Move to NEXT ruled line
                                currentBaselineY += lineH;
                                currentX = marginL;
                                
                                // New Page
                                if (currentBaselineY > baseHeight - marginB) {
                                    pageNum++;
                                    currentBaselineY = marginT;
                                }
                            }
                        }
                         else if (tag === 'img' && token.attributes?.src) {
                            const img = new Image();
                            img.src = token.attributes.src;
                            await new Promise(r => img.onload = r);
                            
                            const iW = Math.min(img.width, usableWidth);
                            const iH = (img.height * iW) / img.width;
                            
                            // Align image bottom to a ruled line if possible
                            // But usually users want images inline or block.
                            // Let's treat as block for simplicity in handwriting context
                            
                            // Check fit
                            if (currentBaselineY + iH > baseHeight - marginB) {
                                pageNum++;
                                currentBaselineY = marginT;
                                currentX = marginL;
                            }
                            
                            if (!isMeasuring && pageNum === currentPage) {
                                // Draw image (offset slightly to not overprint line above)
                                ctx.drawImage(img, currentX, currentBaselineY, iW, iH);
                            }
                            
                            // Advance lines based on height
                            const linesConsumed = Math.ceil((iH + 20) / lineH);
                            currentBaselineY += linesConsumed * lineH;
                            currentX = marginL;
                        }
                    } else if (token.type === 'text' && token.content) {
                        const words = token.content.split(/(\s+)/);
                        
                        for (let w = 0; w < words.length; w++) {
                            const word = words[w];
                            if (!word) continue;
                            const isSpace = /\s+/.test(word);

                            // Setup Font for measuring
                            ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${baseFSize}px "${currentFontFamily}"`;

                            if (isSpace) {
                                // Natural Word Spacing: ±2-5px
                                const spaceVar = (Math.random() - 0.5) * 6; // ±3px average
                                const spaceW = ctx.measureText(' ').width + wordSpacing + spaceVar; 
                                currentX += spaceW;
                                continue;
                            }

                            const wordMetrics = ctx.measureText(word);
                            const wordWidth = wordMetrics.width + (word.length * letterSpacing);
                            
                            // 1. Wrapping Logic
                            if (currentX + wordWidth > baseWidth - marginR) {
                                // If word is so long it can't fit on ANY line, hyphenate it
                                if (wordWidth > usableWidth) {
                                    const chars = word.split('');
                                    for (const char of chars) {
                                        const charWidth = ctx.measureText(char).width + letterSpacing;
                                        if (currentX + charWidth + 20 > baseWidth - marginR) { 
                                            if (!isMeasuring && pageNum === currentPage) {
                                                ctx.save();
                                                ctx.fillStyle = inkColor;
                                                ctx.fillText('-', currentX, currentBaselineY);
                                                ctx.restore();
                                            }
                                            currentBaselineY += lineH;
                                            currentX = marginL;
                                            if (currentBaselineY > baseHeight - marginB) { pageNum++; currentBaselineY = marginT; }
                                        }
                                        if (!isMeasuring && pageNum === currentPage) {
                                            const w = drawCharWithEffects(char, currentX, currentBaselineY, baseFSize, bold, italic);
                                            currentX += w;
                                        } else {
                                            currentX += charWidth;
                                        }
                                    }
                                    continue; 
                                } else {
                                    currentBaselineY += lineH;
                                    currentX = marginL;
                                    if (currentBaselineY > baseHeight - marginB) { pageNum++; currentBaselineY = marginT; }
                                }
                            }

                            // 2. Draw Word
                            if (!isMeasuring && pageNum === currentPage) {
                                for (let i = 0; i < word.length; i++) {
                                    const w = drawCharWithEffects(word[i], currentX, currentBaselineY, baseFSize, bold, italic);
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

                // 2. CHARACTER-LEVEL RANDOMIZATION
                
                // A. POSITION VARIATIONS (Hand wobble)
                const yOffset = (Math.random() - 0.5) * 4; // ±2px
                const xOffset = (Math.random() - 0.5) * 2; // ±1px
                
                // Rotation: ±2 degrees (approx ±0.035 rad) + Global Slant
                // Adding per-character variation to the global slant
                const charRotVar = (Math.random() - 0.5) * 0.04; 
                const rotation = globalSlant + charRotVar;

                // B. SIZE VARIATIONS
                const sizeVar = 1 + (Math.random() - 0.5) * 0.1; // ±5%
                const finalSize = bFSize * sizeVar;

                // C. PRESSURE SIMULATION & INK EFFECTS
                const inkWetness = 0.3 + Math.random() * 0.5; // ShadowBlur 0.3-0.8
                
                // Specific Ink Color for this char (Simulate mixing)
                const charInk = getInkVariation(inkColor);
                
                ctx.save();
                
                // Apply Transformations
                ctx.translate(x + xOffset, targetY + yOffset);
                ctx.rotate(rotation);

                // Setup Font
                ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${finalSize}px "${currentFontFamily}"`;
                
                // Ink Bleeding (Soft Edges)
                ctx.shadowBlur = inkWetness;
                ctx.shadowColor = charInk;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Gradient Fill for Texture
                // Top to bottom gradient to simulate pooling at the bottom
                // We drag the gradient coordinates based on the char height
                const gradient = ctx.createLinearGradient(0, -finalSize/2, 0, finalSize/3);
                gradient.addColorStop(0, charInk); // Start with slightly lighter/normal
                gradient.addColorStop(1, adjustBrightness(charInk, 0.85)); // End slightly darker (pooled)
                ctx.fillStyle = gradient;

                // Draw Text
                // 1. First pass (Base)
                ctx.globalAlpha = 0.95; 
                ctx.fillText(char, 0, 0);

                ctx.restore();

                // 3. Artifacts: Ink Dots / Splatter
                // 5% chance per character
                if (Math.random() < 0.05) {
                   ctx.save();
                   ctx.fillStyle = charInk;
                   ctx.globalAlpha = 0.4;
                   // Position randomly near baseline
                   const dx = x + Math.random() * 15 - 5;
                   const dy = targetY + (Math.random() * 5); 
                   ctx.beginPath();
                   // Small circles 0.5-1px radius
                   ctx.arc(dx, dy, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
                   ctx.fill();
                   ctx.restore();
                }

                // Return actual width + Random Spacing
                const w = ctx.measureText(char).width;
                const spacingVar = (Math.random() - 0.5) * 3; 
                
                return w + letterSpacing + spacingVar;
            };

            // Run Pass 1 (Measure for pagination)
            const totalP = await renderPass(true);
            if (totalP !== totalPages) {
                setTotalPages(totalP);
                onRenderComplete?.(totalP);
            }

            // Run Pass 2 (Actual Paint)
            await renderPass(false);

            // 5. POST-PROCESSING IMPERFECTIONS
            
            // Vignette / Edge Shadow
            const grad = ctx.createRadialGradient(
                baseWidth/2, baseHeight/2, baseHeight * 0.3,
                baseWidth/2, baseHeight/2, baseHeight * 0.8
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.08)'); // darkening edges
            
            ctx.save();
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillRect(0, 0, baseWidth, baseHeight);
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
