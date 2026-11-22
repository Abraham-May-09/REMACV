import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/nav.css';

/**
 * Menú principal — el mismo en todas las páginas.
 * - Transparente sobre el hero, sólido al pasar 30px de scroll.
 * - Escritorio: «Integrantes» despliega Socias fundadoras / Comité / Miembros.
 * - Móvil (≤1024px): botón de menú que abre un panel con todas las opciones.
 */
const INTEGRANTES = [
  { to: '/#fundadoras', label: 'Socias fundadoras' },
  { to: '/#comite-ejecutivo', label: 'Comité ejecutivo' },
  { to: '/miembros', label: 'Miembros de la red' },
];

export default function Nav({ overHero = true }) {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú móvil al navegar o con Escape.
  useEffect(() => { setOpen(false); }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function onLogoClick(ev) {
    ev.preventDefault();
    if (pathname !== '/') navigate('/');
    // Forzado extra por si ya estamos en '/' (ScrollToTop no se dispara).
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Enlaces a secciones de Inicio (/#id): si ya estamos en Inicio, hace scroll
  // aunque el hash no cambie.
  function onHashClick(ev, to) {
    const id = to.split('#')[1];
    if (pathname !== '/' || !id) return;
    const el = document.getElementById(id);
    if (!el) return;
    ev.preventDefault();
    setOpen(false);
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (hash !== `#${id}`) navigate(to, { replace: true });
  }

  const cls = [
    'nav',
    overHero ? 'over-hero' : '',
    scrolled ? 'scrolled' : '',
    open ? 'menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const is = (p) => pathname === p;
  const enIntegrantes = is('/miembros');

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

        <button
          type="button"
          className="nav-burger"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav aria-label="Principal" className="nav-menu" id="nav-menu">
          <ul className="nav-links">
            <li>
              <Link to="/" className={is('/') && !hash ? 'is-current' : ''}>
                Inicio
              </Link>
            </li>
            <li className="has-sub">
              <Link
                to="/#comite"
                className={enIntegrantes ? 'is-current' : ''}
                onClick={(e) => onHashClick(e, '/#comite')}
              >
                Integrantes
              </Link>
              <ul className="nav-sub">
                {INTEGRANTES.map((it) => (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={is(it.to) ? 'is-current' : ''}
                      onClick={(e) => onHashClick(e, it.to)}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
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
            <li className="nav-cta-item">
              <Link className="nav-cta" to="/#unete" onClick={(e) => onHashClick(e, '/#unete')}>
                Únete
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
