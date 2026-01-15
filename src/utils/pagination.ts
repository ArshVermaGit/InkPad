import type { RenderingSettings, PagePreset, Page } from '../types';
import { getPresetMetadata } from '../constants/presets';

export interface PageData {
    text: string;
    pageIndex: number;
    lines: string[];
}

interface PaginationOptions {
    text: string;
    width: number;
    height: number;
    fontSize: number;
    settings: RenderingSettings;
    pagePreset: PagePreset;
    pages: Page[];
}

/**
 * Calculates how text should be split across multiple pages
 * based on the physical paper constraints.
 */
export const calculatePagination = (options: PaginationOptions): PageData[] => {
    const { text, width, height, fontSize, settings, pagePreset, pages } = options;
    const pageTexts: PageData[] = [];
    const preset = getPresetMetadata(pagePreset);

    // 1. Determine usable area
    const getPageMargins = (idx: number) => {
        const pageData = pages[idx];
        const baseMargins = pageData?.margins || settings.margins;

        const actualFontSize = preset ? (preset.defaultFontSize || fontSize) : (fontSize * 0.8);

        if (preset) {
            return {
                top: preset.firstLineY - actualFontSize,
                right: 40,
                bottom: 40,
                left: (preset.marginLineX || baseMargins.left)
            };
        }
        return {
            top: baseMargins.top * 0.5,
            right: baseMargins.right * 0.5,
            bottom: baseMargins.bottom * 0.5,
            left: baseMargins.left * 0.5
        };
    };

    const actualLineHeight = preset ? preset.lineSpacing : (fontSize * settings.lineHeight * 0.8);
    const actualFontSize = preset ? (preset.defaultFontSize || fontSize) : (fontSize * 0.8);

    const paragraphs = text.split('\n');
    let currentPageIndex = 0;
    let currentLines: string[] = [];
    let currentY = 0;

    const finalizePage = () => {
        pageTexts.push({
            text: currentLines.join('\n'),
            pageIndex: currentPageIndex,
            lines: [...currentLines]
        });
        currentPageIndex++;
        currentLines = [];
    };

    let margins = getPageMargins(currentPageIndex);
    currentY = margins.top + actualFontSize;
    let maxY = height - margins.bottom;
    const actualLineWidth = width - margins.left - margins.right;

    paragraphs.forEach((paragraph) => {
        if (!paragraph.trim()) {
            if (currentY + actualLineHeight > maxY) {
                finalizePage();
                margins = getPageMargins(currentPageIndex);
                currentY = margins.top + actualFontSize;
                maxY = height - margins.bottom;
            } else {
                currentLines.push('');
                currentY += actualLineHeight;
            }
            return;
        }

        const words = paragraph.split(' ');
        let currentLineText = '';
        let currentLineWidth = 0;
        const avgCharWidth = actualFontSize * 0.45; // Estimate for pagination planning

        words.forEach((word) => {
            const wordWidth = word.length * avgCharWidth;
            const spaceWidth = actualFontSize * 0.25 * settings.wordSpacing;

            if (currentLineWidth + wordWidth > actualLineWidth && currentLineText) {
                // Line wrap
                if (currentY + actualLineHeight > maxY) {
                    finalizePage();
                    margins = getPageMargins(currentPageIndex);
                    currentY = margins.top + actualFontSize;
                    maxY = height - margins.bottom;
                } else {
                    currentY += actualLineHeight;
                }
                currentLines.push(currentLineText.trimEnd());
                currentLineText = word + ' ';
                currentLineWidth = wordWidth + spaceWidth;
            } else {
                currentLineText += word + ' ';
                currentLineWidth += wordWidth + spaceWidth;
            }
        });

        if (currentLineText.trim()) {
            if (currentY + actualLineHeight > maxY) {
                finalizePage();
                margins = getPageMargins(currentPageIndex);
                currentY = margins.top + actualFontSize;
                maxY = height - margins.bottom;
            } else {
                // pIdx check removed to keep line sync simple
            }
            currentLines.push(currentLineText.trimEnd());
            currentY += actualLineHeight;
        }
    });

    if (currentLines.length > 0 || pageTexts.length === 0) {
        finalizePage();
    }

    return pageTexts;
};
