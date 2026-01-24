import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import RootLayout from './components/RootLayout';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import PageTransition from './components/PageTransition';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
    <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function InnerApp() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<PageTransition><LandingPage /></PageTransition>} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
