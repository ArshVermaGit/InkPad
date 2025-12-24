import { useEffect } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

            shortcuts.forEach(shortcut => {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = !!shortcut.ctrl === ctrlKey;
                const altMatch = !!shortcut.alt === event.altKey;
                const shiftMatch = !!shortcut.shift === event.shiftKey;

                if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
                    event.preventDefault();
                    shortcut.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
