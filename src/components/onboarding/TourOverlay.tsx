import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../lib/store';
import { ChevronRight, X, PenTool, Download, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TourStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    icon?: LucideIcon;
}

const steps: TourStep[] = [
    {
        target: 'textarea', // Targeting the main editor
        title: 'Your Canvas',
        description: 'Start typing here. Your text will instantly transform into beautiful handwriting.',
        position: 'right',
        icon: PenTool
    },
    {
        target: 'button[title="Template Library"]', // Targeting template button
        title: 'Choose Style',
        description: 'Browse our gallery of handwriting styles to find one that matches your vibe.',
        position: 'bottom',
        icon: Settings
    },
    {
        target: 'button[title="Export Manuscript"]', // Targeting export button
        title: 'Export to PDF',
        description: 'Ready to share? Download your masterpiece as a high-quality PDF.',
        position: 'bottom',
        icon: Download
    }
];

export default function TourOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const { completeTour } = useStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const handleComplete = useCallback(() => {
        completeTour();
        onClose();
        setCurrentStep(0);
    }, [completeTour, onClose]);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            handleComplete();
        }
    }, [currentStep, handleComplete]);

    useEffect(() => {
        if (!isOpen) {
            Promise.resolve().then(() => setTargetRect(null));
            return;
        }

        // Find target element
        const step = steps[currentStep];
        const element = document.querySelector(step.target);

        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // If element not found, skip or end (fallback)
            if (currentStep < steps.length - 1) {
                setCurrentStep(curr => curr + 1);
            } else {
                handleComplete();
            }
        }
    }, [currentStep, isOpen, handleComplete]);

    if (!isOpen || !targetRect) return null;

    const step = steps[currentStep];
    const Icon = step.icon;

    // Calculate tooltip position
    const getTooltipStyle = () => {
        const offset = 16;
        switch (step.position) {
            case 'right':
                return { top: targetRect.top + targetRect.height / 2 - 80, left: targetRect.right + offset };
            case 'bottom':
                return { top: targetRect.bottom + offset, left: targetRect.left + targetRect.width / 2 - 140 };
            case 'top':
                return { bottom: window.innerHeight - targetRect.top + offset, left: targetRect.left + targetRect.width / 2 - 140 };
            case 'left':
                return { top: targetRect.top, right: window.innerWidth - targetRect.left + offset };
            default:
                return { top: targetRect.bottom + offset, left: targetRect.left };
        }
    };

    return (
        <div className="fixed inset-0 z-100 pointer-events-none">
            {/* Dark Backdrop with Hole */}
            <div className="absolute inset-0 bg-black/50 overflow-hidden mix-blend-hard-light">
                {/* This is a visual trick, robust implementation usually requires SVG masks or box-shadow 
                     For simplicity/performance in this context, we use a simple focused spotlight highlight instead 
                     or just an overlay with a hole if possible.
                     Let's stick to a simple overlay + highlighted element approach.
                 */}
            </div>

            {/* Alternative: separate semi-transparent divs around the hole */}
            <div className="fixed inset-0 bg-black/40 pointer-events-auto transition-opacity duration-500" />

            {/* Highlight Box */}
            <motion.div
                layout
                initial={false}
                animate={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute border-2 border-white rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none z-101"
            />

            {/* Tooltip Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentStep}
                style={getTooltipStyle()}
                className="absolute w-72 bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto z-102"
            >
                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 text-gray-300 hover:text-black transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-3 mb-3">
                    {Icon && <div className="p-2 bg-black text-white rounded-lg"><Icon size={16} /></div>}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {currentStep + 1} of {steps.length}</span>
                </div>

                <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {step.description}
                </p>

                <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${idx === currentStep ? 'w-6 bg-black' : 'w-1.5 bg-gray-200'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={12} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
