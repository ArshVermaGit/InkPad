import { motion } from 'framer-motion';
import { LayoutGrid, FileText, Square, Grid } from 'lucide-react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import type { PaperType } from '../types';

export default function GalleryPage() {
    const { setPaperType } = useStore();
    const navigate = useNavigate();

    const templates = [
        { name: 'Lined Classic', type: 'lined' as PaperType, icon: <FileText className="w-8 h-8" /> },
        { name: 'Pure White', type: 'blank' as PaperType, icon: <Square className="w-8 h-8" /> },
        { name: 'Grid Master', type: 'grid' as PaperType, icon: <Grid className="w-8 h-8" /> },
        { name: 'Technical Sheet', type: 'grid' as PaperType, icon: <LayoutGrid className="w-8 h-8" /> },
    ];

    const handleSelect = (type: PaperType) => {
        setPaperType(type);
        navigate('/editor');
    };

    return (
        <div className="section-padding bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-2xl mb-24">
                    <h1 className="text-5xl md:text-7xl mb-8 tracking-tighter">Paper Gallery.</h1>
                    <p className="text-gray-500 text-xl font-medium">
                        Select a specialized paper layout for your handwritten document.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {templates.map((template, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            onClick={() => handleSelect(template.type)}
                            className="group cursor-pointer"
                        >
                            <div className="card-premium aspect-[3/4] flex flex-col items-center justify-center p-12 border-2 border-transparent group-hover:border-black transition-all duration-500">
                                <div className="mb-8 text-gray-300 group-hover:text-black transition-colors duration-500">
                                    {template.icon}
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-center">{template.name}</h3>
                                <div className="mt-8 overflow-hidden h-1 w-0 group-hover:w-full bg-black transition-all duration-500" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
