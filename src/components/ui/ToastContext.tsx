import { createContext } from 'react';
import type { ToastType } from '../../types';

export interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
