import { useState } from 'react';
import {
    X,
    Book,
    Briefcase,
    GraduationCap,
    Heart,
    Plus,
    Check,
    Search
} from 'lucide-react';
import { useStore } from '../lib/store';
import { TEMPLATES } from '../utils/templates';
import type { Template } from '../utils/templates';

export default function TemplateLibrary({ onClose }: { onClose: () => void }) {
    const { setText, addPage, pages } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

    const filteredTemplates = TEMPLATES.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { id: 'all', name: 'All', icon: <Book size={14} /> },
        { id: 'academic', name: 'Academic', icon: <GraduationCap size={14} /> },
        { id: 'professional', name: 'Professional', icon: <Briefcase size={14} /> },
        { id: 'creative', name: 'Creative', icon: <Plus size={14} /> },
        { id: 'personal', name: 'Personal', icon: <Heart size={14} /> },
    ];

    const applyTemplate = (template: Template) => {
        const currentPage = pages[useStore.getState().currentPageIndex];
        if (currentPage.text.trim() === '') {
            setText(template.content);
        } else {
            addPage();
            setTimeout(() => {
                useStore.getState().setText(template.content);
            }, 10);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden flex flex-col rounded-3xl">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Template Library.</h2>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-1">Foundational structures for your manuscript.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="px-8 py-4 border-b border-gray-50 flex items-center gap-6 bg-gray-50/20 shrink-0">
                    <div className="flex-1 flex items-center gap-3 bg-white px-4 py-2 border border-gray-100 rounded-xl focus-within:border-black transition-colors">
                        <Search size={16} className="text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-sm font-bold focus:outline-none w-full placeholder:text-gray-200"
                        />
                    </div>
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${selectedCategory === cat.id ? 'bg-black text-white' : 'bg-white border border-gray-100 text-gray-400 hover:border-black'}`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => applyTemplate(template)}
                                    className="p-6 border border-gray-100 rounded-2xl text-left hover:border-black hover:shadow-xl transition-all group flex flex-col h-full bg-white"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                                            <Book size={18} />
                                        </div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black transition-colors border border-gray-50 rounded-lg px-2 py-1">
                                            {template.category}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">{template.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium mb-6 flex-1">{template.description}</p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/20 group-hover:text-black transition-colors">Apply Template</span>
                                        <Check size={14} className="text-transparent group-hover:text-black transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="p-6 bg-gray-50 rounded-full mb-4">
                                <Search size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-black">No templates found.</h3>
                            <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
