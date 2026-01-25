import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { 
    PenTool, Download, Type, ArrowRight,
    Mail, Github, Linkedin, Twitter
} from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import EditorPage from './EditorPage';
import photo from '../assets/arsh.jpg';

export default function LandingPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const isEditorInView = useInView(editorRef, { amount: 0.25, margin: "0px 0px -100px 0px" });
    const { setNavbarVisible } = useStore();

    useEffect(() => {
        setNavbarVisible(!isEditorInView);
        return () => setNavbarVisible(true); // Reset on unmount
    }, [isEditorInView, setNavbarVisible]);

    const scrollToEditor = () => editorRef.current?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="bg-paper min-h-screen overflow-x-hidden selection:bg-accent/30 relative">
            {/* Global Page Background Grid & Soft Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 mesh-gradient opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-0 left-0 w-full h-full noise-bg opacity-20" />
                
                {/* Animated Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl animate-blob [animation-delay:4s]" />
            </div>
            
            {/* --- HERO SECTION --- */}
            <HeroSection />

            {/* --- REAL EDITOR SECTION --- */}
            <section ref={editorRef} id="editor" className="relative z-20 py-12 sm:py-16 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-8 sm:mb-12 md:mb-16 text-center">
                        <span className="text-indigo-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">The Workshop</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900">Your Digital Canvas</h2>
                    </div>
                     <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                     >
                        <EditorPage />
                     </motion.div>
                </div>
            </section>


            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-12 sm:py-16 md:py-28 px-4 sm:px-6 relative">
                    <div className="mb-10 sm:mb-16 md:mb-20 text-center max-w-2xl mx-auto">
                        <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">
                            Why Handwritten?
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
                            More than just <br className="hidden sm:block"/>
                            <span className="italic font-serif text-neutral-600">pixels on a screen.</span>
                        </h2>
                    </div>

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.1 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:grid-rows-2 h-auto"
                    >
                        {/* Large Card */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            className="md:col-span-2 md:row-span-2 paper-card relative overflow-hidden group p-0!"
                            whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        >
                            <div className="relative z-10 p-8 sm:p-12">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                    <PenTool className="text-indigo-500" size={24} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-neutral-900 tracking-tight">Advanced Simulation Engine</h3>
                                <p className="text-neutral-500 text-base sm:text-lg max-w-md leading-relaxed">
                                    Total control over your handwriting's soul. Fine-tune organic <b className="text-neutral-900">Jitter</b>, <b className="text-neutral-900">Pressure</b>, and <b className="text-neutral-900">Smudge</b> levels to create a document that looks indistinguishable from paper.
                                </p>
                            </div>
                            
                            {/* Visual Decoration - Refined */}
                            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 translate-x-12 translate-y-12 transition-transform duration-700 group-hover:-translate-x-4 group-hover:-translate-y-4 hidden sm:block pointer-events-none">
                                <div className="w-full h-full bg-white rounded-tl-[3rem] shadow-2xl p-6 border border-black/5 -rotate-6 group-hover:-rotate-3 transition-all duration-500">
                                    <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] p-8 font-handwriting text-3xl text-neutral-900 leading-loose flex items-center justify-center text-center">
                                        "The details are not the details. <br/> They make the design."
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Top Right Card */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            className="bg-[#1A1F2C] text-white rounded-4xl p-8 relative overflow-hidden group shadow-2xl transition-all duration-500 flex flex-col justify-between"
                        >
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                             <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                    <Download className="text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Export Anywhere</h3>
                                <p className="text-white/60 text-sm leading-relaxed">Convert your handwritten work into high-fidelity PDF documents or individual PNGs in a single ZIP archive.</p>
                             </div>
                        </motion.div>

                        {/* Bottom Right Card */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            className="paper-card group flex flex-col justify-between"
                        >
                            <div className="relative z-10">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                    <Type className="text-indigo-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-neutral-900">AI Humanizer</h3>
                                <p className="text-neutral-500 text-sm leading-relaxed">Tap into the power of Gemini to rewrite your notes into organic, natural human prose with one click.</p>
                            </div>
                        </motion.div>
                    </motion.div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <AboutSection />

            {/* --- CALL TO ACTION --- */}
            <section className="py-12 pb-28 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            duration: 0.7 
                        }}
                        className="bg-neutral-900 text-white rounded-[3rem] p-8 sm:p-12 md:p-24 shadow-2xl relative overflow-hidden group/cta"
                    >
                         {/* Abstract BG */}
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover/cta:scale-105 transition-transform duration-[2s]" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[120px]" />

                         <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-6 sm:mb-8 tracking-tight leading-none">
                                Start your <br className="hidden sm:block"/>
                                <span className="font-serif italic text-indigo-400">masterpiece.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto font-medium">
                                No signup required for basic use. Jump right in and feel the difference.
                            </p>
                            <motion.button
                                onClick={scrollToEditor}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="px-10 py-5 bg-white text-neutral-900 rounded-full font-bold text-lg hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3 mx-auto group"
                            >
                                <span>Launch Editor</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                         </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}

