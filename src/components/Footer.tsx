import { Github, Linkedin, Twitter, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

// Helper for smooth scrolling
const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = `/#${id}`;
    }
};

export default function Footer() {
    return (
        <footer className="bg-paper pt-16 pb-8 border-t border-black/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-10 lg:gap-8 mb-12 sm:mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-4">
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                             <img src={logo} alt="Handwritten" className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-500" />
                             <span className="font-display font-bold text-2xl tracking-tight text-neutral-900">Handwritten.</span>
                        </Link>
                        <p className="text-neutral-500 leading-relaxed max-w-sm text-sm font-medium">
                            A digital sanctuary for your thoughts. We blend the nostalgia of analog writing with the power of modern technology.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6 focus:outline-none">Product</h4>
                        <ul className="space-y-3">
                            <li><button onClick={() => scrollToSection('editor')} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold text-left">Editor</button></li>
                            <li><button onClick={() => scrollToSection('about')} className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold text-left">About Us</button></li>
                        </ul>
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/faq" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Help & FAQ</Link></li>
                            <li><Link to="/contact" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Cookie Policy</Link></li>
                            <li><Link to="/disclaimer" className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">Disclaimer</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6">Socials</h4>
                        <ul className="space-y-3">
                            <li><a href="https://x.com/TheArshVerma" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-sky-500 transition-colors flex items-center gap-3 text-sm font-bold"><Twitter size={14} /> X</a></li>
                            <li><a href="https://github.com/ArshVermaGit" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-purple-600 transition-colors flex items-center gap-3 text-sm font-bold"><Github size={14} /> GitHub</a></li>
                            <li><a href="https://www.linkedin.com/in/arshvermadev/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-blue-600 transition-colors flex items-center gap-3 text-sm font-bold"><Linkedin size={14} /> LinkedIn</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-black/5 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-neutral-400 font-bold">
                            &copy; {new Date().getFullYear()} Handwritten. All rights reserved.
                        </p>
                        <a href="https://github.com/ArshVermaGit/Handwritten" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors" title="View Source on GitHub">
                            <Github size={14} />
                        </a>
                    </div>
                    <p className="text-xs text-neutral-400 font-bold flex items-center gap-2">
                        Built with <Heart size={12} className="text-rose-500 fill-current" /> by <a href="https://www.linkedin.com/in/arshvermadev/" target="_blank" rel="noopener noreferrer" className="text-neutral-900 hover:underline underline-offset-4 font-black">Arsh Verma</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
