import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, FontPreference } from '../types';

// Default typography values for reset
const DEFAULT_TYPOGRAPHY = {
    fontSize: 28,
    letterSpacing: 0,
    lineHeight: 1.5,
    wordSpacing: 4,
};

export interface HistoryItem {
    id: string;
    timestamp: number;
    text: string;
}

const initialState: Omit<AppState, 'reset' | 'setText' | 'setLastSaved' | 'setZoom' | 'setEditorMode' | 'setUploadedFileName' | 'setHandwritingStyle' | 'setFontSize' | 'setLetterSpacing' | 'setLineHeight' | 'setWordSpacing' | 'setPaperMaterial' | 'setPaperSize' | 'setPaperOrientation' | 'setInkColor' | 'addCustomFont' | 'removeCustomFont' | 'resetTypography' | 'setCustomPaperImage' | 'completeOnboarding' | 'completeTour' | 'setSidebarCollapsed' | 'setSettingsOpen' | 'setPaperShadow' | 'setInkBlur' | 'setResolutionQuality' | 'setPaperTilt' | 'setPaperTexture' | 'setExpandedPanels' | 'togglePanel' | 'applyPreset' | 'setIsRendering' | 'setRenderingProgress' | 'setNavbarVisible' | 'addToHistory' | 'setJitter' | 'setPressure' | 'setSmudge' | 'setBaseline' | 'setTextAlign' | 'setMargins' | 'setPageOptions'> = {
    text: '',
    lastSaved: null,
    zoom: 1,
    editorMode: 'plain',
    uploadedFileName: null,
    handwritingStyle: 'caveat',
    fontSize: DEFAULT_TYPOGRAPHY.fontSize,
    letterSpacing: DEFAULT_TYPOGRAPHY.letterSpacing,
    lineHeight: DEFAULT_TYPOGRAPHY.lineHeight,
    wordSpacing: DEFAULT_TYPOGRAPHY.wordSpacing,
    inkColor: '#1e40af',
    paperMaterial: 'ruled',
    paperSize: 'a4',
    paperOrientation: 'portrait',
    customFonts: [],
    customPaperImage: null,
    // Visual Effects Defaults
    paperShadow: true,
    inkBlur: 0,
    resolutionQuality: 2,
    paperTilt: false,
    paperTexture: true,
    hasSeenOnboarding: false,
    hasSeenTour: false,
    isSidebarCollapsed: false,
    isSettingsOpen: false,
    isRendering: false,
    renderingProgress: 0,
    expandedPanels: ['handwriting', 'typography', 'paper', 'effects'],
    isNavbarVisible: true,
    history: [],
    
    // Editor Refinements
    jitter: 0,
    pressure: 0,
    smudge: 0,
    baseline: -1,
    textAlign: 'left',
    marginTop: 60,
    marginBottom: 60,
    marginLeft: 70,
    marginRight: 25,
    showPageNumbers: false,
    showHeader: false,
    headerText: '',
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            ...initialState,

            // Actions
            setText: (text) => set({ text }),
            setLastSaved: (lastSaved) => set({ lastSaved }),
            setZoom: (zoom) => set({ zoom }),
            setEditorMode: (editorMode) => set({ editorMode }),
            setUploadedFileName: (uploadedFileName) => set({ uploadedFileName }),
            setHandwritingStyle: (handwritingStyle) => set({ handwritingStyle }),
            setFontSize: (fontSize) => set({ fontSize }),
            setLetterSpacing: (letterSpacing) => set({ letterSpacing }),
            setLineHeight: (lineHeight) => set({ lineHeight }),
            setWordSpacing: (wordSpacing) => set({ wordSpacing }),
            setPaperMaterial: (paperMaterial) => set({ paperMaterial }),
            setPaperSize: (paperSize) => set({ paperSize }),
            setPaperOrientation: (paperOrientation) => set({ paperOrientation }),
            setInkColor: (inkColor) => set({ inkColor }),

            addCustomFont: (font) => set((state) => ({ customFonts: [...state.customFonts, font] })),
            removeCustomFont: (id) => set((state) => ({ customFonts: state.customFonts.filter(f => f.id !== id) })),
            resetTypography: () => set({ ...DEFAULT_TYPOGRAPHY }),
            setCustomPaperImage: (customPaperImage) => set({ customPaperImage }),
            
            // Visual Effects Actions
            setPaperShadow: (paperShadow) => set({ paperShadow }),
            setInkBlur: (inkBlur) => set({ inkBlur }),
            setResolutionQuality: (resolutionQuality) => set({ resolutionQuality }),
            setPaperTilt: (paperTilt) => set({ paperTilt }),
            setPaperTexture: (paperTexture) => set({ paperTexture }),

            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            completeTour: () => set({ hasSeenTour: true }),
            setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
            setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
            setExpandedPanels: (expandedPanels) => set({ expandedPanels }),
            togglePanel: (panel) => set((state) => ({
                expandedPanels: state.expandedPanels.includes(panel)
                    ? state.expandedPanels.filter(p => p !== panel)
                    : [...state.expandedPanels, panel]
            })),
            setIsRendering: (isRendering) => set({ isRendering }),
            setRenderingProgress: (renderingProgress) => set({ renderingProgress }),
            setNavbarVisible: (isNavbarVisible) => set({ isNavbarVisible }),
            applyPreset: (settings) => set((state) => ({ ...state, ...settings })),
            addToHistory: (item) => set((state) => ({ 
                history: [item, ...state.history].slice(0, 50) // Keep last 50 items
            })),

            // Editor Refinement Actions
            setJitter: (jitter) => set({ jitter }),
            setPressure: (pressure) => set({ pressure }),
            setSmudge: (smudge) => set({ smudge }),
            setBaseline: (baseline) => set({ baseline }),
            setTextAlign: (textAlign) => set({ textAlign }),
            setMargins: (margins) => set((state) => ({
                marginTop: margins.top ?? state.marginTop,
                marginBottom: margins.bottom ?? state.marginBottom,
                marginLeft: margins.left ?? state.marginLeft,
                marginRight: margins.right ?? state.marginRight,
            })),
            setPageOptions: (options) => set((state) => ({
                showPageNumbers: options.showPageNumbers ?? state.showPageNumbers,
                showHeader: options.showHeader ?? state.showHeader,
                headerText: options.headerText ?? state.headerText,
            })),

            reset: () => set(() => initialState),
        }),
        {
            name: 'handwritten-core-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const data = JSON.parse(str);
                    if (data.state.lastSaved) data.state.lastSaved = new Date(data.state.lastSaved);
                    return data;
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => localStorage.removeItem(name),
            }
        }
    )
);

