import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import InstitucionesRed from '../components/InstitucionesRed.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import '../styles/home.css';

// El sufijo `?raw` de Vite importa el archivo como string
import homeBody from './home-body.html?raw';
import homeScripts from './home-scripts.js?raw';

// El body legacy se parte en dos para montar el bloque de instituciones
// (componente React) entre el comité ejecutivo y las redes aliadas.
const [homeBodyTop, homeBodyBottom] = homeBody.split('<!--@@INSTITUCIONES@@-->');

/**
 * Home — body legacy montado vía dangerouslySetInnerHTML; el script
 * inline se inyecta como <script> real para exponer goTo/submitForm/
 * subscribeNL a los onclick="" del HTML. Nav y Footer sí son React.
 */
export default function Home() {
  const wrapperRef = useRef(null);
  const { hash } = useLocation();
  const navigate = useNavigate();

  usePageMeta({
    title: 'REMACV — Red Mexicana de Análisis de Ciclo de Vida',
    description: 'La REMACV es una agrupación no lucrativa, con reconocimiento nacional e internacional, dedicada al Análisis de Ciclo de Vida en México.',
    path: '/',
  });

  // Inyecta el script legacy y expone sus funciones a window para los onclick="".
  useEffect(() => {
    const script = document.createElement('script');
    script.dataset.remacvHome = '1';
    // IIFE: evita redeclarar los const de nivel superior al re-montar.
    script.textContent =
      ';(function(){\n' +
      homeScripts +
      '\n' +
      'window.__remacvHomeScrollHandler = onScroll;\n' +
      'if (typeof goTo === "function") window.goTo = goTo;\n' +
      'if (typeof submitForm === "function") window.submitForm = submitForm;\n' +
      'if (typeof subscribeNL === "function") window.subscribeNL = subscribeNL;\n' +
      '})();';
    document.body.appendChild(script);
    return () => {
      // Limpia el scroll listener para que no siga corriendo en otras rutas.
      if (window.__remacvHomeScrollHandler) {
        window.removeEventListener('scroll', window.__remacvHomeScrollHandler);
        delete window.__remacvHomeScrollHandler;
      }
      script.remove();
    };
  }, []);

  // Red de seguridad: fuerza a mostrar los `.reveal` si el IntersectionObserver
  // del script legacy tarda en disparar al volver de otra ruta.
  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0 && !el.classList.contains('in')) {
          el.classList.add('in');
        }
      });
    }, 700);
    return () => clearTimeout(t);
  }, []);

  // Los <a href="/..."> del HTML legacy navegan dentro de la app (sin recargar).
  function onBodyClick(ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const a = ev.target.closest('a[href^="/"]');
    if (!a || a.target === '_blank') return;
    ev.preventDefault();
    navigate(a.getAttribute('href'));
  }

  // Si la URL trae hash (ej. /#unete desde otra página), hace scroll ahí
  // una vez montado el contenido.
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    // Espera un frame para que el contenido de dangerouslySetInnerHTML esté en el DOM
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        const navH = 80;
        const y = el.getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }, [hash]);

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Nav como componente React real */}
      <Nav />

      {/* Body de la home — todas las secciones, con animaciones y onclicks originales */}
      <div ref={wrapperRef} onClick={onBodyClick}>
        <div dangerouslySetInnerHTML={{ __html: homeBodyTop }} />
        <InstitucionesRed compact />
        <div dangerouslySetInnerHTML={{ __html: homeBodyBottom }} />
      </div>

      {/* Footer como componente React real */}
      <Footer />
    </>
  );
}
