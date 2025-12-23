export type HandwritingStyle = 'cursive' | 'script' | 'print';

export type PaperType = 'blank' | 'lined' | 'grid';

export type ExportFormat = 'pdf' | 'png' | 'jpg';

export interface AppState {
    text: string;
    handwritingStyle: HandwritingStyle;
    fontSize: number;
    lineSpacing: number;
    paperType: PaperType;
    inkColor: string;
    setText: (text: string) => void;
    setHandwritingStyle: (style: HandwritingStyle) => void;
    setFontSize: (size: number) => void;
    setLineSpacing: (spacing: number) => void;
    setPaperType: (type: PaperType) => void;
    setInkColor: (color: string) => void;
    reset: () => void;
}
