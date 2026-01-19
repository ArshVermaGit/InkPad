import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useStore } from '../lib/store';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Token } from '../types';

interface HandwritingCanvasProps {
    text: string;
    onRenderComplete?: (totalPages: number) => void;
    currentPage: number;
}

const PAGE_CONFIG = {
    a4: { width: 2480, height: 3508 },
    letter: { width: 2550, height: 3300 },
    legal: { width: 2550, height: 4200 },
    a5: { width: 1748, height: 2480 },
    a6: { width: 1240, height: 1748 },
    tabloid: { width: 3300, height: 5100 }
};

const MARGINS = {
    top: 120,
    bottom: 100,
    left: 100,
    right: 100
};

const PPI = 300;
const LINE_HEIGHT = 40; // matches ruled line spacing

// Helper for display scaling
const pxToDisplay = (px: number) => (px * 96) / PPI;



// Export Types
export interface HandwritingCanvasHandle {
    exportPDF: () => Promise<jsPDF>;
    exportZIP: () => Promise<Blob>;
    exportPNG: (quality?: number, format?: 'image/png' | 'image/jpeg') => Promise<string>;
}

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

// Baseline offsets (Ratio of font size to shift UP to sit ON the line)
const BASELINE_OFFSETS: Record<string, number> = {
    'caveat': 0.05,
    'gloria': 0.12,
    'indie': 0.08,
    'shadows': 0.15,
    'patrick': 0.10,
    'marker': 0.05,
    'kalam': 0.10
};

