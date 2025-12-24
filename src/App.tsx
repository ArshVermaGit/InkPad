import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import RootLayout from './components/RootLayout';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import GalleryPage from './pages/GalleryPage';
import StylesPage from './pages/StylesPage';
import AboutPage from './pages/AboutPage';
import ExportManager from './components/ExportManager';
import { useStore } from './lib/store';
import { deserializeState } from './utils/ShareUtility';
import { ToastProvider } from './components/ui/Toast';
import PageTransition from './components/PageTransition';

function InnerApp() {
  const location = useLocation();
  const { setText, setPages, setHandwritingStyle, setFontSize, setInkColor, setPaperMaterial, setPaperPattern, updateSettings } = useStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sharedDataHash = params.get('share');
    if (sharedDataHash) {
      const data = deserializeState(sharedDataHash);
      if (data) {
        if (data.text !== undefined) setText(data.text);
        if (data.pages !== undefined) setPages(data.pages);
        if (data.handwritingStyle !== undefined) setHandwritingStyle(data.handwritingStyle);
        if (data.fontSize !== undefined) setFontSize(data.fontSize);
        if (data.inkColor !== undefined) setInkColor(data.inkColor);
        if (data.paperMaterial !== undefined) setPaperMaterial(data.paperMaterial);
        if (data.paperPattern !== undefined) setPaperPattern(data.paperPattern);
        if (data.settings !== undefined) updateSettings(data.settings);
      }
    }
  }, [location.search, setText, setPages, setHandwritingStyle, setFontSize, setInkColor, setPaperMaterial, setPaperPattern, updateSettings]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="editor" element={<PageTransition><EditorPage /></PageTransition>} />
          <Route path="gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
          <Route path="styles" element={<PageTransition><StylesPage /></PageTransition>} />
          <Route path="about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="export" element={<PageTransition><div className="section-padding max-w-4xl mx-auto"><ExportManager /></div></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <InnerApp />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
