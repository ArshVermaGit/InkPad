import { useState } from 'react';
import { useStore, getAvailableFonts } from '../lib/store';
import {
    Type,
    Layers,
    Maximize2,
    Settings,
    Wand2,
    Trash2,
    Copy,
    FolderOpen,
    Save,
    Plus,
    ChevronRight,
    Search,
    Clock,
    Heart,
    Palette,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PagePreset, HandwritingStyle } from '../types';

export default function EditorSidebar() {
    const state = useStore();
    const [activeTab, setActiveTab] = useState<'font' | 'paper' | 'effects' | 'ai' | 'layout'>('font');

    const {
        handwritingStyle,
        setHandwritingStyle,
        fontSize,
        setFontSize,
        inkColor,
        setInkColor,
        pagePreset,
        setPagePreset,
        settings,
        updateSettings,
        pages,
        currentPageIndex,
        setCurrentPageIndex,
        addPage,
        removePage,
        duplicatePage,
        isHumanizeEnabled,
        toggleHumanize,
        humanizeIntensity,
        setHumanizeIntensity
    } = state;

    const fonts = getAvailableFonts(state);

    const tabs = [
        { id: 'font', label: 'Style', icon: Type },
        { id: 'paper', label: 'Paper', icon: Layers },
        { id: 'layout', label: 'Layout', icon: Maximize2 },
        { id: 'ai', label: 'AI Tools', icon: Wand2 },
        { id: 'effects', label: 'Effects', icon: Palette }
    ];

    const presets: { id: PagePreset; label: string; preview: string }[] = [
        { id: 'white-page-1', label: 'Plain White', preview: '#ffffff' },
        { id: 'blue-line-page', label: 'Blue Lines', preview: '#eff6ff' },
        { id: 'black-line-page', label: 'Black Lines', preview: '#f3f4f6' },
        { id: 'grey-line-page', label: 'Grey Lines', preview: '#f9fafb' },
        { id: 'maths-page', label: 'Maths Grid', preview: '#f0fdf4' },
        { id: 'yellow-pad', label: 'Yellow Pad', preview: '#ffffcc' },
        { id: 'vintage', label: 'Vintage', preview: '#f4e8d0' }
    ];

    return (
        <div className="w-[380px] h-full flex flex-col bg-white border-r border-gray-100 relative z-20">
            {/* Top Toolbar */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                        <Plus size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tight">INKPAD <span className="text-gray-300 font-light">∞</span></span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-black">
                        <FolderOpen size={18} />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-black">
                        <Save size={18} />
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex px-4 py-3 bg-gray-50/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all ${activeTab === tab.id
                            ? 'bg-white shadow-sm text-black border border-gray-100'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'font' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                            <Search size={14} className="text-gray-400" />
                                            Select Hand
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Heart size={14} className="text-gray-300 pointer-events-none" />
                                            <Clock size={14} className="text-gray-300 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {fonts.map((font) => (
                                            <button
                                                key={font.id}
                                                onClick={() => setHandwritingStyle(font.id as HandwritingStyle)}
                                                className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${handwritingStyle === font.id
                                                    ? 'border-black bg-black text-white shadow-lg'
                                                    : 'border-gray-100 bg-white hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className={`text-lg mb-0.5 ${handwritingStyle === font.id ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: font.family }}>
                                                        {font.name}
                                                    </span>
                                                    <span className={`text-[9px] uppercase tracking-widest font-bold ${handwritingStyle === font.id ? 'text-white/50' : 'text-gray-400'}`}>
                                                        Natural {font.type}
                                                    </span>
                                                </div>
                                                {handwritingStyle === font.id && (
                                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                                        <ChevronRight size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span>Ink Color</span>
                                            <span className="text-gray-900">{inkColor.toUpperCase()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {['#1e40af', '#000000', '#4b5563', '#991b1b', '#065f46'].map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setInkColor(color)}
                                                    className={`w-10 h-10 rounded-full border-4 transition-all ${inkColor === color ? 'border-gray-100 scale-110' : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span>Text Size</span>
                                            <span className="text-gray-900">{fontSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="12"
                                            max="48"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                        />
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'paper' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                                        <Layers size={14} className="text-gray-400" />
                                        Paper Preset
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {presets.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setPagePreset(preset.id)}
                                                className={`flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left ${pagePreset === preset.id
                                                    ? 'border-black bg-white shadow-md'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div
                                                    className="w-full aspect-[4/3] rounded-lg shadow-inner border border-gray-100"
                                                    style={{ backgroundColor: preset.preview }}
                                                />
                                                <span className="text-[11px] font-black uppercase tracking-tighter text-gray-900">
                                                    {preset.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">Pagination</h3>
                                    <div className="space-y-2">
                                        {pages.map((page, idx) => (
                                            <div
                                                key={page.id}
                                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${currentPageIndex === idx ? 'bg-black text-white' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => setCurrentPageIndex(idx)}
                                                    className="flex-1 text-left"
                                                >
                                                    <span className="text-[10px] font-bold uppercase block opacity-50">Page</span>
                                                    <span className="font-black">Sheet #0{idx + 1}</span>
                                                </button>
                                                <div className="flex gap-2">
                                                    <button onClick={() => duplicatePage(idx)} className="p-1 hover:text-blue-400">
                                                        <Copy size={16} />
                                                    </button>
                                                    <button onClick={() => removePage(idx)} className="p-1 hover:text-red-400">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addPage()}
                                            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-black hover:border-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            <span className="font-bold text-xs uppercase tracking-widest">Add New Sheet</span>
                                        </button>
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'layout' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                        <Maximize2 size={14} className="text-gray-400" />
                                        Margins & Spacing
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>Top Margin</span>
                                                <span className="text-gray-900">{settings.margins.top}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="200"
                                                value={settings.margins.top}
                                                onChange={(e) => updateSettings({ margins: { ...settings.margins, top: parseInt(e.target.value) } })}
                                                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>Left Margin</span>
                                                <span className="text-gray-900">{settings.margins.left}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="20"
                                                max="200"
                                                value={settings.margins.left}
                                                onChange={(e) => updateSettings({ margins: { ...settings.margins, left: parseInt(e.target.value) } })}
                                                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>Line Spacing</span>
                                                <span className="text-gray-900">{settings.lineHeight}x</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.1"
                                                value={settings.lineHeight}
                                                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                        {activeTab === 'ai' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <section className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                                    <Wand2 size={32} className="mb-4 text-purple-200" />
                                    <h2 className="text-xl font-black mb-2">AI Humanizer</h2>
                                    <p className="text-[11px] text-white/70 font-medium leading-relaxed mb-6">
                                        Transform rigid AI text into natural, flowing handwriting with intentional human-like imperfections.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                                            <span className="text-xs font-bold uppercase tracking-widest">Enable AI Engine</span>
                                            <button
                                                onClick={toggleHumanize}
                                                className={`w-12 h-6 rounded-full transition-all relative ${isHumanizeEnabled ? 'bg-green-400' : 'bg-white/20'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isHumanizeEnabled ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                                <span>Human Variance</span>
                                                <span>{Math.round(humanizeIntensity * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={humanizeIntensity}
                                                onChange={(e) => setHumanizeIntensity(parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                            />
                                        </div>

                                        <p className="text-[9px] text-white/50 italic text-center">
                                            "A bridge between artificial perfection and natural beauty."
                                        </p>
                                    </div>
                                </section>

                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest flex items-center gap-2">
                                        <History size={14} />
                                        Smart Suggestions
                                    </h4>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        Higher intensity adds more typos, crossed-out words, and uneven baselines for maximum realism.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'effects' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-8"
                            >
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                        <Palette size={14} className="text-gray-400" />
                                        Ink & Pressure
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tighter">Multi-Path Bleeding</span>
                                            <button
                                                onClick={() => updateSettings({ inkBleeding: !settings.inkBleeding })}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${settings.inkBleeding ? 'bg-black' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.inkBleeding ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {settings.inkBleeding && (
                                            <div>
                                                <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    <span>Bleeding Intensity</span>
                                                    <span className="text-gray-900">{(settings.inkBleedingIntensity * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={settings.inkBleedingIntensity}
                                                    onChange={(e) => updateSettings({ inkBleedingIntensity: parseFloat(e.target.value) })}
                                                    className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tighter">Pressure Simulation</span>
                                            <button
                                                onClick={() => updateSettings({ pressureSimulation: !settings.pressureSimulation })}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${settings.pressureSimulation ? 'bg-black' : 'bg-gray-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.pressureSimulation ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        Paper Realism
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <span>Edge Wear & Fraying</span>
                                                <span className="text-gray-900">{(settings.edgeWear * 100).toFixed(0)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={settings.edgeWear}
                                                onChange={(e) => updateSettings({ edgeWear: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Paper Grain', key: 'paperTexture' },
                                                { label: 'Pen Skips', key: 'penSkip' },
                                                { label: 'Smudge Marks', key: 'smudgeMarks' },
                                                { label: 'Spiral Bound', key: 'spiral' },
                                                { label: 'Hole Punches', key: 'holes' }
                                            ].map((effect) => {
                                                const isActive = effect.key === 'spiral' || effect.key === 'holes'
                                                    ? (settings.decorations as any)[effect.key]
                                                    : (settings as any)[effect.key];

                                                return (
                                                    <button
                                                        key={effect.key}
                                                        onClick={() => {
                                                            if (effect.key === 'spiral' || effect.key === 'holes') {
                                                                updateSettings({ decorations: { ...settings.decorations, [effect.key]: !isActive } });
                                                            } else {
                                                                updateSettings({ [effect.key]: !isActive });
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${isActive
                                                            ? 'border-black bg-black text-white shadow-sm'
                                                            : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-100 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-center">{effect.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3 text-gray-400 mb-4">
                    <Settings size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Engine v5.2</span>
                </div>
                <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm hover:shadow-md transition-all">
                        Reset
                    </button>
                    <button className="flex-1 py-3 bg-black rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-black/20 hover:scale-[1.02] transition-all">
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
