import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
    PenTool, Download, Type, ArrowRight,
    Mail, Github, Linkedin, Twitter
} from 'lucide-react';
import React, { useRef } from 'react';
import EditorPage from './EditorPage';
import photo from '../assets/arsh.jpg';

export default function LandingPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const scrollToEditor = () => editorRef.current?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 min-h-screen overflow-x-hidden selection:bg-accent/30 relative">
            {/* Global Page Background Grid & Soft Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[120px]" />
            </div>
            
            {/* --- HERO SECTION --- */}
            <HeroSection onStartClick={scrollToEditor} />

            {/* --- REAL EDITOR SECTION --- */}
            <section ref={editorRef} id="editor" className="relative z-20 py-28">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mb-16 text-center"
                    >
                        <span className="text-indigo-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">The Workshop</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900">Your Digital Canvas</h2>
                    </motion.div>
                     <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                     >
                        <EditorPage />
                     </motion.div>
                </div>
            </section>


            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-28 px-6 relative">
                 <div className="max-w-7xl mx-auto relative z-10">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block"
                        >
                            Why Handwritten?
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                            className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6"
                        >
                            More than just <br/>
                            <span className="italic font-serif text-neutral-600">pixels on a screen.</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grid-rows-2 h-auto md:h-[600px]">
                        {/* Large Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="md:col-span-2 md:row-span-2 bg-[#F5F5F7] rounded-3xl p-10 relative overflow-hidden group border border-black/5 shadow-xl"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <PenTool className="text-indigo-500" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-neutral-900">Advanced Simulation Engine</h3>
                                <p className="text-neutral-500 text-lg max-w-md leading-relaxed">
                                    Total control over your handwriting's soul. Fine-tune organic **Jitter**, **Pressure**, and **Smudge** levels to create a document that looks indistinguishable from paper.
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
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                            className="bg-[#1A1F2C] text-white rounded-3xl p-8 relative overflow-hidden group shadow-xl"
                        >
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                             <div className="relative z-10">
                                <Download className="mb-4 text-indigo-400" />
                                <h3 className="text-xl font-bold mb-2">Export Anywhere</h3>
                                <p className="text-white/50 text-sm">Convert your handwritten work into high-fidelity PDF documents or individual PNGs in a single ZIP archive.</p>
                             </div>
                        </motion.div>

                        {/* Bottom Right Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                            className="bg-white border border-black/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative z-10">
                                <Type className="mb-4 text-indigo-500" />
                                <h3 className="text-xl font-bold mb-2 text-neutral-900">AI Humanizer</h3>
                                <p className="text-neutral-500 text-sm">Tap into the power of Gemini to rewrite your notes into organic, natural human prose with one click.</p>
                            </div>
                        </motion.div>
                    </div>
                 </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <AboutSection />

            {/* --- CALL TO ACTION --- */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="bg-neutral-900 text-white rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden"
                    >
                         {/* Abstract BG */}
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />

                         <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                                Start your <br/>
                                <span className="font-serif italic text-accent">masterpiece.</span>
                            </h2>
                            <p className="text-base md:text-lg text-white/60 mb-8 max-w-xl mx-auto">
                                No signup required for basic use. Jump right in and feel the difference.
                            </p>
                            <button
                                onClick={scrollToEditor}
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

function HeroSection({ onStartClick }: { onStartClick: () => void }) {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
            
            {/* Floating Sticky Decorations */}
            <motion.div
                initial={{ opacity: 0, rotate: -15, y: 20 }}
                animate={{ opacity: 1, rotate: -12, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute top-32 left-8 md:left-24 hidden md:block"
            >
                <div className="bg-yellow-200 w-32 h-32 rounded-2xl shadow-xl p-4 -rotate-6">
                    <span className="font-handwriting text-lg text-neutral-700">Quick & Easy!</span>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, rotate: 10, y: 20 }}
                animate={{ opacity: 1, rotate: 6, y: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute top-48 right-8 md:right-20 hidden md:block"
            >
                <div className="bg-pink-200 w-28 h-28 rounded-2xl shadow-xl p-3 rotate-3">
                    <span className="font-handwriting text-base text-neutral-700">Pro Export</span>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, rotate: -5, y: 20 }}
                animate={{ opacity: 1, rotate: -3, y: 0 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="absolute bottom-40 left-12 md:left-32 hidden md:block"
            >
                <div className="bg-blue-200 w-36 h-24 rounded-2xl shadow-xl p-4 -rotate-2">
                    <span className="font-handwriting text-lg text-neutral-700">12+ Fonts</span>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, rotate: 8, y: 20 }}
                animate={{ opacity: 1, rotate: 4, y: 0 }}
                transition={{ delay: 1.1, duration: 1 }}
                className="absolute bottom-32 right-16 md:right-28 hidden md:block"
            >
                <div className="bg-green-200 w-32 h-28 rounded-2xl shadow-xl p-3 rotate-2">
                    <span className="font-handwriting text-base text-neutral-700">Realistic ✨</span>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 text-center flex flex-col items-center">
                
                {/* Website Name with Black-Gray Gradient */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    className="text-7xl md:text-[10rem] font-sans font-black leading-[0.9] tracking-tighter bg-gradient-to-b from-neutral-900 to-neutral-500 bg-clip-text text-transparent"
                >
                    Handwritten
                </motion.h1>

                {/* Cursive Subtext with Purple Gradient */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="font-handwriting text-4xl md:text-6xl mt-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent"
                >
                    Text to Handwriting Converter
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-12"
                >
                    <button
                        onClick={onStartClick}
                        className="px-10 py-5 bg-neutral-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl flex items-center gap-3 group"
                    >
                        Start Writing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

function AboutSection() {
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
            id="about"
            onMouseMove={handleMouseMove}
            className="relative py-28 px-6 perspective-1000 overflow-hidden"
        >
             <div className="max-w-7xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-20 text-center max-w-2xl mx-auto"
                >
                    <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">The Creator</span>
                    <h2 className="text-5xl font-display font-bold text-neutral-900">Behind the Ink</h2>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ rotateX, rotateY }}
                    className="relative w-full max-w-6xl mx-auto perspective-1000"
                >
                    <div className="relative bg-white rounded-3xl shadow-2xl border border-black/5 p-2 md:p-4 transition-transform duration-200 ease-out">
                         <div className="absolute top-6 left-6 flex gap-2 z-20">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                         </div>

                         <div className="w-full bg-[#FAFAFA] rounded-md overflow-hidden relative min-h-[500px] flex flex-col md:flex-row">
                            <div className="w-full md:w-1/3 bg-white border-r border-black/5 p-8 flex flex-col items-center pt-20">
                                <div className="relative w-48 h-48 mb-8">
                                    <div className="absolute inset-0 bg-accent/10 rounded-full blur-2xl transform translate-y-4" />
                                    <img src={photo} alt="Arsh Verma" className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl relative z-10" />
                                    <div className="absolute bottom-4 right-4 z-20 bg-white p-2 rounded-full shadow-md"><span className="text-2xl">👋</span></div>
                                </div>
                                <h3 className="font-display font-bold text-2xl text-ink mb-1">Arsh Verma</h3>
                                <p className="text-xs font-black tracking-widest uppercase text-ink/40 mb-8">Developer & Designer</p>
                                <div className="flex gap-4">
                                    <SocialLink href="https://github.com/ArshVermaGit" icon={Github} />
                                    <SocialLink href="https://linkedin.com/in/arshverma" icon={Linkedin} />
                                    <SocialLink href="https://twitter.com/arshverma" icon={Twitter} />
                                    <SocialLink href="mailto:Arshverma.dev@gmail.com" icon={Mail} />
                                </div>
                            </div>

                            <div className="flex-1 p-8 md:p-16 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px]">
                                 <div className="max-w-2xl mx-auto space-y-8">
                                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 rotate-1 hover:rotate-0 transition-transform duration-300">
                                        <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" /> About Me</h4>
                                        <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                            I'm a student at <span className="font-bold text-ink">VIT Bhopal</span> with a passion for building digital experiences. Whether it's developing games in Unity or creating tools like Handwritten, I love turning ideas into reality.
                                        </p>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 -rotate-1 hover:rotate-0 transition-transform duration-300">
                                        <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400" /> Philosophy</h4>
                                        <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                            I focus on making things that look great and work even better. Coding isn't just about logic—it's about creating something that feels <span className="font-handwriting text-2xl mx-2 text-accent">human</span>.
                                        </p>
                                    </div>
                                 </div>
                            </div>
                         </div>
                    </div>
                </motion.div>
             </div>
        </section>
    );
}

function SocialLink({ href, icon: Icon }: { href: string, icon: React.ElementType }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-gray-50 hover:scale-110 transition-all shadow-xl">
            <Icon size={18} />
        </a>
    );
}

