import { 
    PenTool, Download, Type, ArrowRight,
    Github, Linkedin, Twitter, Mail
} from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useStore } from '../lib/store';
import EditorPage from './EditorPage';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import photo from '../assets/arsh.jpg';

export default function LandingPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLElement>(null);
    const setNavbarVisible = useStore(state => state.setNavbarVisible);
    const isNavbarVisible = useStore(state => state.isNavbarVisible);

    const heroInView = useInView(heroRef, {
        margin: "-20px 0px 0px 0px",
    });

    useEffect(() => {
        // Toggle navbar visibility based on hero section being in view
        // Using a check to avoid redundant store updates
        if (heroInView && !isNavbarVisible) {
            setNavbarVisible(true);
        } else if (!heroInView && isNavbarVisible) {
            setNavbarVisible(false);
        }
    }, [heroInView, isNavbarVisible, setNavbarVisible]);

    const scrollToEditor = () => editorRef.current?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="bg-[#FAFAFA] min-h-screen overflow-x-hidden selection:bg-indigo-500/30 relative">
            {/* Global Page Background Grid & Soft Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 mesh-gradient opacity-30" style={{ willChange: 'transform' }} />
                <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[40px_40px]" />
                <div className="absolute top-0 left-0 w-full h-full noise-bg opacity-20" style={{ transform: 'translateZ(0)' }} />
                
                {/* Static Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-300/30 rounded-full blur-xl sm:blur-3xl" />
                <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-300/30 rounded-full blur-xl sm:blur-3xl" />
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-rose-300/30 rounded-full blur-xl sm:blur-3xl" />
            </div>
            
            {/* --- HERO SECTION --- */}
            <section ref={heroRef}>
                <HeroSection />
            </section>

            {/* --- REAL EDITOR SECTION --- */}
            <ScrollReveal>
                <section ref={editorRef} id="editor" className="relative z-20 py-12 sm:py-16 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
                            <span className="text-indigo-500 font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">The Workshop</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900">Your Digital Canvas</h2>
                        </div>
                        <div>
                            <EditorPage />
                        </div>
                    </div>
                </section>
            </ScrollReveal>


            {/* --- BENTO GRID FEATURES --- */}
            <section className="py-12 sm:py-16 md:py-28 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <ScrollReveal direction="down">
                        <div className="mb-10 sm:mb-16 md:mb-20 text-center max-w-2xl mx-auto">
                            <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">
                                Why Handwritten?
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
                                More than just <br className="hidden sm:block"/>
                                <span className="italic font-serif text-neutral-600">pixels on a screen.</span>
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:grid-rows-2 h-[800px] md:h-[600px]">
                        {/* Large Card: Advanced Simulation Engine */}
                        <ScrollReveal className="md:col-span-2 md:row-span-2" direction="right" fillHeight>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="h-full bg-white rounded-[3rem] relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col"
                            >
                                {/* Textured Background */}
                                <div className="absolute inset-0 mesh-gradient opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-500" />
                                <div className="absolute inset-0 noise-bg opacity-[0.03]" />
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="relative z-10 p-10 sm:p-14 h-full flex flex-col justify-start gap-10">
                                    <div className="w-20 h-20 bg-white/80 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(79,70,229,0.2)] ring-1 ring-black/[0.03] flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <PenTool className="text-indigo-600" size={32} />
                                    </div>
                                    <div className="max-w-md relative z-20">
                                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6 text-neutral-900 tracking-tight leading-[1.1]">
                                            Advanced Simulation <span className="text-indigo-600/80">Engine</span>
                                        </h3>
                                        <p className="text-neutral-500 text-lg sm:text-xl leading-relaxed font-medium">
                                            Total control over your handwriting's soul. Fine-tune organic <b className="text-neutral-900 font-bold border-b-2 border-indigo-100 pb-0.5">Jitter</b>, <b className="text-neutral-900 font-bold border-b-2 border-indigo-100 pb-0.5">Pressure</b>, and <b className="text-neutral-900 font-bold border-b-2 border-indigo-100 pb-0.5">Smudge</b> levels.
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Visual Decoration - Enhanced Paper Stack */}
                                <div className="absolute right-0 bottom-0 w-3/5 h-3/5 translate-x-8 translate-y-8 hidden lg:block pointer-events-none z-10">
                                    <div className="relative w-full h-full">
                                        {/* Back Paper */}
                                        <div className="absolute inset-0 bg-neutral-50 rounded-tl-[3.5rem] shadow-sm transform rotate-6 translate-x-4 translate-y-4 border border-neutral-100" />
                                        {/* Middle Paper */}
                                        <div className="absolute inset-0 bg-neutral-100/50 rounded-tl-[3.5rem] shadow-md transform rotate-3 translate-x-2 translate-y-2 border border-neutral-100" />
                                        {/* Front Paper (Main) */}
                                        <motion.div 
                                            initial={{ rotate: 0, y: 40, opacity: 0 }}
                                            whileInView={{ rotate: -4, y: 0, opacity: 1 }}
                                            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute inset-0 bg-white rounded-tl-[3.5rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.12)] p-8 border border-neutral-100 overflow-hidden"
                                        >   
                                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px] opacity-40" />
                                            <div className="w-full h-full flex items-center justify-center text-center p-8 relative z-10">
                                                <span className="font-handwriting text-3xl sm:text-4xl text-neutral-800 leading-relaxed mix-blend-multiply opacity-90 block max-w-[280px]">
                                                    "The details are not the details. They make the design."
                                                </span>
                                            </div>
                                            {/* Corner shadow for depth */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.02] via-transparent to-transparent pointer-events-none" />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </ScrollReveal>

                        {/* Top Right: Export Anywhere (Dark Glassmorphism) */}
                        <ScrollReveal direction="left" delay={0.2} fillHeight>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="h-full bg-gradient-to-br from-[#1A1F2C] via-[#111827] to-indigo-950/40 text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl flex flex-col ring-1 ring-white/10"
                            >
                                {/* Animated Glows */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700" />
                                <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4" />
                                
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse-slow" />
                                        <div className="relative w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center mb-8 ring-1 ring-white/20 shadow-xl shadow-indigo-500/5 group-hover:scale-110 transition-transform duration-500">
                                            <Download className="text-indigo-200" size={28} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4 font-display tracking-tight">Export <span className="text-indigo-300">Anywhere</span></h3>
                                        <p className="text-white/60 text-base leading-relaxed font-medium">
                                            Convert your work into high-fidelity <span className="text-white">PDF documents</span> or high-res <span className="text-white">PNGs</span>.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </ScrollReveal>

                        {/* Bottom Right: AI Humanizer (Soft Elegant) */}
                        <ScrollReveal direction="left" delay={0.4} fillHeight>
                            <motion.div 
                                whileHover={{ y: -5 }}
                                className="h-full bg-white rounded-[3rem] p-10 relative overflow-hidden group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] border border-neutral-100 flex flex-col"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/60 via-transparent to-transparent opacity-80" />
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl animate-blob" />
                                
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="w-16 h-16 bg-rose-50/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 ring-1 ring-rose-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                        <Type className="text-rose-500" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-4 text-neutral-900 font-display tracking-tight">AI Humanizer</h3>
                                        <p className="text-neutral-500 text-base leading-relaxed font-medium">
                                            Tap into <span className="text-neutral-900 font-semibold italic">Gemini</span> to rewrite notes into organic, natural human prose.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* --- ABOUT SECTION --- */}
            <ScrollReveal>
                <AboutSection />
            </ScrollReveal>

            {/* --- CALL TO ACTION --- */}
            <ScrollReveal direction="up" delay={0.2}>
                <section className="py-12 pb-28 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="bg-neutral-900 text-white rounded-[3rem] p-8 sm:p-12 md:p-24 shadow-2xl relative overflow-hidden"
                        >
                            {/* Abstract BG */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[60px] sm:blur-[120px]" 
                            />

                            <div className="relative z-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-6 sm:mb-8 tracking-tight leading-none">
                                    Start your <br className="hidden sm:block"/>
                                    <motion.span 
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        className="font-serif italic text-indigo-400"
                                    >masterpiece.</motion.span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto font-medium">
                                    No signup required for basic use. Jump right in and feel the difference.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={scrollToEditor}
                                    className="px-10 py-5 bg-white text-neutral-900 rounded-full font-bold text-lg hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3 mx-auto group"
                                >
                                    <span>Launch Editor</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </ScrollReveal>

        </div>
    );
}

