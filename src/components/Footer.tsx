import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-paper border-t border-black/5 py-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-accent to-transparent opacity-20" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-20">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-6 group">
                            <div className="w-8 h-8 bg-ink flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-ink/10">
                                <span className="text-white font-display font-black text-lg italic leading-none">I</span>
                            </div>
                            <h3 className="text-2xl font-display font-bold text-ink tracking-tight uppercase">InkPad</h3>
                        </div>
                        <p className="text-ink/40 text-sm leading-relaxed font-medium">
                            A heritage-inspired digital studio for generating authentic handwriting. Bridging craftsmanship and technology to redefine modern document creation.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/20">Artisan</h4>
                        <a
                            href="https://github.com/ArshVermaGit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-display font-black text-ink hover:text-accent transition-colors duration-300 relative group"
                        >
                            Arsh Verma
                            <span className="absolute -bottom-1 left-0 w-full h-px bg-ink/10 group-hover:bg-accent transition-colors" />
                        </a>
                        <div className="flex gap-6 mt-2">
                            <a href="https://github.com/ArshVermaGit" className="text-ink/30 hover:text-ink transition-colors"><Github size={20} /></a>
                            <a href="https://linkedin.com/in/arshverma" className="text-ink/30 hover:text-ink transition-colors"><Linkedin size={20} /></a>
                            <a href="https://X.com/arshverma" className="text-ink/30 hover:text-ink transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ink/20">Studio</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-[0.2em] text-ink/40">
                            <li><a href="/" className="hover:text-ink transition-colors">Home</a></li>
                            <li><a href="/editor" className="hover:text-ink transition-colors">Workspace</a></li>
                            <li><a href="/gallery" className="hover:text-ink transition-colors">Exhibition</a></li>
                            <li><a href="/styles" className="hover:text-ink transition-colors">Styles</a></li>
                            <li><a href="/about" className="hover:text-ink transition-colors">Manifesto</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-32 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-ink/20">
                    <p>&copy; {new Date().getFullYear()} InkPad Ecosystem. Designed for Excellence.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-ink transition-colors">Privacy</a>
                        <a href="#" className="hover:text-ink transition-colors">Terms</a>
                        <a href="#" className="hover:text-ink transition-colors">API</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
