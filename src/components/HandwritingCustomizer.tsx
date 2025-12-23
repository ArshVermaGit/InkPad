import { useStore } from '../lib/store';
import {
    Type,
    MoveHorizontal,
    RotateCw,
    Layers,
    Droplet,
    Wind,
    ShieldCheck,
    Zap
} from 'lucide-react';

export default function HandwritingCustomizer() {
    const { settings, updateSettings, fontSize, setFontSize } = useStore();

    const Slider = ({ label, icon: Icon, value, min, max, step, onChange }: any) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    {Icon && <Icon size={12} />} {label}
                </label>
                <span className="text-[10px] font-bold text-black">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-black h-1 bg-gray-100 rounded-none appearance-none cursor-pointer"
            />
        </div>
    );

    const Toggle = ({ label, value, onChange }: any) => (
        <button
            onClick={() => onChange(!value)}
            className={`flex items-center justify-between w-full p-3 border transition-all ${value ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'
                }`}
        >
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
            <div className={`w-2 h-2 rounded-full ${value ? 'bg-white' : 'bg-gray-100'}`} />
        </button>
    );

    return (
        <div className="space-y-10">

            {/* Basic Metrics */}
            <div className="space-y-6">
                <Slider
                    label="Font Magnitude"
                    icon={Type}
                    value={fontSize}
                    min={8} max={48} step={1}
                    onChange={setFontSize}
                />
                <Slider
                    label="Pen Depth"
                    icon={Droplet}
                    value={settings.thickness}
                    min={0.5} max={3} step={0.1}
                    onChange={(v: number) => updateSettings({ thickness: v })}
                />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Human Variations */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-6">Organic Variations</h4>
                <Slider
                    label="Baseline Shift"
                    icon={Layers}
                    value={settings.baselineVar}
                    min={0} max={5} step={0.1}
                    onChange={(v: number) => updateSettings({ baselineVar: v })}
                />
                <Slider
                    label="Rotation Jitter"
                    icon={RotateCw}
                    value={settings.rotationVar}
                    min={0} max={5} step={0.1}
                    onChange={(v: number) => updateSettings({ rotationVar: v })}
                />
                <Slider
                    label="Slant Angle"
                    icon={Wind}
                    value={settings.slant}
                    min={-15} max={15} step={1}
                    onChange={(v: number) => updateSettings({ slant: v })}
                />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Spacing Controls */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Spatial Geometry</h4>
                <Slider
                    label="Letter Spacing"
                    icon={MoveHorizontal}
                    value={settings.letterSpacing}
                    min={-5} max={10} step={0.1}
                    onChange={(v: number) => updateSettings({ letterSpacing: v })}
                />
                <Slider
                    label="Word Spacing"
                    value={settings.wordSpacing}
                    min={0.5} max={4} step={0.1}
                    onChange={(v: number) => updateSettings({ wordSpacing: v })}
                />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Realism Toggles */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-6">Simulation Filters</h4>
                <div className="grid grid-cols-2 gap-2">
                    <Toggle
                        label="Ink Bleeding"
                        value={settings.inkBleeding}
                        onChange={(v: boolean) => updateSettings({ inkBleeding: v })}
                    />
                    <Toggle
                        label="Paper Texture"
                        value={settings.paperTexture}
                        onChange={(v: boolean) => updateSettings({ paperTexture: v })}
                    />
                    <Toggle
                        label="Pen Skips"
                        value={settings.penSkip}
                        onChange={(v: boolean) => updateSettings({ penSkip: v })}
                    />
                    <Toggle
                        label="Margin Errors"
                        value={settings.marginViolations}
                        onChange={(v: boolean) => updateSettings({ marginViolations: v })}
                    />
                </div>
            </div>

            <div className="pt-4">
                <div className="bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-3 text-black mb-2">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Human Mode Active</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                        Settings are being modulated by a Perlin noise engine to prevent repeating patterns.
                    </p>
                </div>
            </div>
        </div>
    );
}
