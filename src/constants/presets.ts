export interface PresetLineMetadata {
    id: string;
    firstLineY: number;      // Y coordinate of the first line in pixels (at 72DPI equivalent)
    lineSpacing: number;     // Vertical distance between lines
    marginLineX?: number;    // X coordinate of the red vertical line
    totalLines: number;
    defaultFontSize: number;
    isGrid?: boolean;
    gridSize?: number;
}

export const PRESET_METADATA: Record<string, PresetLineMetadata> = {
    'blue-line-page': {
        id: 'blue-line-page',
        firstLineY: 104,      // Measured from mockup
        lineSpacing: 32,
        marginLineX: 78,
        totalLines: 23,
        defaultFontSize: 24
    },
    'black-line-page': {
        id: 'black-line-page',
        firstLineY: 100,
        lineSpacing: 30,
        marginLineX: 80,
        totalLines: 24,
        defaultFontSize: 22
    },
    'grey-line-page': {
        id: 'grey-line-page',
        firstLineY: 110,
        lineSpacing: 34,
        marginLineX: 82,
        totalLines: 21,
        defaultFontSize: 26
    },
    'maths-page': {
        id: 'maths-page',
        firstLineY: 40,
        lineSpacing: 20,
        totalLines: 40,
        defaultFontSize: 18,
        isGrid: true,
        gridSize: 20
    },
    'yellow-pad': {
        id: 'yellow-pad',
        firstLineY: 100,
        lineSpacing: 34,
        marginLineX: 130, // Red line position based on snippet
        totalLines: 22,
        defaultFontSize: 26
    },
    'vintage': {
        id: 'vintage',
        firstLineY: 110,
        lineSpacing: 32,
        totalLines: 23,
        defaultFontSize: 24
    }
};

export const getPresetMetadata = (presetId: string): PresetLineMetadata | null => {
    return PRESET_METADATA[presetId] || null;
};
