import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-router-dom'],
          'vendor-export': ['jspdf', 'html2canvas', 'jszip'],
          'vendor-ai': ['@google/generative-ai'],
        }
      }
    }
  }
})
