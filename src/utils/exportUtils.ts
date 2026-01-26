import { domToJpeg, domToPng } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveExportedFile } from '../lib/fileStorage';

interface ExportOptions {
    name: string;
    format: 'pdf' | 'zip';
    onProgress: (progress: number) => void;
}

// Helper to sanitize filename
function sanitizeFileName(name: string): string {
    return name.replace(/\.[^/.]+$/, "").replace(/[<>:"/\\|?*]/g, '').trim() || `handwritten-${Date.now()}`;
}

// Helper to identify visible pages
function getVisiblePages(): HTMLElement[] {
    const allTargets = Array.from(document.querySelectorAll('.handwritten-export-target'));
    return allTargets.filter(el => {
        const element = el as HTMLElement;
        if (element.offsetParent === null) return false;
        
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }) as HTMLElement[];
}

// Helper to capture a single page
async function capturePage(element: HTMLElement, format: 'jpeg' | 'png'): Promise<string> {
    const options = {
        scale: 2,
        width: 800, // Force standard width for export
        height: 1131, // Force standard height (A4 ratio) for export
        backgroundColor: '#ffffff',
        style: {
            transform: 'none',
            boxShadow: 'none',
            margin: '0',
            display: 'block',
            position: 'relative'
        },
        features: {
            // Ensure modern CSS features are handled
            removeControlCharacter: false
        }
    };

    if (format === 'jpeg') {
        return domToJpeg(element, { ...options, quality: 0.95 });
    } else {
        return domToPng(element, options);
    }
}

// Main Export Function
export async function exportDocument({ name, format, onProgress }: ExportOptions): Promise<void> {
    // 1. Wait for Fonts
    await document.fonts.ready;

    // 2. Get Pages
    const pages = getVisiblePages();
    if (pages.length === 0) {
        if (window.innerWidth < 1024) {
            throw new Error('Please switch to the "Preview" tab to export.');
        }
        throw new Error('No visible pages found to export.');
    }

    const totalPages = pages.length;
    const finalFileName = `${sanitizeFileName(name)}.${format}`;
    
    // 3. Process Pages in Batches (Parallel)
    // Batch size of 4 strikes a balance between speed and memory usage
    const BATCH_SIZE = 4;
    const pageImages: { index: number, data: string, type: 'jpeg' | 'png' }[] = [];
    
    for (let i = 0; i < totalPages; i += BATCH_SIZE) {
        const batch = pages.slice(i, i + BATCH_SIZE);
        
        // Process batch in parallel
        const batchResults = await Promise.all(batch.map(async (page, batchIndex) => {
            const globalIndex = i + batchIndex;
            
            if (format === 'pdf') {
                const dataUrl = await capturePage(page, 'jpeg');
                return { 
                    index: globalIndex, 
                    data: dataUrl,
                    type: 'jpeg' as const
                };
            } else {
                const dataUrl = await capturePage(page, 'png');
                // Remove data URL prefix for ZIP
                return { 
                    index: globalIndex, 
                    data: dataUrl.split(',')[1],
                    type: 'png' as const
                };
            }
        }));
        
        pageImages.push(...batchResults);
        
        // Update Progress
        const currentProgress = Math.round(((i + batch.length) / totalPages) * 90); // 90% for capture
        onProgress(currentProgress);
        
        // Small delay to let UI breathe
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Sort to ensure order (reassurance, though map preserves order)
    pageImages.sort((a, b) => a.index - b.index);

    // 4. Generate Final File
    if (format === 'pdf') {
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
        
        pageImages.forEach((img, idx) => {
            if (idx > 0) pdf.addPage();
            pdf.addImage(img.data, 'JPEG', 0, 0, 210, 297);
        });
        
        const blob = pdf.output('blob');
        triggerDownload(blob, finalFileName);
        saveExportedFile(blob, finalFileName, 'pdf').catch(() => {});
        
    } else {
        const zip = new JSZip();
        pageImages.forEach((img) => {
            zip.file(`page-${img.index + 1}.png`, img.data, { base64: true });
        });
        
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, finalFileName);
        saveExportedFile(content, finalFileName, 'zip').catch(() => {});
    }
    
    onProgress(100);
}

function triggerDownload(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
