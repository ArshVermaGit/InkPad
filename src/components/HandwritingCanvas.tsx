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
        top: 60,
        bottom: 60,
        left: 80,
        right: 80
    },
    ppi: 96 // standard screen ppi
};

// Convert mm to pixels at 96 PPI
const mmToPx = (mm: number) => (mm * 96) / 25.4;

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
        lineHeight, 
        wordSpacing,
        inkColor,
        paperMaterial,
        customPaperImage,
        paperShadow,
        inkBlur,
        resolutionQuality,
        paperTilt,
        paperTexture
    } = useStore();

    const [totalPages, setTotalPages] = useState(1);

    // Calculate canvas dimensions
    const width = mmToPx(PAPER_CONFIG.width);
    const height = mmToPx(PAPER_CONFIG.height);
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) * (resolutionQuality / 2) : 1;

    // Font family mapping
    const fontFamilies: Record<string, string> = {
        'caveat': 'Caveat',
        'gloria-hallelujah': 'Gloria Hallelujah',
        'indie-flower': 'Indie Flower',
        'shadows-into-light': 'Shadows Into Light',
        'patrick-hand': 'Patrick Hand',
        'permanent-marker': 'Permanent Marker',
        'kalam': 'Kalam',
        'homemade-apple': 'Homemade Apple',
        'reenie-beanie': 'Reenie Beanie',
        'nothing-you-could-do': 'Nothing You Could Do'
    };

    const currentFontFamily = fontFamilies[handwritingStyle] || 'Caveat';

    useEffect(() => {
        const render = async () => {
            const canvas = internalCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set high resolution
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            // Apply Paper Tilt
            if (paperTilt) {
                // Use a deterministic seeds for tilt based on page number
                const seed = Math.sin(currentPage) * 10000;
                const tilt = (seed - Math.floor(seed) - 0.5) * 4; // ±2 degrees
                ctx.translate(width / 2, height / 2);
                ctx.rotate((tilt * Math.PI) / 180);
                ctx.translate(-width / 2, -height / 2);
            }

            // 1. Draw Paper Background
            ctx.fillStyle = paperMaterial === 'vintage' ? '#f5f0e1' : '#ffffff';
            ctx.fillRect(0, 0, width, height);

            if (paperMaterial === 'custom' && customPaperImage) {
                const img = new Image();
                img.src = customPaperImage;
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(null);
                    };
                });
            } else if (paperMaterial === 'ruled') {
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                for (let y = mmToPx(PAPER_CONFIG.margins.top); y < height - mmToPx(PAPER_CONFIG.margins.bottom); y += 27) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            } else if (paperMaterial === 'graph') {
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                const step = 20;
                for (let x = 0; x < width; x += step) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
                }
                for (let y = 0; y < height; y += step) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
                }
            } else if (paperMaterial === 'dotted') {
                ctx.fillStyle = '#c0c0c0';
                const step = 15;
                for (let x = step; x < width; x += step) {
                    for (let y = step; y < height; y += step) {
                        ctx.beginPath();
                        ctx.arc(x, y, 1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // 2. Render Tokens
            const tokens = tokenizeHTML(text);
            
            const leftMargin = mmToPx(PAPER_CONFIG.margins.left);
            const rightMargin = width - mmToPx(PAPER_CONFIG.margins.right);
            const topMargin = mmToPx(PAPER_CONFIG.margins.top);
            const bottomMargin = height - mmToPx(PAPER_CONFIG.margins.bottom);

            const renderPass = async (isMeasuring: boolean) => {
                let currentX = leftMargin;
                let currentY = topMargin;
                let pageNum = 1;

                let bold = false;
                let italic = false;
                let currentFSize = fontSize;
                let listType: 'ul' | 'ol' | null = null;
                let listCounter = 0;

                const setCtxFont = () => {
                    ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${currentFSize}px "${currentFontFamily}"`;
                };

                for (const token of tokens) {
                    if (token.type === 'tag') {
                        const tag = token.tagName;
                        if (tag === 'b' || tag === 'strong') bold = !token.isClosing;
                        else if (tag === 'i' || tag === 'em') italic = !token.isClosing;
                        else if (tag === 'h1') currentFSize = token.isClosing ? fontSize : 28;
                        else if (tag === 'h2') currentFSize = token.isClosing ? fontSize : 24;
                        else if (tag === 'h3') currentFSize = token.isClosing ? fontSize : 20;
                        else if (tag === 'ul') { listType = token.isClosing ? null : 'ul'; if (!token.isClosing) listCounter = 0; }
                        else if (tag === 'ol') { listType = token.isClosing ? null : 'ol'; if (!token.isClosing) listCounter = 0; }
                        else if (tag === 'li') {
                            if (!token.isClosing) {
                                currentY += currentFSize * lineHeight;
                                currentX = leftMargin + 20;
                                listCounter++;
                                if (!isMeasuring && pageNum === currentPage) {
                                    ctx.font = `${currentFSize}px sans-serif`;
                                    ctx.fillText(listType === 'ol' ? `${listCounter}. ` : '• ', leftMargin, currentY);
                                }
                            }
                        }
                        else if (tag === 'br' || tag === 'div' || tag === 'p') {
                            if (!token.isClosing || tag === 'br') {
                                currentY += currentFSize * lineHeight;
                                currentX = leftMargin;
                                if (listType) currentX += 20;
                            }
                        }
                        else if (tag === 'img' && token.attributes?.src) {
                            const img = new Image();
                            img.src = token.attributes.src;
                            await new Promise(r => img.onload = r);
                            const iW = Math.min(img.width, rightMargin - leftMargin);
                            const iH = (img.height * iW) / img.width;
                            
                            if (currentY + iH > bottomMargin) {
                                pageNum++;
                                currentY = topMargin;
                                currentX = leftMargin;
                            }
                            
                            if (!isMeasuring && pageNum === currentPage) {
                                ctx.drawImage(img, currentX, currentY, iW, iH);
                            }
                            currentY += iH + 10;
                            currentX = leftMargin;
                        }
                        setCtxFont();
                    } else if (token.type === 'text' && token.content) {
                        setCtxFont();
                        const word = token.content;
                        if (/\s+/.test(word)) {
                            currentX += ctx.measureText(word).width + wordSpacing;
                        } else {
                            const metrics = ctx.measureText(word);
                            if (currentX + metrics.width > rightMargin) {
                                currentY += currentFSize * lineHeight;
                                currentX = leftMargin;
                                if (listType) currentX += 20;
                            }

                            if (currentY > bottomMargin) {
                                pageNum++;
                                currentX = leftMargin;
                                currentY = topMargin;
                                if (listType) currentX += 20;
                            }

                            if (!isMeasuring && pageNum === currentPage) {
                                for (let i = 0; i < word.length; i++) {
                                    const char = word[i];
                                    const jitterX = (Math.random() - 0.5) * 0.5;
                                    const jitterY = (Math.random() - 0.5) * 2;
                                    const jitterRotation = (Math.random() - 0.5) * 0.05;

                                    ctx.save();
                                    ctx.translate(currentX + jitterX, currentY + jitterY);
                                    ctx.rotate(jitterRotation);
                                    ctx.fillText(char, 0, 0);
                                    ctx.restore();
                                    currentX += ctx.measureText(char).width + letterSpacing;
                                }
                            } else {
                                currentX += metrics.width + letterSpacing;
                            }
                        }
                    }
                }
                return pageNum;
            };

            const totalP = await renderPass(true);
            if (totalP !== totalPages) {
                setTotalPages(totalP);
                onRenderComplete?.(totalP);
            }

            await renderPass(false);

            // 3. Draw Texture Overlay
            if (paperTexture) {
                ctx.save();
                ctx.filter = 'none';
                ctx.globalAlpha = 0.03;
                const grainSize = 2;
                for (let x = 0; x < width; x += grainSize) {
                    for (let y = 0; y < height; y += grainSize) {
                        if (Math.random() > 0.5) {
                            ctx.fillStyle = '#000000';
                            ctx.fillRect(x, y, grainSize, grainSize);
                        }
                    }
                }
                ctx.restore();
            }
        };

        render();
    }, [text, handwritingStyle, fontSize, letterSpacing, lineHeight, wordSpacing, inkColor, paperMaterial, customPaperImage, currentPage, width, height, dpr, currentFontFamily, totalPages, onRenderComplete, paperTilt, inkBlur, paperTexture]);

    return (
        <div className="relative transition-all duration-500 ease-in-out">
            <canvas
                ref={internalCanvasRef}
                className={`bg-white transition-shadow duration-500 ${paperShadow ? 'shadow-[0_20px_50px_rgba(0,0,0,0.15)]' : 'shadow-none'}`}
            />
        </div>
    );
});
