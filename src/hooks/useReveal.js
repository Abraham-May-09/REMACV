import { useEffect } from 'react';

/**
 * Reveal-on-scroll: agrega `.in` a `.reveal`/`.reveal-scale` al entrar al viewport.
 * Incluye red de seguridad a los 700ms por si el observer no dispara a tiempo.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
      if (!el.classList.contains('in')) io.observe(el);
    });

    // Fallback: muestra lo que quede oculto tras 700ms.
    const t = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
        if (!el.classList.contains('in')) el.classList.add('in');
      });
    }, 700);

    return () => {
      io.disconnect();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
