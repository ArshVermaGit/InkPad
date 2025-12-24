import { useStore } from '../lib/store';
import { Reorder } from 'framer-motion';
import {
    Trash2,
    Copy,
    Plus,
    GripVertical,
    FileText
} from 'lucide-react';

export default function PageNavigator() {
    const {
        pages,
        currentPageIndex,
        setCurrentPageIndex,
        addPage,
        removePage,
        duplicatePage,
        setPages
    } = useStore();

    return (
        <div className="flex flex-col h-full bg-gray-50 border-r border-gray-100 w-64 shrink-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white shrink-0 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Manuscript</h3>
                <button
                    onClick={() => addPage()}
                    className="p-1.5 hover:bg-gray-100 rounded-none transition-colors text-gray-400 hover:text-black"
                    title="Add Page at End"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                <Reorder.Group
                    axis="y"
                    values={pages as any}
                    onReorder={setPages}
                    className="space-y-4"
                >
                    {pages.map((page, index) => (
                        <div key={page.id} className="relative">
                            {/* Insert Before Button (only for first item or visual clarity) */}
                            {index === 0 && (
                                <button
                                    onClick={() => addPage(0)}
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 bg-black text-white p-1 rounded-full z-10 transition-opacity"
                                    title="Insert Page Here"
                                >
                                    <Plus size={10} />
                                </button>
                            )}

                            <Reorder.Item
                                value={page}
                                className={`group relative border transition-all cursor-pointer ${currentPageIndex === index
                                    ? 'bg-black text-white border-black ring-4 ring-black/5'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                <div
                                    onClick={() => setCurrentPageIndex(index)}
                                    className="p-4 flex flex-col gap-3 min-h-[140px]"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${currentPageIndex === index ? 'text-gray-500' : 'text-gray-300'
                                            }`}>
                                            PAGE {index + 1}
                                        </span>
                                        <GripVertical size={12} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                                    </div>

                                    <div className="flex-1 overflow-hidden">
                                        <p className={`text-[9px] leading-relaxed line-clamp-6 font-medium ${currentPageIndex === index ? 'text-gray-300' : 'text-gray-400'
                                            }`}>
                                            {page.text || "Empty sheet..."}
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                                            className={`p-1.5 hover:bg-gray-100/10 rounded-none ${currentPageIndex === index ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            <Copy size={10} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removePage(index); }}
                                            className={`p-1.5 hover:bg-gray-100/10 rounded-none ${currentPageIndex === index ? 'hover:text-red-400' : 'hover:text-red-500 hover:bg-red-50'
                                                }`}
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            </Reorder.Item>

                            {/* Insert After Button */}
                            <button
                                onClick={() => addPage(index + 1)}
                                className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 bg-black text-white p-1 rounded-full z-10 transition-opacity"
                                title="Insert Page Here"
                            >
                                <Plus size={10} />
                            </button>
                        </div>
                    ))}
                </Reorder.Group>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-3 text-black">
                    <FileText size={14} className="text-gray-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {pages.length} {pages.length === 1 ? 'Sheet' : 'Sheets'} Compiled
                    </span>
                </div>
            </div>
        </div>
    );
}
