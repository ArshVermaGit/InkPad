import { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { getFontFamily, renderHandwriting } from '../utils/handwriting';

export default function CanvasRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        text,
        handwritingStyle,
        fontSize,
        lineSpacing,
        paperType,
        inkColor,
        customFonts
    } = useStore();

    // Ensure custom fonts are available for canvas rendering
    useEffect(() => {
        customFonts.forEach(font => {
            if (font.url) {
                const fontFace = new FontFace(font.family, `url(${font.url})`);
                fontFace.load().then((loadedFace) => {
                    document.fonts.add(loadedFace);
                    // Redraw on load
                    if (canvasRef.current) {
                        triggerRedraw();
                    }
                });
            }
        });
    }, [customFonts]);

    const triggerRedraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 1240;
        canvas.height = 1754;

        const fontFamily = getFontFamily(handwritingStyle, customFonts);
        renderHandwriting(
            canvas,
            text,
            fontFamily,
            fontSize * 1.5,
            lineSpacing,
            paperType,
            inkColor
        );
    };

    useEffect(() => {
        triggerRedraw();
    }, [text, handwritingStyle, fontSize, lineSpacing, paperType, inkColor, customFonts]);

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <canvas
                ref={canvasRef}
                className="max-w-full h-auto shadow-2xl bg-white border border-gray-100"
            />
        </div>
    );
}
