import LZString from 'lz-string';
import type { AppState } from '../types';

/**
 * Serializes the current app state into a compressed shareable string.
 * We focus on text, pages, and key rendering settings.
 */
export function serializeState(state: AppState): string {
    const dataToShare = {
        text: state.text,
        pages: state.pages,
        handwritingStyle: state.handwritingStyle,
        fontSize: state.fontSize,
        inkColor: state.inkColor,
        paperMaterial: state.paperMaterial,
        paperPattern: state.paperPattern,
        settings: state.settings,
    };

    const json = JSON.stringify(dataToShare);
    return LZString.compressToEncodedURIComponent(json);
}

/**
 * Deserializes a state string back into an object.
 */
export function deserializeState(hash: string): any {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (!decompressed) return null;
        return JSON.parse(decompressed);
    } catch (err) {
        console.error('Failed to deserialize state:', err);
        return null;
    }
}

/**
 * Generates a shareable URL for the current state.
 */
export function generateShareUrl(state: AppState): string {
    const hash = serializeState(state);
    const url = new URL(window.location.href);
    url.searchParams.set('share', hash);
    return url.toString();
}

/**
 * Copies the share URL to clipboard.
 */
export async function copyShareUrl(state: AppState): Promise<boolean> {
    try {
        const url = generateShareUrl(state);
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy share URL:', err);
        return false;
    }
}
