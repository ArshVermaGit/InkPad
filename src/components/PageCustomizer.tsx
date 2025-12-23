import { useStore } from '../lib/store';
import type { PaperType } from '../types';

export default function PageCustomizer() {
    const {
        fontSize,
        lineSpacing,
        paperType,
        inkColor,
        setFontSize,
        setLineSpacing,
        setPaperType,
        setInkColor,
    } = useStore();

    const inkColors = [
        { value: '#030712', label: 'Noir' },
        { value: '#1f2937', label: 'Graphite' },
        { value: '#4b5563', label: 'Stone' },
        { value: '#6b7280', label: 'Gray' },
    ];

    return (
        <div className="space-y-6">
            {/* Font Size */}
            <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                    Font Size: {fontSize}px
                </label>
                <input
                    type="range"
                    min="16"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-ink-200 rounded-lg appearance-none cursor-pointer accent-ink-900"
                />
            </div>

            {/* Line Spacing */}
            <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                    Line Spacing: {lineSpacing.toFixed(1)}
                </label>
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-ink-200 rounded-lg appearance-none cursor-pointer accent-ink-900"
                />
            </div>

            {/* Paper Type */}
            <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                    Paper Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {(['blank', 'lined', 'grid'] as PaperType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setPaperType(type)}
                            className={`py-2 px-3 rounded-md border text-sm font-medium capitalize transition-all ${paperType === type
                                    ? 'border-ink-900 bg-ink-900 text-white shadow-sm'
                                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ink Color */}
            <div>
                <label className="block text-sm font-medium text-ink-900 mb-2">
                    Ink Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {inkColors.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => setInkColor(color.value)}
                            className={`py-2 px-3 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-2 ${inkColor === color.value
                                    ? 'border-ink-900 bg-ink-900 text-white shadow-sm'
                                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full border border-ink-300"
                                style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
