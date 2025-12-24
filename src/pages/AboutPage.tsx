import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter, ArrowRight } from 'lucide-react';
import photo from '../assets/arsh.jpg';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-32">
                <div className="flex flex-col md:flex-row gap-16 items-start">

                    {/* Left Column: Photo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:w-1/3"
                    >
                        <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl group">
                            <img
                                src={photo}
                                alt="Arsh Verma"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    </motion.div>

                    {/* Right Column: Bio */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:w-2/3 space-y-12"
                    >
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">The Developer</h4>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black mb-8 leading-[0.9]">
                                ARSH<br />VERMA.
                            </h1>
                            <div className="h-1 w-24 bg-black" />
                        </div>

                        <div className="space-y-6 text-lg font-medium text-gray-600 leading-relaxed max-w-2xl">
                            <p>
                                I'm a Tech Gaming Technology student at VIT Bhopal and a full-stack digital creator.
                                My expertise lies in game development with Unity, but I also build dynamic websites and apps.
                                I've earned numerous certifications and treat every project, like my portfolio <span className="text-black font-bold">arshcreates</span>,
                                as an opportunity to blend creative vision with technical precision.
                            </p>
                            <p>
                                My development philosophy is simple: turn great ideas into polished, engaging digital reality.
                                I love the challenge of coding and design, focusing on creating seamless user experiences across all platforms.
                            </p>
                            <p className="text-black font-bold">
                                Take a look around—I'm ready to tackle the next big project!
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <SocialLink href="https://github.com/ArshVermaGit" icon={Github} label="GitHub" />
                            <SocialLink href="https://linkedin.com/in/arshverma" icon={Linkedin} label="LinkedIn" />
                            <SocialLink href="https://twitter.com/arshverma" icon={Twitter} label="Twitter" />
                            <SocialLink href="mailto:Arshverma.dev@gmail.com" icon={Mail} label="Email Me" />
                        </div>

                        <div className="pt-12 border-t border-gray-100">
                            <a
                                href="https://www.arshcreates.com" // Assuming this URL based on request, or generic portfolio link
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-4 text-black font-black uppercase tracking-widest text-sm hover:opacity-70 transition-opacity"
                            >
                                View Portfolio <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function SocialLink({ href, icon: Icon, label }: any) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-4 border border-gray-100 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all group"
        >
            <Icon size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </a>
    );
}
