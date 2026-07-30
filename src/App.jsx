import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import Eventos from './pages/Eventos.jsx';
import Publicaciones from './pages/Publicaciones.jsx';
import RedesAliadas from './pages/RedesAliadas.jsx';

// Sube al top en cada cambio de ruta (para que /eventos no arranque a media página)
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
