import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import type { HandwritingStyle } from '../types';

export default function StylesPage() {
    const { setHandwritingStyle } = useStore();
    const navigate = useNavigate();

    const styles = [
        {
            id: 'cursive' as HandwritingStyle,
            name: 'Flowing Cursive',
            desc: 'Elegant, interconnected strokes for formal letters.',
            sampleText: 'My dearest friend, how have you been doing lately?'
        },
        {
            id: 'script' as HandwritingStyle,
            name: 'Modern Script',
            desc: 'Minimalist and artistic script with unique character spacing.',
            sampleText: 'Innovation distinguishes between a leader and a follower.'
        },
        {
            id: 'print' as HandwritingStyle,
            name: 'Clean Print',
            desc: 'Legible, separated characters for professional assignments.',
            sampleText: 'The quick brown fox jumps over the lazy dog.'
        }
    ];

    const handleSelect = (id: HandwritingStyle) => {
        setHandwritingStyle(id);
        navigate('/editor');
    };

    return (
        <div className="section-padding bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-2xl mb-24">
                    <h1 className="text-5xl md:text-7xl mb-8 tracking-tighter">Style Showcase.</h1>
                    <p className="text-gray-500 text-xl font-medium">
                        Explore our curated collection of handwriting engines.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {styles.map((style, i) => (
                        <motion.div
                            key={style.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleSelect(style.id)}
                            className="card-premium group cursor-pointer border-l-4 border-l-transparent hover:border-l-black flex flex-col lg:flex-row justify-between items-center gap-12"
                        >
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] block mb-4">Edition 0{i + 1}</span>
                                <h2 className="text-3xl md:text-4xl mb-4 group-hover:translate-x-2 transition-transform duration-500 uppercase tracking-tighter">{style.name}</h2>
                                <p className="text-gray-500 max-w-md font-medium">{style.desc}</p>
                            </div>

                            <div className="flex-1 w-full lg:w-auto overflow-hidden bg-gray-50 p-8 flex items-center justify-center">
                                <span
                                    className="text-4xl md:text-5xl text-black select-none pointer-events-none"
                                    style={{
                                        fontFamily: style.id === 'cursive' ? 'Caveat' : style.id === 'script' ? 'Dancing Script' : 'Patrick Hand'
                                    }}
                                >
                                    {style.sampleText}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
