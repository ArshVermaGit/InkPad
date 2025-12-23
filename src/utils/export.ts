import jsPDF from 'jspdf';
import type { ExportFormat } from '../types';

export const exportToPDF = async (canvas: HTMLCanvasElement, filename: string = 'handwriting.pdf') => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
};

export const exportToImage = async (
    canvas: HTMLCanvasElement,
    format: ExportFormat = 'png',
    filename?: string
) => {
    const link = document.createElement('a');
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'pdf' ? 'png' : format;

    link.download = filename || `handwriting.${extension}`;
    link.href = canvas.toDataURL(mimeType);
    link.click();
};

export const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};