export const HandwritingCanvas = forwardRef<HandwritingCanvasHandle, HandwritingCanvasProps>(({ 
    text,
    onRenderComplete,
    currentPage
}, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const workerRef = useRef<Worker | null>(null);
    const cacheRef = useRef<Map<string, ImageBitmap>>(new Map());
    
    const { 
        handwritingStyle, 
        fontSize, 
        letterSpacing, 
        wordSpacing,
        inkColor,
        paperMaterial,
        paperSize,
        paperOrientation,
        paperShadow,
        paperTexture,
        customPaperImage,
        setIsRendering,
        setRenderingProgress
    } = useStore();

    const [totalPages, setTotalPages] = useState(1);

    const config = PAGE_CONFIG[paperSize as keyof typeof PAGE_CONFIG] || PAGE_CONFIG.a4;
    const isLandscape = paperOrientation === 'landscape';
    
    const baseWidth = isLandscape ? config.height : config.width;
    const baseHeight = isLandscape ? config.width : config.height;
    
    const displayWidth = pxToDisplay(baseWidth);
    const displayHeight = pxToDisplay(baseHeight);

    const usableHeight = baseHeight - MARGINS.top - MARGINS.bottom;
    const linesPerPage = Math.floor(usableHeight / LINE_HEIGHT);

    const currentFontFamily = fontFamilies[handwritingStyle] || 'Caveat';

    // Main Render Loop
    // Defined BEFORE useImperativeHandle to avoid hoisting issues
    // Simplified rendering context for a single page
    const renderContent = useCallback(async (ctx: CanvasRenderingContext2D, targetPage: number, isExport: boolean, tokens: Token[]) => {
            // 2. RENDER PAPER BACKGROUND
            const isVintage = paperMaterial === 'vintage';
            const isCream = (paperMaterial as string) === 'cream';
            
            // Global imperfections (seeded by page number for consistency)
            const seed = targetPage * 1337;
            const pseudoRandom = () => {
                const x = Math.sin(seed) * 10000;
                return x - Math.floor(x);
            };

            const globalSlant = (pseudoRandom() - 0.5) * 0.174; 
            const driftAmplitude = 2 + pseudoRandom(); 
            const driftWavelength = 500 + pseudoRandom() * 300;
            
            // Ink Color Base with variations
            const getInkVariation = (baseColor: string) => {
                const color = baseColor.toLowerCase();
                const isBlue = color.includes('000080') || color.includes('0000cd') || color.includes('4169e1');
                const isBlack = color.includes('000000') || color.includes('1a1a1a') || color.includes('2b2b2b');

                if (Math.random() > 0.9) {
                    if (isBlue) {
                        const blueVariants = ['#000080', '#0000CD', '#4169E1'];
                        return blueVariants[Math.floor(Math.random() * blueVariants.length)];
                    }
                    if (isBlack) {
                        const blackVariants = ['#000000', '#1a1a1a', '#2b2b2b'];
                        return blackVariants[Math.floor(Math.random() * blackVariants.length)];
                    }
                    return adjustBrightness(baseColor, 0.85); 
                }
                return adjustBrightness(baseColor, 0.95 + Math.random() * 0.1); 
            };
            
            // Tokenize is now passed as an argument from the worker/cache
            // const tokens = tokenizeHTML(text);

            // Base colors/textures
            const paperColors: Record<string, string> = {
                'white': '#FEFEFE',
                'ruled': '#FDFDFD',
                'college': '#FDFDFD',
                'wide': '#FDFDFD',
                'graph': '#FDFDFD',
                'dotted': '#FDFDFD',
                'vintage': '#F5E6D3',
                'aged': '#E8DCC4',
                'cream': '#FFF8E7',
                'love-letter': '#FFF0F5',
                'birthday': '#FFFBF0',
                'christmas': '#F0FFF4',
                'professional': '#FFFFFF'
            };

            const basePaperColor = paperColors[paperMaterial] || '#FFFFFF';
            ctx.fillStyle = basePaperColor;
            ctx.fillRect(0, 0, baseWidth, baseHeight);

            // 2.A PAPER FIBERS & TEXTURE HELPERS
            const addPaperFibers = (targetCtx: CanvasRenderingContext2D) => {
                targetCtx.save();
                targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.015)';
                targetCtx.lineWidth = 0.5;
                for (let i = 0; i < 2000; i++) {
                    const x = Math.random() * baseWidth;
                    const y = Math.random() * baseHeight;
                    const len = 2 + Math.random() * 5;
                    const ang = Math.random() * Math.PI * 2;
                    targetCtx.beginPath();
                    targetCtx.moveTo(x, y);
                    targetCtx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
                    targetCtx.stroke();
                }
                targetCtx.restore();
            };

            const addPaperNoise = (targetCtx: CanvasRenderingContext2D, intensity = 0.03) => {
                const imageData = targetCtx.getImageData(0, 0, baseWidth, baseHeight);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const noise = (Math.random() - 0.5) * intensity * 255;
                    data[i] = Math.max(0, Math.min(255, data[i] + noise));
                    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
                }
                targetCtx.putImageData(imageData, 0, 0);
            };

            // Material Specific Effects
            if (paperMaterial === 'aged') {
                ctx.save();
                // Organic brown spots
                for (let i = 0; i < 15; i++) {
                    const x = Math.random() * baseWidth;
                    const y = Math.random() * baseHeight;
                    const r = 20 + Math.random() * 60;
                    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                    grad.addColorStop(0, 'rgba(139, 69, 19, 0.05)');
                    grad.addColorStop(1, 'rgba(139, 69, 19, 0)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(x - r, y - r, r * 2, r * 2);
                }
                ctx.restore();
            }

            if (isVintage || isCream || paperMaterial === 'aged') {
                ctx.save();
                ctx.fillStyle = paperMaterial === 'aged' ? 'rgba(100, 50, 0, 0.05)' : 'rgba(255, 230, 150, 0.04)';
                ctx.fillRect(0, 0, baseWidth, baseHeight);
                ctx.restore();
            }

            // Paper Texture Generation
            if (paperTexture) {
                addPaperFibers(ctx);
                addPaperNoise(ctx, paperMaterial === 'aged' ? 0.05 : 0.02);
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

            // 3. RULED LINES SYSTEM
            const marginL = MARGINS.left;
            const marginR = MARGINS.right;
            const marginT = MARGINS.top;
            const marginB = MARGINS.bottom;
            
            // Spacing variants
            let lineH = LINE_HEIGHT;
            if (paperMaterial === 'college') lineH = 30;
            if (paperMaterial === 'wide') lineH = 50;

            const drawRuledLines = () => {
                ctx.save();
                ctx.strokeStyle = '#d0d0d0';
                ctx.lineWidth = 1;
                for (let y = marginT + lineH; y <= baseHeight - marginB; y += lineH) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(baseWidth, y);
                    ctx.stroke();
                }
                // Vertical margin
                ctx.strokeStyle = 'rgba(229, 115, 115, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(marginL, 0);
                ctx.lineTo(marginL, baseHeight);
                ctx.stroke();
                ctx.restore();
            };

            const drawGraphPaper = () => {
                ctx.save();
                const step = 40;
                for (let x = 0; x <= baseWidth; x += step) {
                    ctx.strokeStyle = (x % (step * 5) === 0) ? '#C0C0C0' : '#E0E0E0';
                    ctx.lineWidth = (x % (step * 5) === 0) ? 1 : 0.5;
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, baseHeight); ctx.stroke();
                }
                for (let y = 0; y <= baseHeight; y += step) {
                    ctx.strokeStyle = (y % (step * 5) === 0) ? '#C0C0C0' : '#E0E0E0';
                    ctx.lineWidth = (y % (step * 5) === 0) ? 1 : 0.5;
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(baseWidth, y); ctx.stroke();
                }
                ctx.restore();
            };

            const drawDottedPaper = () => {
                ctx.save();
                ctx.fillStyle = '#CCCCCC';
                const step = 40;
                for (let x = step; x < baseWidth; x += step) {
                    for (let y = step; y < baseHeight; y += step) {
                        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
                    }
                }
                ctx.restore();
            };

            const drawTemplates = () => {
                if (paperMaterial === 'love-letter') {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 105, 180, 0.3)';
                    ctx.lineWidth = 15;
                    ctx.strokeRect(30, 30, baseWidth - 60, baseHeight - 60);
                    ctx.restore();
                } else if (paperMaterial === 'birthday') {
                    // Confetti
                    ctx.save();
                    const colors = ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'];
                    for (let i = 0; i < 100; i++) {
                        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                        ctx.beginPath();
                        ctx.arc(Math.random() * baseWidth, Math.random() * baseHeight, 2 + Math.random() * 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                } else if (paperMaterial === 'professional') {
                    ctx.save();
                    ctx.fillStyle = '#333';
                    ctx.font = 'bold 24px serif';
                    ctx.fillText('MEMORANDUM', marginL, 80);
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(marginL, 90); ctx.lineTo(baseWidth - marginR, 90); ctx.stroke();
                    ctx.restore();
                }
            };

            if (['ruled', 'college', 'wide', 'white', 'vintage', 'aged', 'cream', 'love-letter', 'professional'].includes(paperMaterial)) {
                drawRuledLines();
            } else if (paperMaterial === 'graph') {
                drawGraphPaper();
            } else if (paperMaterial === 'dotted') {
                drawDottedPaper();
            } else if (paperMaterial === 'custom' && customPaperImage) {
                // Render custom paper image
                const img = new Image();
                img.src = customPaperImage;
                // Since this is inside renderContent which might be async, 
                // we should ensure it's loaded before continuing
                await new Promise((resolve) => {
                    if (img.complete) resolve(null);
                    else {
                        img.onload = () => resolve(null);
                        img.onerror = () => resolve(null);
                    }
                });
                
                // Draw image covering the whole base paper size
                ctx.drawImage(img, 0, 0, baseWidth, baseHeight);
            }
            drawTemplates();

            // Set blend mode for ink
            ctx.globalCompositeOperation = 'multiply';


            if (!text.trim()) {
                if (targetPage === 1) {
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
                }
                return 1; // Only one page if no text
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

            // rendering Loop
            // We start writing on the FIRST ruled line (Line 1)
            let currentLineIndex = 1;
            let currentBaselineY = marginT + (lineH * currentLineIndex);
            
            // Baseline adjustment per font
            const getBaselineY = (y: number, fSize: number) => {
                const offset = BASELINE_OFFSETS[handwritingStyle] || 0.1;
                return y - (fSize * offset);
            };

            // Text starts 10px after vertical margin line (110px total)
            const textStartX = marginL + 10;
            // First line/paragraph indentation (140px total = +30px)
            let currentX = textStartX + 30;
            let pageNum = 1;

            let bold = false;
            let italic = false;
            let underline = false;
            let prevWordEndedWith = '';
            let listLevel = 0;
            let listIndex = 0;
            let isNumberedList = false;
            let currentIndent = 0;
            // Base Font Size scaled to PPI
            const fontScale = PPI / 96; 
            let baseFSize = fontSize * fontScale;

            ctx.textBaseline = 'alphabetic'; // Text sits ON the line

            const usableWidth = baseWidth - marginR - marginL;

            const drawUnderline = (width: number, color: string) => {
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.2;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(0, 6);
                for (let i = 0; i <= width; i += 4) {
                    const waveY = Math.sin(i / 8) * 1.2;
                    ctx.lineTo(i, 6 + waveY);
                }
                ctx.stroke();
                ctx.restore();
            };

            const isComplexScript = (text: string) => {
                // Arabic: \u0600-\u06FF, Devanagari: \u0900-\u097F
                // Simplified regex to avoid lint errors with combined characters
                return /[\u0600-\u06FF]/.test(text) || /[\u0900-\u097F]/.test(text);
            };

            // DRAW CHAR FUNCTION (Scoped here to use local vars)
            const drawCharWithEffects = (char: string, x: number, lineY: number, bFSize: number, isBold: boolean, isItalic: boolean, isUnderline: boolean) => {
                // 1. Script & Emoji Detection
                // Safer emoji detection using charCodeAt to avoid lint issues
                const code = char.charCodeAt(0);
                const isEmoji = (code >= 0xD800 && code <= 0xDBFF) || char.length > 1; 
                const complex = isComplexScript(char);
                const isRTL = /[\u0600-\u06FF]/u.test(char);
                
                // 2. Baseline Drift (Sinusoidal wave: A=2-3px, λ=500-800px)
                const driftY = driftAmplitude * Math.sin(x / driftWavelength);
                
                // 3. CHARACTER-LEVEL RANDOMIZATION
                const yVar = (Math.random() - 0.5) * 4; // ±2px
                const xVar = (Math.random() - 0.5) * 2; // ±1px
                const localSlantVar = (Math.random() - 0.5) * 0.035; // ±1 degree
                const rotation = globalSlant + localSlantVar;
                const sizeVar = 1 + (Math.random() - 0.5) * 0.1; // ±5%
                const finalSize = bFSize * sizeVar;

                // 4. INK EFFECTS & PRESSURE
                const charInk = getInkVariation(inkColor);
                const pressureOpacity = 0.85 + Math.random() * 0.15;
                const bleeding = 0.3 + Math.random() * 0.5;
                
                const adjustedY = getBaselineY(lineY, bFSize) + driftY;

                // Calculate width early for underline
                ctx.save();
                ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${finalSize}px "${currentFontFamily}"`;
                const charWidth = ctx.measureText(char).width;
                ctx.restore();

                ctx.save();
                
                // Set Font
                ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${finalSize}px "${currentFontFamily}"`;
                ctx.globalAlpha = pressureOpacity;
                
                // Apply Transformations
                ctx.translate(x + xVar, adjustedY + yVar);
                ctx.rotate(rotation);

                if (isEmoji) {
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1.0;
                    ctx.font = `${finalSize}px serif`; 
                    ctx.fillText(char, 0, 0);
                } else if (complex) {
                    // For complex scripts (Arabic, Hindi), we render the whole unit
                    // to preserve ligatures and connections.
                    ctx.direction = isRTL ? 'rtl' : 'ltr';
                    ctx.shadowBlur = bleeding;
                    ctx.shadowColor = charInk;
                    ctx.fillStyle = charInk;
                    ctx.fillText(char, 0, 0);
                    
                    if (isBold) {
                        ctx.strokeStyle = charInk;
                        ctx.lineWidth = 0.5;
                        ctx.strokeText(char, 0, 0);
                    }
                    if (isUnderline) {
                        drawUnderline(charWidth, charInk);
                    }
                } else {
                    // --- LAYERED RENDERING ---
                    ctx.shadowBlur = bleeding;
                    ctx.shadowColor = charInk;
                    
                    const gradient = ctx.createLinearGradient(0, -finalSize, 0, 0);
                    gradient.addColorStop(0, charInk);
                    gradient.addColorStop(1, adjustBrightness(charInk, 0.9));
                    
                    ctx.fillStyle = gradient;
                    ctx.fillText(char, 0, 0);

                    if (isBold) {
                        ctx.strokeStyle = charInk;
                        ctx.lineWidth = 0.5;
                        ctx.strokeText(char, 0, 0);
                    }

                    if (isUnderline) {
                        drawUnderline(charWidth, charInk);
                    }
                }

                ctx.restore();

                // 5. Artifacts: Ink Dots / Splatter (5% chance)
                if (!isEmoji && Math.random() < 0.05) {
                   ctx.save();
                   ctx.fillStyle = charInk;
                   ctx.globalAlpha = 0.4;
                   const dx = x + Math.random() * 10 - 5;
                   const dy = adjustedY + (Math.random() * 6 - 3); 
                   ctx.beginPath();
                   ctx.arc(dx, dy, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
                   ctx.fill();
                   ctx.restore();
                }

                const w = ctx.measureText(char).width;
                const spacingVar = (Math.random() - 0.5) * 3; 
                
                return w + letterSpacing + spacingVar;
            };

            for (const token of tokens) {
                if (token.type === 'tag') {
                    const tag = token.tagName;
                    if (tag === 'b' || tag === 'strong') bold = !token.isClosing;
                    else if (tag === 'i' || tag === 'em') italic = !token.isClosing;
                    else if (tag === 'u') underline = !token.isClosing;
                    else if (tag === 'h1') {
                        baseFSize = (token.isClosing ? fontSize : 36) * fontScale;
                        if (!token.isClosing) currentLineIndex++; // Extra gap for H1
                    }
                    else if (tag === 'h2') {
                        baseFSize = (token.isClosing ? fontSize : 30) * fontScale;
                        if (!token.isClosing) currentLineIndex += 0.5;
                    }
                    else if (tag === 'h3') {
                        baseFSize = (token.isClosing ? fontSize : 24) * fontScale;
                    }
                    else if (tag === 'ul') {
                        listLevel = token.isClosing ? 0 : 1;
                        isNumberedList = false;
                        listIndex = 0;
                    }
                    else if (tag === 'ol') {
                        listLevel = token.isClosing ? 0 : 1;
                        isNumberedList = true;
                        listIndex = 0;
                    }
                    else if (tag === 'li') {
                        if (!token.isClosing) {
                             listIndex++;
                             currentLineIndex++;
                             currentBaselineY = marginT + (lineH * currentLineIndex);
                             currentIndent = listLevel * 40;
                             currentX = textStartX + currentIndent;
                             
                             if (pageNum === targetPage) {
                                 if (isNumberedList) {
                                     // Render "1." as a unit to preserve baseline
                                     drawCharWithEffects(`${listIndex}.`, currentX, currentBaselineY, baseFSize, bold, italic, underline);
                                     currentX += 30;
                                 } else {
                                     // Hand-drawn bullet (messy circle)
                                     ctx.save();
                                     ctx.beginPath();
                                     ctx.arc(currentX + 10, currentBaselineY - (baseFSize * 0.3), 3.5, 0, Math.PI * 2);
                                     ctx.strokeStyle = inkColor;
                                     ctx.lineWidth = 1.2;
                                     ctx.stroke();
                                     ctx.globalAlpha = 0.3;
                                     ctx.fill();
                                     ctx.restore();
                                     currentX += 30;
                                 }
                             } else {
                                 currentX += 30;
                             }
                             // Hanging indent for continuation lines
                             currentIndent += 30;
                        } else {
                            // When LI ends, we don't necessarily reset currentIndent if we are still in UL/OL
                            // but usually next text will be another LI.
                        }
                    }
                    else if (tag === 'br' || tag === 'div' || tag === 'p') {
                        if (!token.isClosing || tag === 'br') {
                            const isParagraph = tag === 'p' || (tag === 'div' && !token.isClosing);
                            const linesToSkip = isParagraph ? 2 : 1;
                            
                            currentLineIndex += linesToSkip;
                            currentBaselineY = marginT + (lineH * currentLineIndex);
                            currentX = textStartX + (isParagraph ? 30 : 0);
                            currentIndent = isParagraph ? 30 : 0;
                            
                            if (currentLineIndex > linesPerPage) {
                                pageNum++;
                                currentLineIndex = 1;
                                currentBaselineY = marginT + (lineH * currentLineIndex);
                                currentX = textStartX + (isParagraph ? 30 : 0);
                            }
                        }
                    }
                        else if (tag === 'img' && token.attributes?.src) {
                        const img = new Image();
                        img.src = token.attributes.src;
                        await new Promise(r => img.onload = r);
                        
                        const iW = Math.min(img.width, usableWidth);
                        const iH = (img.height * iW) / img.width;
                        
                        // Check fit
                        if (currentBaselineY + iH > baseHeight - marginB) {
                            pageNum++;
                            currentBaselineY = marginT;
                            currentX = marginL;
                        }
                        
                        if (pageNum === targetPage) {
                            ctx.drawImage(img, currentX, currentBaselineY, iW, iH);
                        }
                        
                        const linesConsumed = Math.ceil((iH + 20) / lineH);
                        currentLineIndex += linesConsumed;
                        currentBaselineY = marginT + (lineH * currentLineIndex);
                        currentX = textStartX;
                    }
                } else if (token.type === 'text' && token.content) {
                    const words = token.content.split(/(\s+)/);
                    
                    for (let w = 0; w < words.length; w++) {
                        const word = words[w];
                        if (!word) continue;
                        const isSpace = /\s+/.test(word);

                        ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${baseFSize}px "${currentFontFamily}"`;

                        if (isSpace) {
                            const spaceVar = (Math.random() - 0.5) * 8; // ±4px natural variation
                            let spaceW = ctx.measureText(' ').width + wordSpacing + spaceVar; 
                            
                            // Advanced Spacing Rules: Punctuation
                            if (prevWordEndedWith === '.') spaceW += wordSpacing * 0.8;
                            else if (prevWordEndedWith === ',') spaceW += wordSpacing * 0.3;

                            currentX += spaceW;
                            continue;
                        }

                        const wordMetrics = ctx.measureText(word);
                        const wordWidth = wordMetrics.width + (word.length * letterSpacing);
                        
                        // Intelligent Word Wrapping
                        if (currentX + wordWidth > baseWidth - marginR) {
                            // Can we break the word? (Syllable-based or character-based if too long)
                            if (wordWidth > usableWidth) {
                                // Hyphenation for words longer than the entire line
                                const chars = word.split('');
                                for (const char of chars) {
                                    const charWidth = ctx.measureText(char).width + letterSpacing;
                                    
                                    if (currentX + charWidth > baseWidth - marginR) {
                                        // Draw Hyphen
                                        if (pageNum === targetPage) {
                                            ctx.save();
                                            ctx.fillStyle = inkColor;
                                            ctx.fillText('-', currentX, currentBaselineY);
                                            ctx.restore();
                                        }

                                        // Move to next line
                                        if (currentLineIndex >= linesPerPage) { 
                                            pageNum++; 
                                            currentLineIndex = 1;
                                        } else {
                                            currentLineIndex++;
                                        }
                                        currentBaselineY = marginT + (lineH * currentLineIndex);
                                        currentX = textStartX + currentIndent;
                                    }

                                    if (pageNum === targetPage) {
                                        const w = drawCharWithEffects(char, currentX, currentBaselineY, baseFSize, bold, italic, underline);
                                        currentX += w;
                                    } else {
                                        currentX += charWidth;
                                    }
                                }
                                prevWordEndedWith = word.endsWith('.') ? '.' : (word.endsWith(',') ? ',' : '');
                                continue; 
                            } else {
                                // Word fits on a line but not the current one - move to next line
                                if (currentLineIndex >= linesPerPage) {
                                    pageNum++;
                                    currentLineIndex = 1;
                                } else {
                                    currentLineIndex++;
                                }
                                currentBaselineY = marginT + (lineH * currentLineIndex);
                                currentX = textStartX + currentIndent;
                            }
                        }

                        // Draw Word Normally
                        if (pageNum === targetPage) {
                            // Cursive/Ligature handling: Group common pairs
                            const ligatureRegex = /th|ch|sh|ff|fi|fl|ll|st|oo|ee/i;
                            let i = 0;
                            while (i < word.length) {
                                let chunk = word[i];
                                if (i < word.length - 1 && ligatureRegex.test(word.substring(i, i + 2))) {
                                    chunk = word.substring(i, i + 2);
                                    i += 2;
                                } else {
                                    i++;
                                }
                                const w = drawCharWithEffects(chunk, currentX, currentBaselineY, baseFSize, bold, italic, underline);
                                currentX += w;
                            }
                        } else {
                            currentX += wordWidth;
                        }
                        prevWordEndedWith = word.endsWith('.') ? '.' : (word.endsWith(',') ? ',' : '');
                    }
                }
            }

            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';

            if (!isExport) {
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
            }

            return pageNum; // Total pages encountered
    }, [handwritingStyle, inkColor, paperMaterial, customPaperImage, paperTexture, baseWidth, baseHeight, letterSpacing, wordSpacing, currentFontFamily, fontSize, linesPerPage, text]);


    // Export & Rendering Logic
    const renderPageToCanvas = async (pageIndex: number, targetCanvas: HTMLCanvasElement, tokens: Token[], format: 'png' | 'jpeg' = 'png') => {
        const ctx = targetCanvas.getContext('2d', { 
            alpha: format === 'png', 
            colorSpace: 'srgb' 
        });
        if (!ctx) return;

        // A4 at 300 DPI is 2480x3508. Double for Retina/Professional grade.
        const scaleFactor = 2; 
        targetCanvas.width = baseWidth * scaleFactor;
        targetCanvas.height = baseHeight * scaleFactor;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scaleFactor, scaleFactor);

        await renderContent(ctx, pageIndex, true, tokens);
    };

    useImperativeHandle(ref, () => ({
        exportPDF: async () => {
            const widthMM = (baseWidth * 25.4) / PPI;
            const heightMM = (baseHeight * 25.4) / PPI;
            const isLandscape = paperOrientation === 'landscape';
            
            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [widthMM, heightMM]
            });

            const tokens = await new Promise<Token[]>((resolve) => {
                const w = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), { type: 'module' });
                w.onmessage = (e) => {
                    if (e.data.type === 'LAYOUT_COMPLETE') {
                        resolve(e.data.tokens);
                        w.terminate();
                    }
                };
                w.postMessage({ type: 'LAYOUT', text });
            });

            const offscreenCanvas = document.createElement('canvas');
            for (let i = 1; i <= totalPages; i++) {
                if (i > 1) pdf.addPage([widthMM, heightMM], isLandscape ? 'landscape' : 'portrait');
                await renderPageToCanvas(i, offscreenCanvas, tokens, 'jpeg');
                const imgData = offscreenCanvas.toDataURL('image/jpeg', 1.0); // Maximum quality
                pdf.addImage(imgData, 'JPEG', 0, 0, widthMM, heightMM, undefined, 'FAST');
            }
            
            return pdf;
        },
        exportZIP: async () => {
            const zip = new JSZip();
            const offscreenCanvas = document.createElement('canvas');

            const tokens = await new Promise<Token[]>((resolve) => {
                const w = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), { type: 'module' });
                w.onmessage = (e) => {
                    if (e.data.type === 'LAYOUT_COMPLETE') {
                        resolve(e.data.tokens);
                        w.terminate();
                    }
                };
                w.postMessage({ type: 'LAYOUT', text });
            });

            for (let i = 1; i <= totalPages; i++) {
                await renderPageToCanvas(i, offscreenCanvas, tokens);
                const blob = await new Promise<Blob>((resolve) => 
                    offscreenCanvas.toBlob(b => resolve(b!), 'image/png')
                );
                zip.file(`page-${i}.png`, blob);
            }
            
            return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
        },
        exportPNG: async (quality = 1.0, format: 'image/png' | 'image/jpeg' = 'image/png') => {
            const tokens = await new Promise<Token[]>((resolve) => {
                const w = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), { type: 'module' });
                w.onmessage = (e) => {
                    if (e.data.type === 'LAYOUT_COMPLETE') {
                        resolve(e.data.tokens);
                        w.terminate();
                    }
                };
                w.postMessage({ type: 'LAYOUT', text });
            });
            const offscreenCanvas = document.createElement('canvas');
            await renderPageToCanvas(currentPage, offscreenCanvas, tokens, format === 'image/png' ? 'png' : 'jpeg');
            return offscreenCanvas.toDataURL(format, quality);
        }
    }));

    // Simplified effect for rendering - actual logic moved to worker/progressive effect
    useEffect(() => {
        const setupWorker = () => {
            if (!workerRef.current) {
                // In a real Vite project, we use ?worker or new Worker(new URL(...))
                workerRef.current = new Worker(new URL('../workers/layout.worker.ts', import.meta.url), { type: 'module' });
                workerRef.current.onmessage = async (e) => {
                    if (e.data.type === 'LAYOUT_COMPLETE') {
                        const tokens = e.data.tokens;
                        const cacheKey = `${text}-${handwritingStyle}-${fontSize}-${paperMaterial}`;
                        
                        // We would ideally calculate total pages here by doing a dry-run layout
                        // For now we'll simulate progressive rendering of the current page
                        const canvas = internalCanvasRef.current;
                        if (!canvas) return;
                        const ctx = canvas.getContext('2d', { alpha: false });
                        if (!ctx) return;
                        
                        const dpr = (window.devicePixelRatio || 1) * 2;
                        canvas.width = baseWidth * dpr;
                        canvas.height = baseHeight * dpr;
                        ctx.scale(dpr, dpr);
                        
                        setIsRendering(true);
                        setRenderingProgress(0.1);
                        
                        // Progressive simulation
                        for (let i = 1; i <= 10; i++) {
                            setRenderingProgress(i / 10);
                            await new Promise(r => setTimeout(r, 50)); // Artificial lag for UX
                        }

                        const totalP = await renderContent(ctx, currentPage, false, tokens);
                        
                        // Cache the result
                        const bitmap = await createImageBitmap(canvas);
                        cacheRef.current.set(`${cacheKey}-p${currentPage}`, bitmap);
                        
                        if (totalP && totalP !== totalPages) {
                            setTotalPages(totalP);
                            onRenderComplete?.(totalP);
                        }
                        setIsRendering(false);
                    }
                };
            }
            return workerRef.current;
        };

        const worker = setupWorker();
        worker.postMessage({ type: 'LAYOUT', text });

        const currentCache = cacheRef.current;
        return () => {
            // Memory cleanup: Close all ImageBitmaps in cache
            if (currentCache) {
                currentCache.forEach(bitmap => bitmap.close());
                currentCache.clear();
            }
        };
    }, [text, handwritingStyle, fontSize, paperMaterial, currentPage, baseWidth, baseHeight, renderContent, setIsRendering, setRenderingProgress, onRenderComplete, totalPages]);

    const paperColors: Record<string, string> = {
        'white': '#FEFEFE',
        'ruled': '#FDFDFD',
        'college': '#FDFDFD',
        'wide': '#FDFDFD',
        'graph': '#FDFDFD',
        'dotted': '#FDFDFD',
        'vintage': '#F5E6D3',
        'aged': '#E8DCC4',
        'cream': '#FFF8E7',
        'love-letter': '#FFF0F5',
        'birthday': '#FFFBF0',
        'christmas': '#F0FFF4',
        'professional': '#FFFFFF'
    };

    return (
        <div className="relative transition-all duration-500 ease-in-out group pb-8">
            <div 
                className={`transform-gpu transition-all duration-700 rounded-sm overflow-hidden relative ${paperShadow ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]' : ''}`}
                style={{
                    width: displayWidth,
                    height: displayHeight,
                    backgroundColor: paperColors[paperMaterial] || '#ffffff',
                    transform: `rotate(${paperShadow ? '-0.5deg' : '0deg'}) scale(${paperShadow ? 0.99 : 1})`,
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {paperShadow && (
                    <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none overflow-hidden origin-top-right">
                        <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-white shadow-[-10px_10px_20px_rgba(0,0,0,0.15)] rotate-45 transform border-b border-l border-gray-100/50" />
                        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-gray-300/10 to-transparent" />
                    </div>
                )}
                
                <canvas
                    ref={internalCanvasRef}
                    className="w-full h-full select-none"
                    style={{
                        mixBlendMode: 'multiply'
                    }}
                />

                {/* Subtle paper grain overlay for UI depth */}
                {paperTexture && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
                )}
            </div>
            
            {/* Pagination Indicator */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-4 text-sm text-gray-400 font-medium">
                <span className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">Page {currentPage} of {totalPages}</span>
            </div>
        </div>
    );
});

HandwritingCanvas.displayName = 'HandwritingCanvas';
