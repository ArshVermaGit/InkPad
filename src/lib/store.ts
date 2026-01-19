import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, FontPreference } from '../types';

// Default typography values for reset
const DEFAULT_TYPOGRAPHY = {
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.5,
    wordSpacing: 4,
};

const initialState: Omit<AppState, 'reset' | 'setText' | 'setLastSaved' | 'setZoom' | 'setEditorMode' | 'setUploadedFileName' | 'setHandwritingStyle' | 'setFontSize' | 'setLetterSpacing' | 'setLineHeight' | 'setWordSpacing' | 'setPaperMaterial' | 'setPaperSize' | 'setPaperOrientation' | 'setInkColor' | 'addCustomFont' | 'removeCustomFont' | 'resetTypography' | 'setCustomPaperImage' | 'completeOnboarding' | 'completeTour' | 'setSidebarCollapsed' | 'setSettingsOpen' | 'setPaperShadow' | 'setInkBlur' | 'setResolutionQuality' | 'setPaperTilt' | 'setPaperTexture' | 'setExpandedPanels' | 'togglePanel' | 'applyPreset' | 'setIsRendering' | 'setRenderingProgress'> = {
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
    paperMaterial: 'white',
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
            applyPreset: (settings) => set((state) => ({ ...state, ...settings })),

            reset: () => set(() => initialState),
        }),
        {
            name: 'inkpad-core-storage',
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
        { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script', type: 'google' },
        { id: 'indie', name: 'Indie Flower', family: 'Indie Flower', type: 'google' },
        { id: 'shadows', name: 'Shadows Into Light', family: 'Shadows Into Light', type: 'google' },
        { id: 'patrick', name: 'Patrick Hand', family: 'Patrick Hand', type: 'google' },
        { id: 'kalam', name: 'Kalam', family: 'Kalam', type: 'google' },
        { id: 'marker', name: 'Permanent Marker', family: 'Permanent Marker', type: 'google' },
        { id: 'gloria', name: 'Gloria Hallelujah', family: 'Gloria Hallelujah', type: 'google' },
    ];
    return [...defaultFonts, ...state.customFonts];
};
