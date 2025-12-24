import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    Clipboard,
    Mic,
    ScanLine,
    Chrome,
    Loader2,
    AlertCircle,
    X,
    ChevronRight
} from 'lucide-react';
import { useStore } from '../lib/store';
import {
    extractTextFromDocx,
    extractTextFromPdf,
    performOcr,
    readTxtFile
} from '../utils/textExtraction';

export default function ImportMenu() {
    const { setText } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const ocrInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (type: 'txt' | 'docx' | 'pdf' | 'clipboard' | 'image') => {
        setIsLoading(true);
        setError(null);
        try {
            let content = '';
            if (type === 'clipboard') {
                content = await navigator.clipboard.readText();
            } else if (type === 'txt' || type === 'docx' || type === 'pdf') {
                fileInputRef.current?.setAttribute('accept', type === 'txt' ? '.txt' : type === 'docx' ? '.docx' : '.pdf');
                fileInputRef.current?.click();
                return; // Wait for onChange
            } else if (type === 'image') {
                ocrInputRef.current?.click();
                return; // Wait for onChange
            }

            if (content) {
                setText(content);
                setIsOpen(false);
            }
        } catch (err) {
            setError('Import failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            let content = '';
            if (file.name.endsWith('.txt')) {
                content = await readTxtFile(file);
            } else if (file.name.endsWith('.docx')) {
                content = await extractTextFromDocx(file);
            } else if (file.name.endsWith('.pdf')) {
                content = await extractTextFromPdf(file);
            }

            if (content) {
                setText(content);
                setIsOpen(false);
            }
        } catch (err) {
            setError('Failed to extract text from file.');
            console.error(err);
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const handleOcrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            const content = await performOcr(file);
            if (content) {
                setText(content);
                setIsOpen(false);
            }
        } catch (err) {
            setError('OCR failed. Make sure the image is clear.');
            console.error(err);
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const toggleSpeech = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => {
            setError('Speech recognition error.');
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            // Append to current text
            const currentText = useStore.getState().text;
            setText(currentText + ' ' + transcript);
        };

        recognition.start();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-50 text-gray-400 hover:text-black transition-colors rounded-lg flex items-center gap-2"
                title="Import Content"
            >
                <Upload size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Import</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 shadow-2xl z-50 overflow-hidden rounded-xl"
                        >
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Import Method</h3>
                                {isLoading && <Loader2 size={12} className="animate-spin text-black" />}
                            </div>

                            <div className="p-2">
                                <ImportOption
                                    icon={<Clipboard size={14} />}
                                    label="Paste Clipboard"
                                    description="Plain text or formatted"
                                    onClick={() => handleImport('clipboard')}
                                />
                                <ImportOption
                                    icon={<FileText size={14} />}
                                    label="Upload Document"
                                    description=".txt, .docx, .pdf"
                                    onClick={() => handleImport('txt')} // Defaults to generic file picker check logic
                                />
                                <ImportOption
                                    icon={<ScanLine size={14} />}
                                    label="OCR / Handled Scan"
                                    description="Extract text from photo"
                                    onClick={() => handleImport('image')}
                                />
                                <ImportOption
                                    icon={<Mic size={14} className={isListening ? 'text-red-500' : ''} />}
                                    label={isListening ? 'Listening...' : 'Dictation'}
                                    description="Speech to text"
                                    onClick={toggleSpeech}
                                    active={isListening}
                                />
                                <ImportOption
                                    icon={<Chrome size={14} />}
                                    label="Google Docs"
                                    description="Import from cloud"
                                    onClick={() => setError('Google Docs integration requires API Client ID.')}
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-4 py-3 bg-red-50 text-red-600 text-[10px] font-bold flex items-center gap-2"
                                >
                                    <AlertCircle size={12} />
                                    <span>{error}</span>
                                    <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
                                        <X size={10} />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.pdf"
                className="hidden"
                onChange={handleFileChange}
            />
            <input
                ref={ocrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleOcrChange}
            />
        </div>
    );
}

function ImportOption({ icon, label, description, onClick, active }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-all text-left rounded-lg group ${active ? 'bg-gray-50' : ''}`}
        >
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 group-hover:border-black group-hover:bg-black group-hover:text-white transition-all ${active ? 'bg-black text-white border-black' : 'text-gray-400'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-black flex items-center justify-between">
                    {label}
                    <ChevronRight size={10} className="text-gray-200 group-hover:text-black transition-colors" />
                </div>
                <div className="text-[9px] font-medium text-gray-400 mt-0.5">{description}</div>
            </div>
        </button>
    );
}
