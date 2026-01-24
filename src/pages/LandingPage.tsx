import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { 
    PenTool, Download, Type, Sparkles, ArrowRight
} from 'lucide-react';
import React from 'react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#FAF9F6] min-h-screen overflow-x-hidden selection:bg-accent/30">
            
            {/* --- HERO SECTION --- */}
            <HeroSection navigate={navigate} />

            {/* --- SOCIAL PROOF MARQUEE --- */}
            <MarqueeSection />

            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-24 px-6 bg-white relative">
                 <div className="absolute inset-0 bg-[#F2F0E9]/30" />
                 <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block"
                        >
                            Why InkPad?
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6"
                        >
                            More than just <br/>
                            <span className="italic font-serif text-neutral-600">pixels on a screen.</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grid-rows-2 h-auto md:h-[600px]">
                        {/* Large Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 md:row-span-2 bg-[#F5F5F7] rounded-4xl p-10 relative overflow-hidden group border border-black/5"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <PenTool className="text-indigo-500" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-neutral-900">Hyper-Realistic Ink Engine</h3>
                                <p className="text-neutral-500 text-lg max-w-md leading-relaxed">
                                    Our proprietary rendering engine mimics the physics of real ink. 
                                    It simulates pressure, variable stroke width, and even the subtle bleed of ink into paper fibers.
                                </p>
                            </div>
                            
                            {/* Visual Decoration */}
                            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 translate-x-12 translate-y-12 transition-transform duration-700 group-hover:-translate-x-4 group-hover:-translate-y-4">
                                <div className="w-full h-full bg-white rounded-tl-[3rem] shadow-2xl p-6 border border-black/5 -rotate-6 group-hover:-rotate-3 transition-all duration-500">
                                    <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] p-8 font-handwriting text-3xl text-neutral-900 leading-loose">
                                        "The details are not the details. <br/> They make the design."
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Top Right Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#1A1F2C] text-white rounded-4xl p-8 relative overflow-hidden group"
                        >
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                             <div className="relative z-10">
                                <Download className="mb-4 text-indigo-400" />
                                <h3 className="text-xl font-bold mb-2">Export Anywhere</h3>
                                <p className="text-white/50 text-sm">Download as high-res PDF, PNG, or even create a ZIP archive of your notebook.</p>
                             </div>
                        </motion.div>

                        {/* Bottom Right Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-black/5 rounded-4xl p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                        >
                            <div className="relative z-10">
                                <Type className="mb-4 text-indigo-500" />
                                <h3 className="text-xl font-bold mb-2 text-neutral-900">10+ Unique Hands</h3>
                                <p className="text-neutral-500 text-sm">From messy scrawls to elegant cursive, find a voice that matches yours.</p>
                            </div>
                        </motion.div>
                    </div>
                 </div>
            </section>

            {/* --- CALL TO ACTION --- */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-neutral-900 text-white rounded-[3rem] p-12 md:p-24 shadow-2xl relative overflow-hidden"
                    >
                         {/* Abstract BG */}
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />

                         <div className="relative z-10">
                            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">
                                Start your <br/>
                                <span className="font-serif italic text-accent">masterpiece.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-xl mx-auto">
                                No signup required for basic use. Jump right in and feel the difference.
                            </p>
                            <button
                                onClick={() => navigate('/editor')}
                                className="px-10 py-5 bg-white text-neutral-900 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]"
                            >
                                Launch Editor <ArrowRight size={20} />
                            </button>
                         </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}

function HeroSection({ navigate }: { navigate: NavigateFunction }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

    return (
        <section 
            onMouseMove={handleMouseMove}
            className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 perspective-1000 overflow-hidden"
        >
            {/* Ambient Background - Optimized */}
            <div className="absolute inset-0 bg-[#FBFBFB]">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
            </div>

            <div className="relative z-10 text-center max-w-5xl mx-auto mb-20">
                <div>
                    <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up">
                        <span className="px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                             <Sparkles size={12} className="text-indigo-500" /> V2.0 Now Live
                        </span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-display font-bold text-neutral-900 tracking-tighter leading-[0.85] mb-8 animate-fade-in-up" style={{ animationDelay: '0s' }}>
                        Digital notes <br className="hidden md:block"/>
                        <span className="relative inline-block">
                             <span className="relative z-10 italic font-serif text-transparent bg-clip-text bg-linear-to-r from-neutral-900 to-neutral-600">reimagined.</span>
                             <svg className="absolute w-[110%] h-[20%] -bottom-2 -left-[5%] text-indigo-500 opacity-60 z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                             </svg>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-ink/50 max-w-2xl mx-auto mb-10 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Embrace the imperfection. InkPad brings the tactile soul of handwriting to your digital workflow.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <button 
                            onClick={() => navigate('/editor')}
                            className="px-8 py-4 bg-neutral-900 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-neutral-900/30 hover:-translate-y-1 transition-all flex items-center gap-2 group"
                        >
                            Start Writing Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                        <button className="px-8 py-4 bg-white border border-black/5 text-ink rounded-full font-bold text-lg hover:bg-gray-50 transition-colors">
                            See Examples
                        </button>
                    </div>
                </div>
            </div>

            {/* 3D TILT SHOWCASE */}
            <motion.div 
                style={{ rotateX, rotateY }}
                className="relative w-full max-w-5xl mx-auto perspective-1000"
            >
                <div className="relative aspect-16/10 bg-white rounded-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-black/5 p-2 md:p-4 transition-transform duration-200 ease-out">
                     {/* Window Controls */}
                     <div className="absolute top-6 left-6 flex gap-2 z-20">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                     </div>

                     {/* Content Simulation */}
                     <div className="w-full h-full bg-[#FAFAFA] rounded-md overflow-hidden relative">
                        <div className="absolute inset-0 flex">
                            {/* Sidebar Mockup */}
                            <div className="w-16 md:w-64 bg-white border-r border-black/5 hidden md:block p-6 space-y-4">
                                <div className="w-full h-8 bg-black/5 rounded-md" />
                                <div className="space-y-2">
                                    {[1,2,3,4].map(i => <div key={i} className="w-full h-4 bg-black/5 rounded-sm opacity-50" />)}
                                </div>
                            </div>
                            {/* Canvas Mockup */}
                            <div className="flex-1 p-8 md:p-16 flex items-center justify-center bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px]">
                                <div className="bg-white shadow-xl -rotate-2 p-8 md:p-12 max-w-2xl w-full border border-black/5">
                                    <h3 style={{fontFamily: 'Caveat, cursive'}} className="text-4xl md:text-6xl text-ink mb-6">Hello World!</h3>
                                    <p style={{fontFamily: 'Caveat, cursive'}} className="text-2xl md:text-3xl text-ink/70 leading-relaxed">
                                        This is what digital notes should feel like. <span className="text-accent">Messy, human, and real.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </motion.div>
        </section>
    );
}

function MarqueeSection() {
    return (
        <section className="py-20 bg-white border-y border-black/5 overflow-hidden">
            <div className="flex relative w-full">
                <div className="flex gap-16 whitespace-nowrap px-8 animate-marquee">
                    {[1,2,3,4,5,6].map(i => (
                        <span key={i} className="text-6xl md:text-8xl font-handwriting text-neutral-900/10 font-bold select-none">
                            Notes with soul.
                        </span>
                    ))}
                    {[1,2,3,4,5,6].map(i => (
                        <span key={`dup-${i}`} className="text-6xl md:text-8xl font-handwriting text-neutral-900/10 font-bold select-none">
                            Notes with soul.
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
