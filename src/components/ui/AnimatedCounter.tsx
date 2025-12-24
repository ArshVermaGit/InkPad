import { useRef } from 'react';
import { useInView, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export default function AnimatedCounter({
    value,
    duration = 2,
    className = '',
    prefix = '',
    suffix = ''
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    const springValue = useSpring(0, {
        duration: duration * 1000,
        bounce: 0
    });

    const displayValue = useTransform(springValue, (current) => Math.round(current));

    useEffect(() => {
        if (inView) {
            springValue.set(value);
        }
    }, [inView, value, springValue]);

    useEffect(() => {
        return displayValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${latest.toLocaleString()}${suffix}`;
            }
        });
    }, [displayValue, prefix, suffix]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
}
