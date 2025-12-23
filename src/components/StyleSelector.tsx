import { useStore } from '../lib/store';
import type { HandwritingStyle } from '../types';

export default function StyleSelector() {
    const { handwritingStyle, setHandwritingStyle, customFonts } = useStore();

    // Basic list for the mini-dropdown in Editor sidebar
    const defaultFonts = [
        { id: 'caveat', name: 'Caveat' },
        { id: 'dancing', name: 'Dancing Script' },
        { id: 'indie', name: 'Indie Flower' },
        { id: 'shadows', name: 'Shadows Into Light' },
        { id: 'patrick', name: 'Patrick Hand' },
        { id: 'kalam', name: 'Kalam' },
        { id: 'marker', name: 'Permanent Marker' },
    ];

    return (
        <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
                Active Engine
            </label>
            <select
                value={handwritingStyle}
                onChange={(e) => setHandwritingStyle(e.target.value)}
                className="input-minimal text-xs font-bold uppercase tracking-widest"
            >
                <optgroup label="Studio Engines">
                    {defaultFonts.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </optgroup>
                {customFonts.length > 0 && (
                    <optgroup label="Custom Uploads">
                        {customFonts.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    );
}
