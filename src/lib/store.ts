import { create } from 'zustand';
import type { AppState } from '../types';

const initialState = {
    text: '',
    handwritingStyle: 'cursive' as const,
    fontSize: 24,
    lineSpacing: 1.5,
    paperType: 'lined' as const,
    inkColor: '#1f2937',
};

export const useStore = create<AppState>((set) => ({
    ...initialState,
    setText: (text) => set({ text }),
    setHandwritingStyle: (handwritingStyle) => set({ handwritingStyle }),
    setFontSize: (fontSize) => set({ fontSize }),
    setLineSpacing: (lineSpacing) => set({ lineSpacing }),
    setPaperType: (paperType) => set({ paperType }),
    setInkColor: (inkColor) => set({ inkColor }),
    reset: () => set(initialState),
}));
