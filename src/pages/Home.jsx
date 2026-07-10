import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/home.css';

// Vite's `?raw` suffix imports a file as a string
import homeBody from './home-body.html?raw';
import homeScripts from './home-scripts.js?raw';

/**
 * Home — la página principal.
 *
 * El contenido del body original (REMACV v5 - sf.html) tiene más de 800
 * elementos con CSS y JS muy específicos: animaciones de hero, parallax,
 * formulario de membresía, newsletter, placeholders de avatares, etc.
 *
 * Para no diluir todo eso convirtiéndolo a JSX y arriesgar romper detalles
 * visuales, el body se monta vía `dangerouslySetInnerHTML` y el script
 * inline se inyecta como un <script> real en el body — así sus funciones
 * (`goTo`, `submitForm`, `subscribeNL`) quedan disponibles para los
 * `onclick=""` declarativos que viven dentro del HTML.
 *
 * El Nav y el Footer SÍ son componentes React reutilizables.
 *
 * Si quieres editar una sección de la home en React puro, mueve su HTML
 * desde `home-body.html` a un componente .jsx y reemplázala aquí.
 */
export default function Home() {
  const wrapperRef = useRef(null);
  const { hash } = useLocation();

  useEffect(() => {
    document.title = 'REMACV — Red Mexicana de Análisis de Ciclo de Vida';
  }, []);

  // Inject the home's inline script so its globals (goTo, submitForm,
  // subscribeNL) become available to the onclick="" attributes inside
  // the dangerouslySetInnerHTML content.
  useEffect(() => {
    const script = document.createElement('script');
    script.dataset.remacvHome = '1';
    // Wrap in an IIFE so re-injection (after navigation back to home)
    // doesn't redeclare top-level `const`s into the global lexical scope.
    // Expose: the scroll handler (for cleanup), and the inline-onclick
    // functions to `window`.
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
      // Remove the scroll listener that the injected script registered,
      // otherwise it lingers across navigations and can interfere with
      // other pages — manipulating detached DOM nodes and re-running on
      // every scroll for nothing.
      if (window.__remacvHomeScrollHandler) {
        window.removeEventListener('scroll', window.__remacvHomeScrollHandler);
        delete window.__remacvHomeScrollHandler;
      }
      script.remove();
    };
  }, []);

  // Safety net: if the IntersectionObserver inside the injected script is
  // slow to fire on a re-mount (after coming back from another route),
  // force-show any `.reveal` element so the home never gets stuck in its
  // pre-animation hidden state.
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

  // If the URL has a hash (e.g. /#unete from another page), scroll to it
  // once the home content has mounted.
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    // Wait one frame so the dangerouslySetInnerHTML content is in the DOM
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

      {/* Nav rendered as a real React component */}
      <Nav />

      {/* Home body — every section, with original animations & onclicks */}
      <div
        ref={wrapperRef}
        dangerouslySetInnerHTML={{ __html: homeBody }}
      />

      {/* Footer rendered as a real React component */}
      <Footer />
    </>
  );
}
