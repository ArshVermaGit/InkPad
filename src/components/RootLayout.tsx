import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function RootLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <div className="flex-1 flex flex-col pt-16 sm:pt-20">
                <main className="flex-1 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            <Footer />
        </div>
    );
}
