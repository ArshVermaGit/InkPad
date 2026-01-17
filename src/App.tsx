import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import RootLayout from './components/RootLayout';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import GalleryPage from './pages/GalleryPage';
import StylesPage from './pages/StylesPage';
import AboutPage from './pages/AboutPage';
import { ToastProvider } from './components/ui/Toast';
import PageTransition from './components/PageTransition';

function InnerApp() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="editor" element={<PageTransition><EditorPage /></PageTransition>} />
          <Route path="gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
          <Route path="styles" element={<PageTransition><StylesPage /></PageTransition>} />
          <Route path="about" element={<PageTransition><AboutPage /></PageTransition>} />
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
