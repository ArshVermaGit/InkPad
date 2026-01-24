import { Github, Linkedin, Twitter, Heart, ArrowUpRight } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
    return (
        <footer className="bg-[#FAF9F6] text-ink pt-20 pb-10 border-t border-black/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                
                {/* CTA Section - Redesigned for Light Mode */}
                <div className="flex flex-col md:flex-row items-center justify-between pb-20 border-b border-black/5 gap-10">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-ink">
                            Ready to write <br/>
                            <span className="text-accent italic font-serif">with soul?</span>
                        </h2>
                        <p className="text-ink/60 max-w-md text-lg">
                            Join thousands of writers who have rediscovered the joy of digital handwriting.
                        </p>
                    </div>
                    <a 
                        href="/editor" 
                        className="group flex items-center gap-4 px-8 py-5 bg-neutral-900 text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl shadow-neutral-900/20"
                    >
                        Open Editor
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-neutral-900 transition-colors">
                            <ArrowUpRight size={18} />
                        </div>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 py-16">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                             <img src={logo} alt="InkPad" className="w-14 h-14 object-contain" />
                             <span className="font-display font-bold text-3xl tracking-tight text-ink">InkPad.</span>
                        </div>
                        <p className="text-ink/60 leading-relaxed max-w-sm text-sm font-medium">
                            A digital sanctuary for your thoughts. We blend the nostalgia of analog writing with the power of modern technology.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-ink/40 mb-8">Navigation</h4>
                        <ul className="space-y-4">
                            <li><a href="/" className="text-ink/60 hover:text-ink transition-colors text-sm font-bold">Home</a></li>
                            <li><a href="/editor" className="text-ink/60 hover:text-ink transition-colors text-sm font-bold">Editor</a></li>
                            <li><a href="/about" className="text-ink/60 hover:text-ink transition-colors text-sm font-bold">About Us</a></li>
                            <li><a href="#" className="text-ink/60 hover:text-ink transition-colors text-sm font-bold">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-ink/40 mb-8">Socials</h4>
                        <ul className="space-y-4">
                            <li><a href="https://twitter.com/arshverma" className="text-ink/60 hover:text-ink transition-colors flex items-center gap-3 text-sm font-bold group"><Twitter size={16} className="group-hover:text-sky-500 transition-colors"/> Twitter</a></li>
                            <li><a href="https://github.com/ArshVermaGit" className="text-ink/60 hover:text-ink transition-colors flex items-center gap-3 text-sm font-bold group"><Github size={16} className="group-hover:text-purple-600 transition-colors"/> GitHub</a></li>
                            <li><a href="https://linkedin.com/in/arshverma" className="text-ink/60 hover:text-ink transition-colors flex items-center gap-3 text-sm font-bold group"><Linkedin size={16} className="group-hover:text-blue-600 transition-colors"/> LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-ink/40 font-bold">
                        &copy; {new Date().getFullYear()} InkPad Inc. All rights reserved.
                    </p>
                    <p className="text-xs text-ink/40 font-bold flex items-center gap-2">
                        Designed & Built with <Heart size={12} className="text-red-500 fill-current" /> by <a href="https://www.arshcreates.com" className="text-ink hover:underline decoration-ink/30 underline-offset-4">Arsh Verma</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
