import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import Eventos from './pages/Eventos.jsx';
import Publicaciones from './pages/Publicaciones.jsx';
import RedesAliadas from './pages/RedesAliadas.jsx';

// Scroll-to-top on route change (so /eventos doesn't start halfway down the page)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/publicaciones" element={<Publicaciones />} />
        <Route path="/redes" element={<RedesAliadas />} />
      </Routes>
    </>
  );
}
