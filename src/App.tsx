import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { MenuProvider } from './contexts/MenuContext';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { MyCollectionsPage } from './pages/MyCollectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';

function AppContent() {
  const [isTabbarVisible, setIsTabbarVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 10) {
            // В самом верху - всегда показываем таббар
            setIsTabbarVisible(true);
          } else if (currentScrollY > lastScrollYRef.current) {
            // Скроллим вниз - скрываем
            setIsTabbarVisible(false);
          } else if (currentScrollY < lastScrollYRef.current) {
            // Скроллим вверх - показываем
            setIsTabbarVisible(true);
          }
          
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <MenuProvider>
      <div className="app">
        <Sidebar isVisible={isTabbarVisible} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/my-collections" element={<MyCollectionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </MenuProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
