import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    className?: string;
}

export default function LoadingSpinner({
    size = 24,
    color = 'currentColor',
    className = ''
}: LoadingSpinnerProps) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="3"
                strokeOpacity="0.25"
            />
            <motion.path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </motion.svg>
    );
}
