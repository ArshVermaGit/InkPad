import { motion } from 'framer-motion';
import { useStore, getAvailableFonts } from '../lib/store';
import { useNavigate } from 'react-router-dom';

export default function StylesPage() {
    const { handwritingStyle, setHandwritingStyle } = useStore();
    const navigate = useNavigate();
    const allFonts = getAvailableFonts(useStore.getState());

    const handleSelect = (id: string) => {
        setHandwritingStyle(id);
        navigate('/editor');
    };

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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ink/60">Writing Styles</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-8xl font-display font-black text-ink mb-10 tracking-tight leading-none">
                        Real <br /><span className="italic font-serif hero-text-shimmer">Handwriting.</span>
                    </h1>
                    <p className="text-ink/40 text-xl font-medium leading-relaxed max-w-xl">
                        Find the writing style that fits you best. Each one is designed to look like real handwriting.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-16">
                    {allFonts.map((font, i) => (
                        <motion.div
                            key={font.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => handleSelect(font.id)}
                            className={`card-premium group cursor-pointer border-l-[6px] flex flex-col lg:flex-row justify-between items-center gap-12 p-10 transition-all duration-700 ${handwritingStyle === font.id ? 'border-l-accent bg-paper-dark/30' : 'border-l-transparent'
                                }`}
                        >
                            <div className="flex-1 w-full">
                                <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] block mb-6 px-1">
                                    {font.type === 'custom' ? 'Your Signature' : `Style №${i + 1}`}
                                </span>
                                <h2 className="text-4xl md:text-5xl mb-8 group-hover:translate-x-3 transition-transform duration-700 font-display font-black text-ink uppercase tracking-tight">{font.name}</h2>
                                <div className="flex items-center gap-6">
                                    <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-inner-paper ${font.type === 'custom' ? 'bg-ink text-white' : 'bg-black/5 text-ink/40'
                                        }`}>
                                        {font.type === 'custom' ? 'Private' : 'System'}
                                    </div>
                                    {handwritingStyle === font.id && (
                                        <span className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-[0.2em] animate-pulse">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                            Selected Style
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-[1.5] w-full min-h-[200px] glass rounded-3xl p-12 flex items-center justify-center relative overflow-hidden group-hover:shadow-2xl transition-all duration-700 border border-black/5">
                                <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />
                                <span
                                    className="text-3xl md:text-5xl text-ink select-none pointer-events-none text-center leading-relaxed"
                                    style={{ fontFamily: font.family }}
                                >
                                    Smooth, organic writing that looks exactly like real ink.
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
