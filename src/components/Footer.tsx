import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-16 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-sm">
                        <h3 className="text-2xl font-display font-bold mb-4 tracking-tighter uppercase">InkPad</h3>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            A premium, monochromatic workspace for generating authentic handwriting from digital text. Designed for students, professionals, and creators.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Designer</h4>
                        <a
                            href="https://github.com/ArshVermaGit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold border-b border-black transition-all hover:bg-black hover:text-white px-1"
                        >
                            Arsh Verma
                        </a>
                        <div className="flex gap-4 mt-2">
                            <a href="https://github.com/ArshVermaGit" className="text-gray-400 hover:text-black transition-colors"><Github size={18} /></a>
                            <a href="https://linkedin.com/in/arshverma" className="text-gray-400 hover:text-black transition-colors"><Linkedin size={18} /></a>
                            <a href="https://X.com/arshverma" className="text-gray-400 hover:text-black transition-colors"><Twitter size={18} /></a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Navigation</h4>
                        <ul className="space-y-2 text-sm font-bold uppercase tracking-widest">
                            <li><a href="/" className="hover:text-gray-400">Home</a></li>
                            <li><a href="/editor" className="hover:text-gray-400">Editor</a></li>
                            <li><a href="/gallery" className="hover:text-gray-400">Gallery</a></li>
                            <li><a href="/styles" className="hover:text-gray-400">Styles</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    <p>&copy; {new Date().getFullYear()} InkPad Ecosystem</p>
                    <p>Privacy / Terms / API</p>
                </div>
            </div>
        </footer>
    );
}