export const getAvailableFonts = (state: AppState) => {
    const defaultFonts: FontPreference[] = [
        { id: 'caveat', name: 'Caveat', family: 'Caveat', type: 'google' },
        { id: 'gloria-hallelujah', name: 'Gloria Hallelujah', family: 'Gloria Hallelujah', type: 'google' },
        { id: 'indie-flower', name: 'Indie Flower', family: 'Indie Flower', type: 'google' },
        { id: 'shadows-into-light', name: 'Shadows Into Light', family: 'Shadows Into Light', type: 'google' },
        { id: 'patrick-hand', name: 'Patrick Hand', family: 'Patrick Hand', type: 'google' },
        { id: 'permanent-marker', name: 'Permanent Marker', family: 'Permanent Marker', type: 'google' },
        { id: 'kalam', name: 'Kalam', family: 'Kalam', type: 'google' },
        { id: 'homemade-apple', name: 'Homemade Apple', family: 'Homemade Apple', type: 'google' },
        { id: 'reenie-beanie', name: 'Reenie Beanie', family: 'Reenie Beanie', type: 'google' },
        { id: 'nothing-you-could-do', name: 'Nothing You Could Do', family: 'Nothing You Could Do', type: 'google' },
    ];
    return [...defaultFonts, ...state.customFonts];
};
