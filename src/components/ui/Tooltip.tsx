import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({ content, children, position = 'top', delay = 0.2 }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Position logic
    const getPositionStyles = () => {
        switch (position) {
            case 'top':
                return { bottom: '100%', left: '50%', x: '-50%', marginBottom: '8px' };
            case 'bottom':
                return { top: '100%', left: '50%', x: '-50%', marginTop: '8px' };
            case 'left':
                return { top: '50%', right: '100%', y: '-50%', marginRight: '8px' };
            case 'right':
                return { top: '50%', left: '100%', y: '-50%', marginLeft: '8px' };
            default:
                return { bottom: '100%', left: '50%', x: '-50%', marginBottom: '8px' };
        }
    };

    const initialAnimation = () => {
        switch (position) {
            case 'top': return { opacity: 0, y: 5, x: '-50%' };
            case 'bottom': return { opacity: 0, y: -5, x: '-50%' };
            case 'left': return { opacity: 0, x: 5, y: '-50%' };
            case 'right': return { opacity: 0, x: -5, y: '-50%' };
            default: return { opacity: 0, y: 5 };
        }
    };

    const animateTarget = () => {
        switch (position) {
            case 'top': return { opacity: 1, y: 0, x: '-50%' };
            case 'bottom': return { opacity: 1, y: 0, x: '-50%' };
            case 'left': return { opacity: 1, x: 0, y: '-50%' };
            case 'right': return { opacity: 1, x: 0, y: '-50%' };
            default: return { opacity: 1, y: 0 };
        }
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={initialAnimation()}
                        animate={animateTarget()}
                        exit={initialAnimation()}
                        transition={{ duration: 0.2, delay }}
                        style={{ position: 'absolute', ...getPositionStyles() }}
                        className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                    >
                        {content}
                        {/* Arrow */}
                        {position === 'top' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                        )}
                        {position === 'bottom' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900" />
                        )}
                        {position === 'left' && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900" />
                        )}
                        {position === 'right' && (
                            <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-gray-900" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
