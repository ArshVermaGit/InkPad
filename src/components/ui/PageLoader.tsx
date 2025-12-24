import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';

interface PageLoaderProps {
    message?: string;
}

export default function PageLoader({ message = 'Initializing InkPad...' }: PageLoaderProps) {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
            >
                <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-xl">
                    <PenTool className="text-white w-10 h-10" />
                </div>
                <motion.div
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-200 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            <motion.div
                className="h-1 w-48 bg-gray-100 rounded-full overflow-hidden mb-4"
            >
                <motion.div
                    className="h-full bg-black rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold uppercase tracking-widest text-gray-400"
            >
                {message}
            </motion.p>
        </div>
    );
}
