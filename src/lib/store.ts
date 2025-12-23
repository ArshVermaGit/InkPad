import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, FontPreference, RenderingSettings } from '../types';

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
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            text: '',
            handwritingStyle: 'caveat',
            fontSize: 24,
            inkColor: '#030712',
            paperType: 'lined',
            customFonts: [],

            settings: defaultSettings,
            quality: 'medium',
            language: 'en',
            zoom: 1,
            pan: { x: 0, y: 0 },
            showLineNumbers: false,

            setText: (text) => set({ text }),
            setHandwritingStyle: (handwritingStyle) => set({ handwritingStyle }),
            setFontSize: (fontSize) => set({ fontSize }),
            setPaperType: (paperType) => set({ paperType }),
            setInkColor: (inkColor) => set({ inkColor }),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            setQuality: (quality) => set({ quality }),
            setLanguage: (language) => set({ language }),
            setZoom: (zoom) => set({ zoom }),
            setPan: (pan) => set({ pan }),
            toggleLineNumbers: () => set((state) => ({ showLineNumbers: !state.showLineNumbers })),

            addCustomFont: (font) => set((state) => ({
                customFonts: [...state.customFonts, font]
            })),

            removeCustomFont: (id) => set((state) => ({
                customFonts: state.customFonts.filter(f => f.id !== id),
                handwritingStyle: state.handwritingStyle === id ? 'caveat' : state.handwritingStyle
            })),

            reset: () => set({
                text: '',
                handwritingStyle: 'caveat',
                fontSize: 24,
                inkColor: '#030712',
                paperType: 'lined',
                customFonts: [],
                settings: defaultSettings,
                quality: 'medium',
                language: 'en',
                zoom: 1,
                pan: { x: 0, y: 0 },
                showLineNumbers: false,
            }),
        }),
        {
            name: 'inkpad-advanced-storage',
        }
    )
);
