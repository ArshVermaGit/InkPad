import { useState, useEffect } from 'react';

export function TimeAgo({ date }: { date: Date | null }) {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!date) return;
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [date]);

    if (!date) return 'Ready';

    const secondsAgo = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    return `Saved ${secondsAgo}s ago`;
}
