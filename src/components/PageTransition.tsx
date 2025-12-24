import { motion, type Variants } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)'
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        filter: 'blur(10px)',
        transition: {
            duration: 0.3,
            ease: 'easeIn'
        }
    }
};

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
