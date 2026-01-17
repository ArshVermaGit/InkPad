import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

interface SwipeableContainerProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
    threshold?: number;
}

export default function SwipeableContainer({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = "",
    threshold = 50
}: SwipeableContainerProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        setIsDragging(false);
        if (info.offset.x < -threshold && onSwipeLeft) {
            onSwipeLeft();
        } else if (info.offset.x > threshold && onSwipeRight) {
            onSwipeRight();
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={`touch-pan-y ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
            {children}
        </motion.div>
    );
}
