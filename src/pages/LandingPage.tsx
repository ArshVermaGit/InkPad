import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    PenTool,
    Layers,
    Download,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import RippleButton from '../components/ui/RippleButton';

export default function LandingPage() {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const yParallaxFast = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const yParallaxMedium = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const yParallaxSlow = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const headlineVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const features = [
        {
            title: 'Precision Rendering',
            desc: 'Our proprietary algorithm replicates the nuances of natural handwriting speed and pressure.',
            icon: <PenTool className="w-6 h-6" />
        },
        {
            title: 'Monochromatic Design',
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
        <div className="relative">
            {/* Hero Section */}
            <section className="section-padding flex flex-col items-center justify-center min-h-[90vh] text-center bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <div className="inline-block px-4 py-1.5 mb-8 border border-black/10 rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">The Future of Digital Ink</span>
                    </div>

                    <motion.h1
                        variants={headlineVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-6xl md:text-8xl font-display mb-8 tracking-tighter leading-tight font-extrabold"
                    >
                        {"Transform Text into".split("").map((char, i) => (
                            <motion.span key={i} variants={letterVariants}>{char}</motion.span>
                        ))}
                        <br />
                        <motion.span
                            initial={{ fontFamily: 'var(--font-display)' }}
                            animate={{
                                fontFamily: ['var(--font-display)', 'var(--font-handwriting)'],
                                color: ['#000000', '#333333']
                            }}
                            transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
                            className="relative inline-block"
                        >
                            Perfect Handwriting
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, delay: 2.5 }}
                                className="absolute -bottom-2 left-0 h-1 bg-black/10"
                            />
                        </motion.span>
                    </motion.h1>

                    <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        The minimalist tool to generate beautiful, professional handwritten pages from digital text instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <RippleButton
                            className="text-sm tracking-widest uppercase flex items-center gap-3 cta-pulse bg-black text-white hover:bg-gray-800"
                            onClick={() => navigate('/editor')}
                        >
                            Start Writing <ArrowRight size={16} />
                        </RippleButton>
                        <RippleButton
                            variant="secondary"
                            className="text-sm tracking-widest uppercase"
                            onClick={() => navigate('/gallery')}
                        >
                            View Showcase
                        </RippleButton>
                    </div>
                </motion.div>

                {/* Animated Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Scroll</span>
                    <div className="w-5 h-8 border-2 border-gray-200 rounded-full relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-gray-400 rounded-full scroll-indicator-dot" />
                    </div>
                </motion.div>

                {/* Floating Handwriting Animation (Multilayered Parallax) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
                    <motion.div
                        style={{ y: yParallaxSlow }}
                        className="absolute inset-0 opacity-[0.03] animate-gradient-shift bg-linear-to-br from-gray-100 via-white to-gray-200"
                    />

                    <motion.div
                        style={{ y: yParallaxMedium }}
                        className="font-handwriting text-[20vw] absolute -top-10 -left-10 opacity-5 transform -rotate-12 drift-slow"
                    >
                        authenticity
                    </motion.div>

                    <motion.div
                        style={{ y: yParallaxFast }}
                        className="font-script text-[15vw] absolute top-1/2 -right-20 opacity-5 transform rotate-12 drift-medium"
                    >
                        human
                    </motion.div>

                    <motion.div
                        style={{ y: yParallaxSlow }}
                        className="font-print text-[10vw] absolute bottom-20 left-10 opacity-5 transform -rotate-6 drift-slow"
                    >
                        craft
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="section-padding bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24 text-center">
                        <h2 className="text-4xl md:text-5xl mb-6">Built for Excellence.</h2>
                        <div className="w-12 h-1 bg-black mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card-premium h-full"
                            >
                                <div className="mb-6 p-3 inline-block bg-gray-100">{feature.icon}</div>
                                <h3 className="text-xl mb-4 uppercase tracking-tighter">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="section-padding bg-black text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        <div>
                            <h2 className="text-5xl md:text-7xl mb-12 tracking-tighter leading-none">A New Way <br />to Think.</h2>
                            <p className="text-gray-400 text-xl leading-relaxed">
                                InkPad isn't just a tool; it's a bridge between the digital convenience of today and the timeless warmth of traditional writing.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            {useCases.map((item) => (
                                <div key={item.title}>
                                    <h4 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest mb-4">
                                        <CheckCircle2 size={18} className="text-white" />
                                        {item.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-white text-center border-t border-gray-100">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-5xl md:text-7xl mb-12 tracking-tighter">Ready to create?</h2>
                    <RippleButton
                        className="px-12 py-5 text-lg tracking-widest uppercase bg-black text-white hover:bg-gray-800"
                        onClick={() => navigate('/editor')}
                    >
                        Initialize Workspace
                    </RippleButton>
                </motion.div>
            </section>
        </div>
    );
}
