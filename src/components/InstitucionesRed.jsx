import { Link } from 'react-router-dom';
import { INSTITUCIONES, GALERIA } from '../data/instituciones.js';
import '../styles/miembros.css';

// Cuántas veces se repite cada fila dentro de una vuelta del carrusel.
// Con 7 logos por fila y 3 repeticiones, una vuelta mide ~4,600px: alcanza
// para pantallas muy anchas sin que se vea un hueco.
const REPETICIONES = 3;

function Logo({ inst }) {
  const Tag = inst.sitio ? 'a' : 'div';
  const enlace = inst.sitio
    ? { href: inst.sitio, target: '_blank', rel: 'noopener noreferrer', tabIndex: -1 }
    : {};
  return (
    <li className="inst-item">
      <Tag className={`inst-card ${inst.sitio ? '' : 'sin-sitio'}`.trim()} title={inst.nombre} {...enlace}>
        <span className={`inst-logo ${inst.logo ? '' : 'inst-logo-text'}`.trim()}>
          {inst.logo ? (
            <img
              src={inst.logo}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className={inst.invertir ? 'invertir' : undefined}
            />
          ) : (
            <span className="inst-logo-sigla">{inst.sigla}</span>
          )}
        </span>
        <span className="inst-card-foot">
          <span className="inst-card-txt">
            <span className="inst-sig">{inst.sigla}</span>
            <span className="inst-nom">{inst.nombre}</span>
          </span>
          {inst.sitio && <span className="inst-go" aria-hidden="true">↗</span>}
        </span>
      </Tag>
    </li>
  );
}

function Fila({ items, reversa = false, duracion }) {
  const vuelta = Array.from({ length: REPETICIONES }, () => items).flat();
  return (
    <div
      className={`inst-fila ${reversa ? 'reversa' : ''}`.trim()}
      style={{ '--dur': `${duracion}s` }}
    >
      <div className="inst-track">
        {[0, 1].map((copia) => (
          <ul className="inst-set" key={copia} aria-hidden="true">
            {vuelta.map((inst, i) => (
              <Logo inst={inst} key={`${copia}-${i}`} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * «Instituciones y organizaciones representadas en la red» en carrusel continuo.
 * - compact: versión de Inicio, con enlace al directorio.
 * - completa: al final de Miembros de la red.
 */
export default function InstitucionesRed({ compact = false }) {
  const items = GALERIA.map((k) => INSTITUCIONES[k]);
  const mitad = Math.ceil(items.length / 2);

  return (
    <section className="instituciones section-pad" id="instituciones">
      <div className="container">
        <div className="inst-head">
          <div className="reveal">
            <span className="section-eyebrow">Representantes de la red</span>
          </div>
          <h2 className="section-title reveal d1">
            Instituciones y organizaciones <em>representadas.</em>
          </h2>
          <p className="section-lede reveal d2">
            Universidades, centros de investigación y empresas a los que pertenecen
            las personas que integran la REMACV. Haz clic en un logotipo para
            visitar su sitio.
          </p>
        </div>
      </div>

      {/* Lista para teclado y lectores de pantalla; el carrusel es visual. */}
      <ul className="inst-sr">
        {items.map((inst) => (
          <li key={inst.nombre}>
            {inst.sitio ? (
              <a href={inst.sitio} target="_blank" rel="noopener noreferrer">
                {inst.nombre} (abre su sitio en otra pestaña)
              </a>
            ) : (
              inst.nombre
            )}
          </li>
        ))}
      </ul>

      <div className="inst-marquee reveal d2">
        <Fila items={items.slice(0, mitad)} duracion={70} />
        <Fila items={items.slice(mitad)} duracion={80} reversa />
      </div>

      {compact && (
        <div className="container">
          <p className="aliados-foot reveal">
            {items.length} instituciones y organizaciones en México y el extranjero.
            <Link to="/miembros">Conoce a nuestros miembros ↗</Link>
          </p>
        </div>
      )}
    </section>
  );
}
