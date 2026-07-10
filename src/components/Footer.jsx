import { Link } from 'react-router-dom';

/**
 * REMACV footer — used on every page.
 */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand-row">
              <img
                className="logo-mark"
                src="/assets/remacv-mark.png"
                alt="REMACV emblema"
                width="64"
                height="64"
              />
              <img
                className="logo-wordmark"
                src="/assets/remacv-wordmark.png"
                alt="REMACV"
              />
            </div>
            <p>
              Agrupación no lucrativa con reconocimiento nacional e internacional,
              dedicada al Análisis de Ciclo de Vida en México.
            </p>
          </div>
          <div>
            <h4>Explora</h4>
            <Link className="foot-link" to="/">Inicio</Link>
            <Link className="foot-link" to="/eventos">Eventos</Link>
            <Link className="foot-link" to="/publicaciones">Publicaciones</Link>
            <Link className="foot-link" to="/redes">Redes aliadas</Link>
          </div>
          
          <div>
            <h4>Contacto</h4>
            <a
              className="foot-link"
              href="mailto:redmexicanadeciclodevida@gmail.com"
              style={{ wordBreak: 'break-word' }}
            >
              redmexicanadeciclodevida<br/>@gmail.com
            </a>
            <span className="foot-link" style={{ cursor: 'default' }}>
              Instituto de Ingeniería<br/>UNAM · CDMX
            </span>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} REMACV. Todos los derechos reservados.</span>
          <span>Política de privacidad · Aviso legal</span>
        </div>
      </div>
    </footer>
  );
}
