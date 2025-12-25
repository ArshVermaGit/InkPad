export type HandwritingStyle = string;

export interface FontPreference {
    id: string;
    name: string;
    family: string;
    type: 'google' | 'custom';
    url?: string;
}

export type PaperMaterial = 'white' | 'cream' | 'rough' | 'vintage' | 'yellow-pad';

// Page presets using JPG images from public/page_presets
export type PagePreset = 'white-page-1' | 'white-page-2' | 'white-page-3' | 'black-lines' | 'blue-lines' | 'grey-lines' | 'maths-grid' | 'yellow-pad' | 'vintage' | 'custom' | 'blue-line-page' | 'black-line-page' | 'grey-line-page' | 'maths-page';

// Legacy pattern type (kept for compatibility)
export type PaperPattern = 'none' | 'college' | 'wide' | 'narrow' | 'primary' | 'french' | 'music' | 'graph' | 'cornell' | 'dot' | 'engineer' | 'isometric' | 'hex' | 'poetry' | 'legal' | 'squared' | 'todo' | 'letter';
export type PaperSize = 'a4' | 'letter' | 'a5' | 'a6' | 'legal' | 'tabloid';
export type PaperOrientation = 'portrait' | 'landscape';

// New types from reference implementation
export type InkColorPreset = 'blue' | 'black' | 'red';
export type OutputEffect = 'none' | 'shadows' | 'scanner';
export type OutputResolution = 'very-low' | 'low' | 'normal' | 'high' | 'very-high';

export interface PaperDimensions {
    width: number;
    height: number;
}

export interface RenderingSettings {
    // Natural Variations
    letterSpacingVar: number; // ±px
    baselineVar: number; // ±px
    rotationVar: number; // ±deg

    // Pen Simulation
    thickness: number;
    pressureVar: number; // 0 to 1
    inkFlow: 'dry' | 'medium' | 'wet';
    slant: number; // -15 to 15 deg
    shakiness: number; // 0 to 1
    speed: 'rushed' | 'careful';

    // Realism Effects
    inkBleeding: boolean;
    inkBleedingIntensity: number; // 0 to 1
    paperTexture: boolean;
    penSkip: boolean;
    smudgeMarks: boolean;
    marginViolations: boolean;
    spellingErrors: boolean;
    pressureSimulation: boolean;
    edgeWear: number; // 0 to 1

    // Layout
    wordSpacing: number;
    letterSpacing: number;
    lineHeight: number;
    margins: { top: number; right: number; bottom: number; left: number };
    lineColor: string;
    lineOpacity: number;
    decorations: {
        holes: boolean;
        spiral: boolean;
        perforation: boolean;
        watermark: { enabled: boolean; text: string; opacity: number };
        corners: 'none' | 'geometric' | 'floral';
    };
    aging: {
        enabled: boolean;
        intensity: number; // Global intensity master
        sepia: number; // 0-1
        spots: number; // 0-1 density
        creases: number; // 0-1 intensity
        burnMarks: number; // 0-1 intensity
        waterStains: boolean;
        tornCorners: boolean;
        vignette: number; // 0-1 opacity
    };
}

export interface Page {
    id: string;
    text: string;
    margins?: { top: number; right: number; bottom: number; left: number };
}

export interface AppState {
    text: string;
    pages: Page[];
    currentPageIndex: number;
    handwritingStyle: HandwritingStyle;
    fontSize: number;
    inkColor: string;
    paperMaterial: PaperMaterial;
    paperPattern: PaperPattern;
    paperSize: PaperSize;
    paperOrientation: PaperOrientation;
    customFonts: FontPreference[];

    // Advanced Rendering & Customization
    settings: RenderingSettings;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    language: string;

    // View State
    zoom: number;
    rotation: number;
    showGrid: boolean;
    compareMode: boolean;
    previousText: string;
    pan: { x: number; y: number };
    showLineNumbers: boolean;

    // Onboarding State
    hasSeenOnboarding: boolean;
    hasSeenTour: boolean;

    // UI State
    isSidebarCollapsed: boolean;
    isPreviewVisible: boolean;
    isSettingsOpen: boolean;

    // Reference Features
    showPaperLines: boolean;
    showMarginLine: boolean;
    outputEffect: OutputEffect;
    outputResolution: OutputResolution;

    // Page Preset (JPG background images)
    pagePreset: PagePreset;
    customBackground: string | null; // Data URL for custom uploaded image

    // AI Humanizer State
    humanizeIntensity: number;
    isHumanizeEnabled: boolean;

    // Actions
    setText: (text: string) => void;
    setPages: (pages: (string | { id: string; text: string })[]) => void;
    setCurrentPageIndex: (index: number) => void;
    addPage: (index?: number) => void;
    removePage: (index: number) => void;
    duplicatePage: (index: number) => void;
    movePage: (from: number, to: number) => void;
    setPreviousText: (text: string) => void;
    setHandwritingStyle: (style: HandwritingStyle) => void;
    setFontSize: (size: number) => void;
    setPaperMaterial: (material: PaperMaterial) => void;
    setPaperPattern: (pattern: PaperPattern) => void;
    setPaperSize: (size: PaperSize) => void;
    setPaperOrientation: (orientation: PaperOrientation) => void;
    setInkColor: (color: string) => void;
    updateSettings: (settings: Partial<RenderingSettings>) => void;
    setPageMargins: (pageIndex: number, margins: RenderingSettings['margins']) => void;
    setQuality: (quality: AppState['quality']) => void;
    setLanguage: (lang: string) => void;
    setZoom: (zoom: number) => void;
    setRotation: (rotation: number) => void;
    setShowGrid: (show: boolean) => void;
    setCompareMode: (mode: boolean) => void;
    setPan: (pan: AppState['pan']) => void;
    toggleLineNumbers: () => void;
    addCustomFont: (font: FontPreference) => void;
    removeCustomFont: (id: string) => void;

    // Onboarding Actions
    completeOnboarding: () => void;
    completeTour: () => void;

    // UI Actions
    setSidebarCollapsed: (collapsed: boolean) => void;
    setPreviewVisible: (visible: boolean) => void;
    setSettingsOpen: (open: boolean) => void;

    // Reference Feature Actions
    setShowPaperLines: (show: boolean) => void;
    setShowMarginLine: (show: boolean) => void;
    setOutputEffect: (effect: OutputEffect) => void;
    setOutputResolution: (resolution: OutputResolution) => void;

    // Page Preset Actions
    setPagePreset: (preset: PagePreset) => void;
    setCustomBackground: (dataUrl: string | null) => void;

    // AI Humanizer Actions
    setHumanizeIntensity: (intensity: number) => void;
    toggleHumanize: () => void;
    applyHumanize: () => void;

    reset: () => void;
}
