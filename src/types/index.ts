export type HandwritingStyle = string;

export interface FontPreference {
    id: string;
    name: string;
    family: string;
    type: 'google' | 'custom';
    url?: string;
}

export type PaperMaterial = 'white' | 'ruled' | 'graph' | 'dotted' | 'vintage' | 'aged' | 'cream' | 'college' | 'wide' | 'love-letter' | 'birthday' | 'christmas' | 'professional' | 'custom';
export type PaperSize = 'a4' | 'letter' | 'a5' | 'a6' | 'legal' | 'tabloid';
export type PaperOrientation = 'portrait' | 'landscape';

export type ToastType = 'success' | 'error' | 'info';

export interface AppState {
    text: string;
    lastSaved: Date | null;
    zoom: number;
    editorMode: 'plain' | 'rich';
    uploadedFileName: string | null;
    handwritingStyle: HandwritingStyle;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    wordSpacing: number;
    inkColor: string;
    paperMaterial: PaperMaterial;
    paperSize: PaperSize;
    paperOrientation: PaperOrientation;
    customFonts: FontPreference[];
    customPaperImage: string | null;
    hasSeenOnboarding: boolean;
    hasSeenTour: boolean;

    // Visual Effects
    paperShadow: boolean;
    inkBlur: number;
    resolutionQuality: number;
    paperTilt: boolean;
    paperTexture: boolean;

    // UI State
    isSidebarCollapsed: boolean;
    isSettingsOpen: boolean;
    isRendering: boolean;
    renderingProgress: number;
    expandedPanels: string[];

    // Actions
    setText: (text: string) => void;
    setLastSaved: (date: Date | null) => void;
    setZoom: (zoom: number) => void;
    setEditorMode: (mode: 'plain' | 'rich') => void;
    setUploadedFileName: (name: string | null) => void;
    setHandwritingStyle: (style: HandwritingStyle) => void;
    setFontSize: (size: number) => void;
    setLetterSpacing: (spacing: number) => void;
    setLineHeight: (height: number) => void;
    setWordSpacing: (spacing: number) => void;
    setPaperMaterial: (material: PaperMaterial) => void;
    setPaperSize: (size: PaperSize) => void;
    setPaperOrientation: (orientation: PaperOrientation) => void;
    setInkColor: (color: string) => void;
    addCustomFont: (font: FontPreference) => void;
    removeCustomFont: (id: string) => void;
    resetTypography: () => void;
    setCustomPaperImage: (image: string | null) => void;

    // Visual Effects Actions
    setPaperShadow: (enabled: boolean) => void;
    setInkBlur: (value: number) => void;
    setResolutionQuality: (value: number) => void;
    setPaperTilt: (enabled: boolean) => void;
    setPaperTexture: (enabled: boolean) => void;

    // Onboarding Actions
    completeOnboarding: () => void;
    completeTour: () => void;

    // UI Actions
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    setExpandedPanels: (panels: string[]) => void;
    togglePanel: (panel: string) => void;
    setIsRendering: (isRendering: boolean) => void;
    setRenderingProgress: (progress: number) => void;
    applyPreset: (settings: Partial<AppState>) => void;

    reset: () => void;
}
