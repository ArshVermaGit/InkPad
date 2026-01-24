import { Github, Linkedin, Twitter, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-paper pt-16 pb-8 border-t border-black/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 mb-12 sm:mb-16">
                    {/* Brand Column */}
                    <div className="sm:col-span-2 lg:col-span-5">
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                             <img src={logo} alt="Handwritten" className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-500" />
                             <span className="font-display font-bold text-2xl tracking-tight text-neutral-900">Handwritten.</span>
                        </Link>
                        <p className="text-neutral-500 leading-relaxed max-w-sm text-sm font-medium">
                            A digital sanctuary for your thoughts. We blend the nostalgia of analog writing with the power of modern technology.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-3 lg:col-start-7">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Product</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Home</Link></li>
                            <li><a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">About</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Socials</h4>
                        <ul className="space-y-3">
                            <li><a href="https://twitter.com/arshverma" className="text-neutral-500 hover:text-sky-500 transition-colors flex items-center gap-3 text-sm font-bold"><Twitter size={16} /> Twitter</a></li>
                            <li><a href="https://github.com/ArshVermaGit" className="text-neutral-500 hover:text-purple-600 transition-colors flex items-center gap-3 text-sm font-bold"><Github size={16} /> GitHub</a></li>
                            <li><a href="https://linkedin.com/in/arshverma" className="text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-3 text-sm font-bold"><Linkedin size={16} /> LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-black/5 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-xs text-neutral-400 font-bold">
                        &copy; {new Date().getFullYear()} Handwritten Inc. All rights reserved.
                    </p>
                    <p className="text-xs text-neutral-400 font-bold flex items-center gap-2">
                        Built with <Heart size={12} className="text-rose-500 fill-current" /> by <a href="https://www.arshcreates.com" className="text-neutral-900 hover:underline underline-offset-4">Arsh Verma</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
