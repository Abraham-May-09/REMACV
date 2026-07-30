import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Nav principal. Transparente sobre el hero, sólida al pasar 30px de scroll.
 * El logo siempre navega a home y sube al top.
 */
export default function Nav({ overHero = true }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function onLogoClick(ev) {
    ev.preventDefault();
    if (pathname !== '/') navigate('/');
    // Forzado extra por si ya estamos en '/' (ScrollToTop no se dispara).
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const cls = [
    'nav',
    overHero ? 'over-hero' : '',
    scrolled ? 'scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const is = (p) => pathname === p;

  return (
    <header className={cls} id="nav">
      <div className="nav-inner">
        <a className="nav-logo" href="/" onClick={onLogoClick}>
          <img
            className="logo-mark"
            src="/assets/remacv-mark.png"
            alt="REMACV emblema"
            width="42"
            height="42"
          />
          <img
            className="logo-wordmark"
            src="/assets/remacv-wordmark.png"
            alt="REMACV"
          />
        </a>
        <ul className="nav-links">
          <li>
            <Link to="/" className={is('/') ? 'is-current' : ''}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/eventos" className={is('/eventos') ? 'is-current' : ''}>
              Eventos
            </Link>
          </li>
          <li>
            <Link to="/publicaciones" className={is('/publicaciones') ? 'is-current' : ''}>
              Publicaciones
            </Link>
          </li>
          <li>
            <Link to="/redes" className={is('/redes') ? 'is-current' : ''}>
              Redes
            </Link>
          </li>
          <li>
            <Link className="nav-cta" to="/#unete">
              Únete
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