function HeroSection() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]); // Reduced tilt for subtler effect
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);
    const contentRotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
    const contentRotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

    return (
        <section 
            onMouseMove={handleMouseMove}
            className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden perspective-1000"
        >
            {/* 3D Background Plane */}
            <motion.div 
                style={{ rotateX, rotateY }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
                <div className="w-full max-w-7xl h-full relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[140px] mix-blend-multiply transition-opacity duration-1000" />
                </div>
            </motion.div>

            {/* Main 3D Container with Parallax Layers */}
            <motion.div 
                style={{ rotateX: contentRotateX, rotateY: contentRotateY, transformStyle: "preserve-3d" }}
                className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl py-24"
            >
                {/* Central Text Content - Layered Depth */}
                <div className="text-center transform-style-3d pt-20 pb-12 relative">
                    {/* Background Soft Glow for Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        style={{ transform: "translateZ(80px)" }}
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center"
                    >
                        <h1 
                            className="text-5xl sm:text-9xl lg:text-[11rem] font-display font-bold leading-none tracking-tighter text-neutral-900 mb-4"
                        >
                            Handwritten.
                        </h1>
                        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-neutral-500 leading-tight">
                            Text to Handwriting Converter
                        </h2>
                    </motion.div>
                </div>
            </motion.div>
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
            className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 perspective-1000 overflow-hidden"
        >
             <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">The Creator</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-900">Behind the Ink</h2>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ rotateX, rotateY }}
                    className="relative w-full max-w-6xl mx-auto perspective-1000"
                >
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-black/5 p-2 md:p-4 transition-transform duration-200 ease-out">
                         <div className="absolute top-6 left-6 flex gap-2 z-20">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                         </div>

                         <div className="w-full bg-[#FAFAFA] rounded-md overflow-hidden relative min-h-[400px] sm:min-h-[500px] flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 bg-white border-b md:border-b-0 md:border-r border-black/5 p-6 sm:p-8 flex flex-col items-center pt-10 sm:pt-16 md:pt-20">
                                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 mb-4 sm:mb-6 md:mb-8">
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
                                     <motion.div 
                                        whileHover={{ scale: 1.02, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 rotate-1 transition-all duration-300"
                                     >
                                         <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" /> About Me</h4>
                                         <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                             I'm a student at <span className="font-bold text-ink">VIT Bhopal</span> with a passion for building digital experiences. Whether it's developing games in Unity or creating tools like Handwritten, I love turning ideas into reality.
                                         </p>
                                     </motion.div>
                                     <motion.div 
                                        whileHover={{ scale: 1.02, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 -rotate-1 transition-all duration-300"
                                     >
                                         <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400" /> Philosophy</h4>
                                         <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                             I focus on making things that look great and work even better. Coding isn't just about logic—it's about creating something that feels <span className="font-handwriting text-2xl mx-2 text-accent">human</span>.
                                         </p>
                                     </motion.div>
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
        <motion.a 
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-gray-50 transition-all shadow-xl"
        >
            <Icon size={18} />
        </motion.a>
    );
}

