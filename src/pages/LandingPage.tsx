import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    PenTool,
    Layers,
    Download,
    Zap,
    ArrowRight
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Real Feel',
            desc: 'Captures the rhythm of a real pen, making your writing feel alive.',
            icon: <PenTool className="w-6 h-6" />
        },
        {
            title: 'Your Space',
            desc: 'A simple, clean place for you to just write.',
            icon: <Layers className="w-6 h-6" />
        },
        {
            title: 'Looks Like Paper',
            desc: 'Exports that look exactly like a scanned letter.',
            icon: <Download className="w-6 h-6" />
        },
        {
            title: 'Instant Ink',
            desc: 'See your words appear instantly as you type.',
            icon: <Zap className="w-6 h-6" />
        }
    ];

    const useCases = [
        { title: 'Students', desc: 'Turn your typed notes into realistic handwritten assignments.' },
        { title: 'Journaling', desc: 'Keep the personal feel of a diary in a digital format.' },
        { title: 'Letters', desc: 'Create notes that feel personal and sincere.' },
        { title: 'Professional', desc: 'Add a human touch to your digital signatures and memos.' }
    ];

    return (
        <div className="relative paper-texture overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"
                    />
                    {/* Floating Ambient Text - Subtler */}
                    <div className="absolute inset-0">
                        <motion.span
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="absolute top-[15%] left-[10%] font-handwriting text-4xl text-ink/5 rotate-[-10deg] blur-sm"
                        >
                            soulful
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            className="absolute bottom-[20%] right-[15%] font-handwriting text-5xl text-ink/5 rotate-12 blur-sm"
                        >
                            expressive
                        </motion.span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-xs font-black tracking-widest uppercase mb-8 border border-accent/20">
                            New: Our Best Ink Yet
                        </span>
                        
                        <h1 className="text-7xl md:text-9xl font-display font-black text-ink tracking-tighter mb-8 leading-[0.9]">
                            Make it <br />
                            <span className="italic font-serif text-accent">Personal.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-ink/50 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                            The simple joy of writing by hand, reimagined for the digital age. 
                            Experience the flow of real ink on paper.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                className="group relative px-10 py-5 bg-ink text-white rounded-2xl overflow-hidden shadow-2xl shadow-ink/20 hover:scale-105 active:scale-95 transition-all duration-300"
                                onClick={() => navigate('/editor')}
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-3 text-sm font-black tracking-[0.2em] uppercase">
                                    Start Writing <ArrowRight size={16} />
                                </span>
                            </button>
                            <button 
                                onClick={() => {
                                    const el = document.getElementById('features');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-10 py-5 bg-transparent text-ink border border-ink/10 rounded-2xl hover:bg-white hover:border-transparent hover:shadow-xl transition-all duration-300 text-sm font-black tracking-[0.2em] uppercase"
                            >
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="section-padding relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-32 text-center">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-display font-black text-ink mb-6"
                        >
                            Made for <br /><span className="text-accent italic font-serif">Writers.</span>
                        </motion.h2>
                        <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            className="h-1 bg-accent mx-auto rounded-full" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="card-premium group"
                            >
                                <div className="mb-8 w-14 h-14 glass rounded-2xl flex items-center justify-center text-accent transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 border border-black/5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-display font-black text-ink mb-4 tracking-tight uppercase">{feature.title}</h3>
                                <p className="text-ink/50 text-sm leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section - FIXED VISIBILITY */}
            <section className="section-padding relative overflow-hidden bg-[#1A1F2C] text-white">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div>
                            <motion.h2 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-6xl md:text-8xl font-display font-black mb-10 tracking-tighter leading-none"
                            >
                                Dedicated to <br /><span className="text-accent italic font-serif">Writing.</span>
                            </motion.h2>
                            <p className="text-white/60 text-xl leading-relaxed max-w-lg font-medium">
                                InkPad brings back the simple joy of writing by hand in a digital world. No distractions, just you and your thoughts.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                            {useCases.map((item, i) => (
                                <motion.div 
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <h4 className="flex items-center gap-4 text-xs font-black text-accent uppercase tracking-[0.3em] mb-4">
                                        {item.title}
                                    </h4>
                                    <p className="text-white/50 text-sm leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding relative text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="glass p-20 rounded-[3rem] border border-black/5 shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-accent to-transparent opacity-30" />
                        
                        <h2 className="text-5xl md:text-7xl font-display font-black text-ink mb-8 tracking-tighter italic">Ready to create?</h2>
                        <p className="text-ink/40 text-lg mb-12 max-w-xl mx-auto font-medium">
                            Rediscover the simple beauty of a pen on paper.
                        </p>
                        <button
                            className="btn-premium rounded-2xl px-16 py-6 text-sm tracking-[0.2em] shadow-2xl shadow-ink/20 hover:scale-105 active:scale-95 transition-all mx-auto"
                            onClick={() => navigate('/editor')}
                        >
                            Open Editor
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
