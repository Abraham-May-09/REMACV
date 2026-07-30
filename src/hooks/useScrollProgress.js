import { useEffect } from 'react';

/**
 * Controla la barra de progreso delgada arriba de cada página.
 * Busca el elemento id="scrollProgress" y actualiza su ancho.
 */
export default function useScrollProgress() {
  useEffect(() => {
    function onScroll() {
      const bar = document.getElementById('scrollProgress');
      if (!bar) return;
      const sy = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = Math.min(100, (sy / Math.max(1, docH)) * 100) + '%';
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
