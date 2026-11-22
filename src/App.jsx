import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import Eventos from './pages/Eventos.jsx';
import Publicaciones from './pages/Publicaciones.jsx';
import RedesAliadas from './pages/RedesAliadas.jsx';
import MiembrosRed from './pages/MiembrosRed.jsx';
import PublicacionDetalle from './pages/PublicacionDetalle.jsx';

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
        <Route path="/publicaciones/:slug" element={<PublicacionDetalle />} />
        <Route path="/redes" element={<RedesAliadas />} />
        <Route path="/miembros" element={<MiembrosRed />} />
      </Routes>
    </>
  );
}
