import type { HandwritingStyle, PaperType } from '../types';

export const getFontFamily = (style: HandwritingStyle): string => {
    const fonts = {
        cursive: 'Caveat, cursive',
        script: 'Dancing Script, cursive',
        print: 'Patrick Hand, cursive',
    };
    return fonts[style];
};

export const drawPaperBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    paperType: PaperType,
    lineSpacing: number
) => {
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    if (paperType === 'lined') {
        // Draw horizontal lines
        const spacing = lineSpacing * 40;
        for (let y = spacing; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    } else if (paperType === 'grid') {
        // Draw grid
        const spacing = 30;
        for (let x = 0; x < width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
};

export const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
): string[] => {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph) => {
        if (!paragraph.trim()) {
            lines.push('');
            return;
        }

        const words = paragraph.split(' ');
        let currentLine = '';

        words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }
    });

    return lines;
};

export const renderHandwriting = (
    canvas: HTMLCanvasElement,
    text: string,
    fontFamily: string,
    fontSize: number,
    lineSpacing: number,
    paperType: PaperType,
    inkColor: string
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;

    // Draw paper background
    drawPaperBackground(ctx, width, height, paperType, lineSpacing);

    // Set text properties
    ctx.fillStyle = inkColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';

    // Wrap and render text
    const maxWidth = width - padding * 2;
    const lines = wrapText(ctx, text, maxWidth);

    const lineHeight = fontSize * lineSpacing;
    let y = padding;

    lines.forEach((line) => {
        ctx.fillText(line, padding, y);
        y += lineHeight;
    });
};