function HeroSection() {
    // Floating elements with animations - Enriched for Mobile
    const floatingElements = [
        { icon: '✒️', x: 'left-4 sm:left-[5%]', y: 'top-[15%] sm:top-[12%]', size: 'text-6xl sm:text-7xl', hideOnMobile: false, duration: 20, delay: 0 },
        { icon: '📝', x: 'left-[3%]', y: 'top-[35%]', size: 'text-4xl sm:text-6xl', hideOnMobile: true, duration: 15, delay: 2 },
        { icon: '🖋️', x: 'right-4 sm:right-[5%]', y: 'top-[12%] sm:top-[10%]', size: 'text-6xl sm:text-7xl', hideOnMobile: false, duration: 25, delay: 1 },
        { icon: '💫', x: 'right-[8%]', y: 'top-[30%]', size: 'text-4xl sm:text-6xl', hideOnMobile: false, duration: 18, delay: 3 },
        { icon: '📄', x: 'left-[2%]', y: 'top-[50%]', size: 'text-6xl', hideOnMobile: true, duration: 22, delay: 4 },
        { icon: '📖', x: 'right-[2%]', y: 'top-[48%]', size: 'text-6xl', hideOnMobile: true, duration: 19, delay: 2 },
        { icon: '🖊️', x: 'left-4 sm:left-[5%]', y: 'bottom-[15%] sm:bottom-[10%]', size: 'text-6xl sm:text-7xl', hideOnMobile: false, duration: 21, delay: 5 },
        { icon: '✏️', x: 'left-[3%]', y: 'bottom-[28%]', size: 'text-4xl sm:text-6xl', hideOnMobile: true, duration: 17, delay: 0 },
        { icon: '🎭', x: 'right-4 sm:right-[5%]', y: 'bottom-[15%] sm:bottom-[10%]', size: 'text-6xl sm:text-7xl', hideOnMobile: false, duration: 23, delay: 1 },
        { icon: '💡', x: 'right-[12%]', y: 'bottom-[35%]', size: 'text-4xl sm:text-6xl', hideOnMobile: false, duration: 20, delay: 3 },
    ];

    return (
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full max-w-7xl h-full relative">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[60px] sm:blur-[140px] mix-blend-multiply" 
                    />
                </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingElements.map((el, index) => (
                    <motion.div
                        key={index}
                        initial={{ y: 0 }}
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, index % 2 === 0 ? 10 : -10, 0]
                        }}
                        transition={{
                            duration: el.duration,
                            repeat: Infinity,
                            delay: el.delay,
                            ease: "easeInOut"
                        }}
                        className={`absolute ${el.x} ${el.y} ${el.size} ${el.hideOnMobile ? 'hidden sm:block' : ''} opacity-70`}
                        style={{ 
                            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))'
                        }}
                    >
                        {el.icon}
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl py-24">
                {/* Central Text Content */}
                <div className="text-center pt-20 pb-12 relative">
                    {/* Background Soft Glow for Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="flex flex-col items-center">
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="text-5xl sm:text-9xl lg:text-[11rem] font-display font-bold leading-none tracking-tighter text-neutral-900 mb-4"
                        >
                            Handwritten.
                        </motion.h1>
                        <motion.h2 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-neutral-500 leading-tight"
                        >
                            Text to Handwriting Converter
                        </motion.h2>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section 
            id="about"
            className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden"
        >
             <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <span className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-4 block">The Creator</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-900">Behind the Ink</h2>
                </div>

                <div className="relative w-full max-w-6xl mx-auto">
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-black/5 p-2 md:p-4">
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
                                    <SocialLink href="https://www.linkedin.com/in/arshvermadev/" icon={Linkedin} />
                                    <SocialLink href="https://x.com/TheArshVerma" icon={Twitter} />
                                    <SocialLink href="mailto:arshverma.dev@gmail.com" icon={Mail} />
                                </div>
                            </div>

                             <div className="flex-1 p-8 md:p-16 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px]">
                                  <div className="max-w-2xl mx-auto space-y-8">
                                     <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 rotate-1">
                                         <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent" /> About Me</h4>
                                         <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                             I'm a student at <span className="font-bold text-ink">VIT Bhopal</span> with a passion for building digital experiences. Whether it's developing games in Unity or creating tools like Handwritten, I love turning ideas into reality.
                                         </p>
                                     </div>
                                     <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5 -rotate-1">
                                         <h4 className="font-bold text-ink mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400" /> Philosophy</h4>
                                         <p className="text-ink/70 leading-relaxed font-serif text-lg">
                                             I focus on making things that look great and work even better. Coding isn't just about logic—it's about creating something that feels <span className="font-handwriting text-2xl mx-2 text-accent">human</span>.
                                         </p>
                                     </div>
                                  </div>
                             </div>
                         </div>
                    </div>
                </div>
             </div>
        </section>
    );
}

function SocialLink({ href, icon: Icon }: { href: string, icon: React.ElementType }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-gray-50 transition-all shadow-xl hover:scale-110 hover:-translate-y-1"
        >
            <Icon size={18} />
        </a>
    );
}
