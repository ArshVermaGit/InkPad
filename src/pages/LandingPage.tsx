import { motion, useScroll, useTransform } from 'framer-motion';
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
    const { scrollYProgress } = useScroll();
    const yParallaxFast = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const yParallaxMedium = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const yParallaxSlow = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const features = [
        {
            title: 'Precision Rendering',
            desc: 'Our proprietary algorithm replicates the nuances of natural handwriting speed and pressure.',
            icon: <PenTool className="w-6 h-6" />
        },
        {
            title: 'Stationery Design',
            desc: 'A focused, distraction-free interface designed for modern document creation.',
            icon: <Layers className="w-6 h-6" />
        },
        {
            title: 'Instant PDF Export',
            desc: 'High-fidelity exports that look identical to authentic scanned physical paper.',
            icon: <Download className="w-6 h-6" />
        },
        {
            title: 'Blazing Fast',
            desc: 'Real-time previews with virtually zero latency, powered by high-performance canvas logic.',
            icon: <Zap className="w-6 h-6" />
        }
    ];

    const useCases = [
        { title: 'Students', desc: 'Convert digital notes to authentic-looking handwritten assignments.' },
        { title: 'Journaling', desc: 'Preserve the feeling of handwriting in your digital diary.' },
        { title: 'Personalized Mail', desc: 'Create letters that feel deeply personal and sincere.' },
        { title: 'Professional Docs', desc: 'Add a human touch to digital signatures and memos.' }
    ];

    return (
        <div className="relative paper-texture overflow-hidden">
            {/* Hero Section */}
            <section className="section-padding flex flex-col items-center justify-center min-h-screen text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-5xl"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 glass rounded-full border border-black/5"
                    >
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/60">New: Advanced Ink Simulation 2.0</span>
                    </motion.div>

                    <h1 className="text-7xl md:text-9xl mb-10 tracking-tight leading-[0.9] font-black text-ink">
                        <span className="block overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-block"
                            >
                                Rewrite the
                            </motion.span>
                        </span>
                        <span className="block overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="block italic font-serif hero-text-shimmer"
                            >
                                Digital Experience
                            </motion.span>
                        </span>
                    </h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-xl md:text-2xl text-ink/60 mb-16 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Experience the soulful warmth of traditional handwriting combined with the raw power of modern AI. Elevate your digital notes into timeless art.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center"
                    >
                        <button
                            className="btn-premium rounded-xl text-xs py-5 px-10 group"
                            onClick={() => navigate('/editor')}
                        >
                            Start Your Journey 
                            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                        <button
                            className="btn-premium-outline rounded-xl text-xs py-5 px-10 glass"
                            onClick={() => navigate('/gallery')}
                        >
                            Explore Styles
                        </button>
                    </motion.div>
                </motion.div>

                {/* Animated Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-ink/30 translate-x-[0.2em]">Scroll</span>
                    <div className="w-6 h-10 border border-ink/10 rounded-full relative bg-ink/5">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-accent rounded-full scroll-indicator-dot" />
                    </div>
                </motion.div>

                {/* Background Floating Elements */}
                <div className="absolute inset-0 pointer-events-none select-none -z-10 overflow-hidden">
                    <motion.div
                        style={{ y: yParallaxSlow }}
                        className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)]"
                    />

                    <motion.div
                        style={{ y: yParallaxMedium }}
                        className="font-handwriting text-[25vw] absolute -top-10 -left-20 text-ink/5 italic -rotate-12"
                    >
                        soulful
                    </motion.div>

                    <motion.div
                        style={{ y: yParallaxFast, rotate: 8 }}
                        className="font-script text-[18vw] absolute top-1/2 -right-20 text-ink/5"
                    >
                        human
                    </motion.div>

                    <motion.div
                        style={{ y: yParallaxSlow, rotate: -5 }}
                        className="font-serif italic text-[12vw] absolute bottom-20 left-10 text-ink/5"
                    >
                        craftsmanship
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
                            Engineered for <br /><span className="text-accent italic font-serif">Absolute Authenticity.</span>
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

            {/* Use Cases Section */}
            <section className="section-padding relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-ink pointer-events-none -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,var(--color-ink-light)_0%,transparent_70%)] opacity-30 -z-10" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div>
                            <motion.h2 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-6xl md:text-8xl font-display font-black text-white mb-10 tracking-tighter leading-none"
                            >
                                A Heritage <br /><span className="text-accent italic font-serif">of Ink.</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-white/40 text-xl leading-relaxed max-w-lg font-medium"
                            >
                                InkPad bridges the gap between digital efficiency and the timeless warmth of traditional writing.
                            </motion.p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                            {useCases.map((item, i) => (
                                <motion.div 
                                    key={item.title}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <h4 className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-[0.3em] mb-6">
                                        <div className="w-8 h-px bg-accent" />
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
                            Join thousands who are rediscovering the beauty of handwriting in the digital age.
                        </p>
                        <button
                            className="btn-premium rounded-2xl px-16 py-6 text-sm tracking-[0.2em] shadow-2xl shadow-ink/20 hover:scale-105 active:scale-95 transition-all mx-auto"
                            onClick={() => navigate('/editor')}
                        >
                            Initialize Workspace
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
