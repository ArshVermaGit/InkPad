import { motion } from 'framer-motion';

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ink-900 text-white py-6 px-4 shadow-lg"
        >
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight">
                    Handwritten
                </h1>
                <p className="text-ink-300 mt-2">
                    Transform your text into beautiful handwriting
                </p>
            </div>
        </motion.header>
    );
}
