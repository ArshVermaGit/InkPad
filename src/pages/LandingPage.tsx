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
        <div className="bg-linear-to-br from-purple-50 via-indigo-50 to-violet-100 min-h-screen overflow-x-hidden selection:bg-accent/30 relative">
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
                    <div className="mb-16 text-center">
                        <span className="text-indigo-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">The Workshop</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900">Your Digital Canvas</h2>
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
            <section className="py-28 px-6 relative">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                        <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">
                            Why Handwritten?
                        </span>
                        <h2 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6">
                            More than just <br/>
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
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 grid-rows-2 h-auto md:h-[600px]"
                    >
                        {/* Large Card */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            className="md:col-span-2 md:row-span-2 bg-[#F5F5F7] rounded-3xl p-10 relative overflow-hidden group border border-black/5 shadow-xl transition-all duration-500"
                            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
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
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            className="bg-[#1A1F2C] text-white rounded-3xl p-8 relative overflow-hidden group shadow-xl transition-all duration-500"
                        >
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                             <div className="relative z-10">
                                <Download className="mb-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2">Export Anywhere</h3>
                                <p className="text-white/50 text-sm">Convert your handwritten work into high-fidelity PDF documents or individual PNGs in a single ZIP archive.</p>
                             </div>
                        </motion.div>

                        {/* Bottom Right Card */}
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                            }}
                            whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            className="bg-white border border-black/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl transition-all duration-500"
                        >
                            <div className="relative z-10">
                                <Type className="mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2 text-neutral-900">AI Humanizer</h3>
                                <p className="text-neutral-500 text-sm">Tap into the power of Gemini to rewrite your notes into organic, natural human prose with one click.</p>
                            </div>
                        </motion.div>
                    </motion.div>
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
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            duration: 0.7 
                        }}
                        className="bg-neutral-900 text-white rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden group/cta"
                    >
                         {/* Abstract BG */}
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover/cta:scale-110 transition-transform duration-1000" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />

                         <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                                Start your <br/>
                                <span className="font-serif italic text-accent">masterpiece.</span>
                            </h2>
                            <p className="text-base md:text-lg text-white/60 mb-8 max-w-xl mx-auto">
                                No signup required for basic use. Jump right in and feel the difference.
                            </p>
                            <motion.button
                                onClick={scrollToEditor}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="px-10 py-5 bg-white text-neutral-900 rounded-full font-bold text-lg hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3 mx-auto group"
                            >
                                <span className="flex items-center gap-2">
                                    Launch Editor <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </motion.button>
                         </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}

function HeroSection({ onStartClick }: { onStartClick: () => void }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
    const contentRotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const contentRotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    return (
        <section 
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden perspective-1000"
        >
            {/* 3D Background Plane */}
            <motion.div 
                style={{ rotateX, rotateY }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-200/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-indigo-200/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
            </motion.div>

            {/* Main 3D Container */}
            <motion.div 
                style={{ rotateX: contentRotateX, rotateY: contentRotateY, transformStyle: "preserve-3d" }}
                className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl aspect-video"
            >
                {/* 3D Floating Elements - Arranged in depth */}
                <motion.div 
                    transformTemplate={({ rotateX, rotateY }) => `translate3d(-200px, -150px, 100px) rotateX(${rotateX}) rotateY(${rotateY}) rotate(-6deg)`}
                    style={{ rotateX: useTransform(rotateX, v => v * 1.5), rotateY: useTransform(rotateY, v => v * 1.5) }}
                    className="absolute top-1/4 left-10 lg:left-32 hidden md:block"
                >
                    <div className="bg-[#FEF9C3]/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-yellow-100/50">
                        <span className="font-handwriting text-2xl text-neutral-800">Quick & Easy!</span>
                    </div>
                </motion.div>

                <motion.div 
                    transformTemplate={({ rotateX, rotateY }) => `translate3d(200px, -120px, 150px) rotateX(${rotateX}) rotateY(${rotateY}) rotate(3deg)`}
                    style={{ rotateX: useTransform(rotateX, v => v * 2), rotateY: useTransform(rotateY, v => v * 2) }}
                    className="absolute top-1/3 right-10 lg:right-32 hidden md:block"
                >
                    <div className="bg-[#FCE7F3]/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-pink-100/50">
                        <span className="font-handwriting text-2xl text-neutral-800">Pro Export</span>
                    </div>
                </motion.div>

                <motion.div 
                    transformTemplate={({ rotateX, rotateY }) => `translate3d(-250px, 150px, 80px) rotateX(${rotateX}) rotateY(${rotateY}) rotate(-2deg)`}
                    style={{ rotateX, rotateY }}
                    className="absolute bottom-32 left-12 md:left-48 hidden md:block"
                >
                    <div className="bg-[#DBEAFE]/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-blue-100/50">
                        <span className="font-handwriting text-2xl text-neutral-800">12+ Fonts</span>
                    </div>
                </motion.div>

                <motion.div 
                    transformTemplate={({ rotateX, rotateY }) => `translate3d(250px, 180px, 120px) rotateX(${rotateX}) rotateY(${rotateY}) rotate(2deg)`}
                    style={{ rotateX: useTransform(rotateX, v => v * 1.2), rotateY: useTransform(rotateY, v => v * 1.2) }}
                    className="absolute bottom-24 right-16 md:right-40 hidden md:block"
                >
                    <div className="bg-[#DCFCE7]/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-green-100/50">
                        <span className="font-handwriting text-2xl text-neutral-800">Realistic ✨</span>
                    </div>
                </motion.div>

                {/* Central Text Content */}
                <div className="text-center transform-style-3d">
                    <motion.h1 
                        style={{ transform: "translateZ(60px)" }}
                        className="text-8xl md:text-[12rem] font-display font-medium leading-[0.8] tracking-tight text-neutral-900 mb-2 drop-shadow-xl"
                    >
                        Handwritten.
                    </motion.h1>

                    <motion.p 
                        style={{ transform: "translateZ(40px)" }}
                        className="font-script text-5xl md:text-7xl mt-6 bg-linear-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent pb-4"
                    >
                        Text to Handwriting Converter
                    </motion.p>
                    
                    <motion.div
                        style={{ transform: "translateZ(80px)" }}
                        className="mt-16"
                    >
                        <motion.button
                            onClick={onStartClick}
                            whileHover={{ scale: 1.1, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)" }}
                            whileTap={{ scale: 0.95 }}
                            className="px-14 py-6 bg-neutral-900 text-white rounded-full font-bold text-xl shadow-2xl hover:bg-black transition-all flex items-center gap-4 mx-auto"
                        >
                            <span>Start Writing</span>
                            <ArrowRight size={24} />
                        </motion.button>
                        <motion.p 
                           style={{ transform: "translateZ(30px)" }}
                           className="mt-6 text-sm font-bold text-neutral-400 uppercase tracking-widest"
                        >
                            No Sign Up Required
                        </motion.p>
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
            className="relative py-28 px-6 perspective-1000 overflow-hidden"
        >
             <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">The Creator</span>
                    <h2 className="text-5xl font-display font-bold text-neutral-900">Behind the Ink</h2>
                </div>

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

