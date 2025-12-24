import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, FontPreference, RenderingSettings, OutputEffect, OutputResolution, PagePreset } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 11);

const defaultFonts: FontPreference[] = [
    { id: 'caveat', name: 'Caveat', family: 'Caveat', type: 'google' },
    { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script', type: 'google' },
    { id: 'indie', name: 'Indie Flower', family: 'Indie Flower', type: 'google' },
    { id: 'shadows', name: 'Shadows Into Light', family: 'Shadows Into Light', type: 'google' },
    { id: 'patrick', name: 'Patrick Hand', family: 'Patrick Hand', type: 'google' },
    { id: 'kalam', name: 'Kalam', family: 'Kalam', type: 'google' },
    { id: 'marker', name: 'Permanent Marker', family: 'Permanent Marker', type: 'google' },
];

const defaultSettings: RenderingSettings = {
    letterSpacingVar: 1,
    baselineVar: 0.5,
    rotationVar: 1,
    thickness: 1.2,
    pressureVar: 0.2,
    inkFlow: 'medium',
    slant: 0,
    shakiness: 0.1,
    speed: 'careful',
    inkBleeding: false,
    paperTexture: true,
    penSkip: false,
    smudgeMarks: false,
    marginViolations: false,
    spellingErrors: false,
    wordSpacing: 1.5,
    letterSpacing: 1.0,
    lineHeight: 1.5,
    margins: { top: 60, right: 60, bottom: 60, left: 60 },
    lineColor: '#e5e7eb',
    lineOpacity: 0.6,
    decorations: {
        holes: false,
        spiral: false,
        perforation: false,
        watermark: { enabled: false, text: 'InkPad Draft', opacity: 0.1 },
        corners: 'none',
    },
    aging: {
        enabled: false,
        intensity: 0.5,
        sepia: 0.2,
        spots: 0.3,
        creases: 0.2,
        burnMarks: 0,
        waterStains: false,
        tornCorners: false,
        vignette: 0
    },
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            text: '',
            pages: [{ id: generateId(), text: '' }],
            currentPageIndex: 0,
            handwritingStyle: 'caveat',
            fontSize: 24,
            inkColor: '#030712',
            paperMaterial: 'white',
            paperPattern: 'none',
            paperSize: 'a4',
            paperOrientation: 'portrait',
            customFonts: [],

            settings: defaultSettings,
            quality: 'medium',
            language: 'en',
            zoom: 1,
            rotation: 0,
            showGrid: false,
            compareMode: false,
            previousText: '',
            pan: { x: 0, y: 0 },
            showLineNumbers: false,

            hasSeenOnboarding: false,
            hasSeenTour: false,
            isSidebarCollapsed: false,
            isPreviewVisible: true,
            isSettingsOpen: false,

            // Reference Features
            showPaperLines: true,
            showMarginLine: true,
            outputEffect: 'none' as OutputEffect,
            outputResolution: 'normal' as OutputResolution,

            // Page Presets
            pagePreset: 'white-page-1' as PagePreset,
            customBackground: null,

            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
            setPreviewVisible: (visible) => set({ isPreviewVisible: visible }),
            setSettingsOpen: (open) => set({ isSettingsOpen: open }),

            setText: (text) => set((state) => {
                const newPages = [...state.pages];
                newPages[state.currentPageIndex] = { ...newPages[state.currentPageIndex], text };
                return { text, pages: newPages };
            }),

            setPages: (inputPages) => set((state) => {
                const normalizedPages = inputPages.map(p =>
                    typeof p === 'string' ? { id: generateId(), text: p } : p
                );
                return {
                    pages: normalizedPages,
                    text: normalizedPages[state.currentPageIndex]?.text || ''
                };
            }),

            setCurrentPageIndex: (index) => set((state) => ({
                currentPageIndex: index,
                text: state.pages[index]?.text || ''
            })),

            addPage: (index) => set((state) => {
                const newPages = [...state.pages];
                const targetIndex = index !== undefined ? index : state.pages.length;
                newPages.splice(targetIndex, 0, { id: generateId(), text: '' });
                return {
                    pages: newPages,
                    currentPageIndex: targetIndex,
                    text: ''
                };
            }),

            removePage: (index) => set((state) => {
                if (state.pages.length <= 1) return state;
                const newPages = state.pages.filter((_, i) => i !== index);
                const nextIndex = Math.min(state.currentPageIndex, newPages.length - 1);
                return {
                    pages: newPages,
                    currentPageIndex: nextIndex,
                    text: newPages[nextIndex].text
                };
            }),

            duplicatePage: (index) => set((state) => {
                const newPages = [...state.pages];
                newPages.splice(index + 1, 0, { id: generateId(), text: state.pages[index].text });
                return {
                    pages: newPages,
                    currentPageIndex: index + 1,
                    text: state.pages[index].text
                };
            }),

            movePage: (from, to) => set((state) => {
                const newPages = [...state.pages];
                const [moved] = newPages.splice(from, 1);
                newPages.splice(to, 0, moved);
                const newCurrentIndex = state.currentPageIndex === from ? to :
                    (state.currentPageIndex > from && state.currentPageIndex <= to ? state.currentPageIndex - 1 :
                        (state.currentPageIndex < from && state.currentPageIndex >= to ? state.currentPageIndex + 1 : state.currentPageIndex));
                return {
                    pages: newPages,
                    currentPageIndex: newCurrentIndex
                };
            }),

            setPreviousText: (previousText) => set({ previousText }),
            setHandwritingStyle: (handwritingStyle) => set({ handwritingStyle }),
            setFontSize: (fontSize) => set({ fontSize }),
            setPaperMaterial: (paperMaterial) => set({ paperMaterial }),
            setPaperPattern: (paperPattern) => set({ paperPattern }),
            setPaperSize: (paperSize) => set({ paperSize }),
            setPaperOrientation: (paperOrientation) => set({ paperOrientation }),
            setInkColor: (inkColor) => set({ inkColor }),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            setQuality: (quality) => set({ quality }),
            setLanguage: (language) => set({ language }),
            setZoom: (zoom) => set({ zoom }),
            setRotation: (rotation) => set({ rotation }),
            setShowGrid: (showGrid) => set({ showGrid }),
            setCompareMode: (compareMode) => set({ compareMode }),
            setPan: (pan) => set({ pan }),
            toggleLineNumbers: () => set((state) => ({ showLineNumbers: !state.showLineNumbers })),

            addCustomFont: (font) => set((state) => ({
                customFonts: [...state.customFonts, font]
            })),

            removeCustomFont: (id) => set((state) => ({
                customFonts: state.customFonts.filter(f => f.id !== id),
                handwritingStyle: state.handwritingStyle === id ? 'caveat' : state.handwritingStyle
            })),

            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            completeTour: () => set({ hasSeenTour: true }),

            // Reference Feature Actions
            setShowPaperLines: (showPaperLines) => set({ showPaperLines }),
            setShowMarginLine: (showMarginLine) => set({ showMarginLine }),
            setOutputEffect: (outputEffect) => set({ outputEffect }),
            setOutputResolution: (outputResolution) => set({ outputResolution }),

            // Page Preset Actions
            setPagePreset: (pagePreset) => set({ pagePreset }),
            setCustomBackground: (customBackground) => set({ customBackground }),

            reset: () => set({
                text: '',
                pages: [{ id: generateId(), text: '' }],
                currentPageIndex: 0,
                handwritingStyle: 'caveat',
                fontSize: 24,
                inkColor: '#030712',
                paperMaterial: 'white',
                paperPattern: 'none',
                paperSize: 'a4',
                paperOrientation: 'portrait',
                customFonts: [],
                settings: defaultSettings,
                quality: 'medium',
                language: 'en',
                zoom: 1,
                rotation: 0,
                showGrid: false,
                compareMode: false,
                previousText: '',
                pan: { x: 0, y: 0 },
                showLineNumbers: false,
                hasSeenOnboarding: false,
                hasSeenTour: false,
                isSidebarCollapsed: false,
                isPreviewVisible: true,
                isSettingsOpen: false,
                showPaperLines: true,
                showMarginLine: true,
                outputEffect: 'none' as OutputEffect,
                outputResolution: 'normal' as OutputResolution,
                pagePreset: 'white-page-1' as PagePreset,
                customBackground: null,
            }),
        }),
        {
            name: 'inkpad-advanced-storage',
        }
    )
);

export const getAvailableFonts = (state: AppState) => {
    return [...defaultFonts, ...state.customFonts];
};
