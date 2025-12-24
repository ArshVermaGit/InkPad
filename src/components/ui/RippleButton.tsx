import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface RippleButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    loading?: boolean;
}

export default function RippleButton({
    children,
    variant = 'primary',
    className = '',
    onClick,
    loading = false,
    disabled,
    ...props
}: RippleButtonProps) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);
        if (onClick) onClick(e);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 800);
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-black text-white hover:bg-gray-800';
            case 'secondary':
                return 'bg-white text-black border border-gray-200 hover:bg-gray-100';
            case 'ghost':
                return 'bg-transparent hover:bg-gray-100 text-gray-700';
            default:
                return 'bg-black text-white';
        }
    };

    return (
        <motion.button
            whileHover={{ scale: (loading || disabled) ? 1 : 1.02, boxShadow: (loading || disabled) ? "none" : "0 5px 15px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: (loading || disabled) ? 1 : 0.98 }}
            className={`relative overflow-hidden px-6 py-3 font-medium rounded-lg transition-colors duration-300 ${getVariantClasses()} ${className} ${(loading || disabled) ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleClick}
            disabled={loading || disabled}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {loading && <LoadingSpinner size={16} />}
                {children}
            </span>
            <AnimatePresence>
                {!loading && !disabled && ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            position: 'absolute',
                            top: ripple.y,
                            left: ripple.x,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.4)',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                ))}
            </AnimatePresence>
        </motion.button>
    );
}
