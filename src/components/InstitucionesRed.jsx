import { Link } from 'react-router-dom';
import { INSTITUCIONES, GALERIA } from '../data/instituciones.js';
import '../styles/miembros.css';

function InstTile({ inst }) {
  return (
    <li className="inst-tile" title={inst.nombre}>
      <div className={`inst-logo ${inst.logo ? '' : 'inst-logo-text'}`.trim()}>
        {inst.logo ? (
          <img src={inst.logo} alt={inst.nombre} loading="lazy" />
        ) : (
          <span className="inst-sigla">{inst.sigla}</span>
        )}
      </div>
      <span className="inst-nombre">{inst.nombre}</span>
    </li>
  );
}

/**
 * «Instituciones y organizaciones representadas en la red».
 * - compact: versión para Inicio, con enlace al directorio.
 * - completa: galería al final de Miembros de la red.
 */
export default function InstitucionesRed({ compact = false }) {
  const items = GALERIA.map((k) => INSTITUCIONES[k]);

  return (
    <section
      className={`instituciones ${compact ? 'instituciones-compact section-pad' : ''}`.trim()}
      id="instituciones"
    >
      <div className="container">
        <div className="inst-head">
          <div className="reveal">
            <span className="section-eyebrow">Instituciones y organizaciones</span>
          </div>
          <h2 className="section-title reveal d1">
            Representadas <em>en la red.</em>
          </h2>
          {!compact && (
            <p className="section-lede reveal d2">
              Universidades, centros de investigación y empresas a las que pertenecen
              las personas que integran la REMACV, su comité ejecutivo y sus socias
              fundadoras.
            </p>
          )}
        </div>

        <ul className={`inst-grid reveal d2 ${compact ? 'inst-grid-compact' : ''}`.trim()}>
          {items.map((inst) => (
            <InstTile key={inst.nombre} inst={inst} />
          ))}
        </ul>

        {compact && (
          <p className="inst-foot reveal">
            <Link to="/miembros" className="btn btn-ink">
              Conoce a nuestros miembros <span className="arrow">→</span>
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
