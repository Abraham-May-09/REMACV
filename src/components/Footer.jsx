import { Link } from 'react-router-dom';

/**
 * Footer de REMACV — usado en cada página.
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
            <Link className="foot-link" to="/miembros">Miembros de la red</Link>
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
            <a
              className="foot-link"
              href="https://www.iingen.unam.mx/es-mx/Paginas/Splash/Default.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instituto de Ingeniería<br/>UNAM · CDMX
            </a>
          </div>

          <div className="foot-intl">
            <h4>Vinculación internacional</h4>
            <a
              className="foot-intl-card"
              href="https://rediberoamericanacv.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="foot-intl-logo">
                <img src="/assets/logos/ricv.png" alt="" loading="lazy" />
              </span>
              <span className="foot-intl-name">Red Iberoamericana de Ciclo de Vida</span>
              <span className="foot-intl-url">rediberoamericanacv.net ↗</span>
            </a>
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
