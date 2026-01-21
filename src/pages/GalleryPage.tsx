import { motion } from 'framer-motion';
import { LayoutGrid, FileText, Square, Grid } from 'lucide-react';

export default function GalleryPage() {
    const templates = [
        { name: 'Heritage Lined', icon: <FileText className="w-10 h-10" />, desc: 'Standard ruled paper with a vintage soul.' },
        { name: 'Ivory Parchment', icon: <Square className="w-10 h-10" />, desc: 'Smooth, unlined surface for pure expression.' },
        { name: 'Blueprint Paper', icon: <Grid className="w-10 h-10" />, desc: 'Simple graph paper for your drawings and plans.' },
        { name: 'Classic Journal', icon: <LayoutGrid className="w-10 h-10" />, desc: 'A clean layout for your daily thoughts and notes.' },
    ];

    return (
        <div className="section-padding paper-texture min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl mb-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 glass rounded-full border border-black/5"
                    >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink/60">The Curated Collection</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-8xl font-display font-black text-ink mb-10 tracking-tight leading-none">
                        Manuscript <br /><span className="italic font-serif hero-text-shimmer">Gallery.</span>
                    </h1>
                    <p className="text-ink/40 text-xl font-medium leading-relaxed max-w-xl">
                        A collection of beautiful papers, hand-picked to make your writing feel personal and authentic.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {templates.map((template, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="group"
                        >
                            <div className="card-premium aspect-3/4 flex flex-col items-center justify-center p-10 group-hover:-translate-y-4 transition-transform duration-700">
                                <div className="mb-12 text-ink/10 group-hover:text-accent transition-colors duration-500 scale-125">
                                    {template.icon}
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-center text-ink mb-4">{template.name}</h3>
                                <p className="text-[10px] text-ink/30 font-bold text-center leading-relaxed">
                                    {template.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
