import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { TIPOS } from '../data/publicaciones.js';
import { fechaLarga, ORDENADAS, Miniatura } from './Publicaciones.jsx';
import '../styles/publicaciones.css';

// Los enlaces externos del cuerpo se abren en otra pestaña.
function externos(html) {
  return html.replace(/<a href="(https?:|mailto:)/g, '<a target="_blank" rel="noopener noreferrer" href="$1');
}

function cita(p) {
  const anio = p.fecha.slice(0, 4);
  return `${p.autores} (${anio}). ${p.titulo}. ${p.revista}.${p.doi ? ` https://doi.org/${p.doi}` : ''}`;
}

export default function PublicacionDetalle() {
  const { slug } = useParams();
  const i = ORDENADAS.findIndex((x) => x.slug === slug);
  const p = ORDENADAS[i];
  const [copiado, setCopiado] = useState(false);
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: p ? `${p.titulo} · REMACV` : 'Publicación no encontrada · REMACV',
    description: p ? p.resumen : 'La publicación que buscas no existe o cambió de dirección.',
    path: `/publicaciones/${slug}`,
  });

  const anterior = i >= 0 ? ORDENADAS[i + 1] : null; // más antigua
  const siguiente = i > 0 ? ORDENADAS[i - 1] : null;  // más reciente
  const relacionadas = p
    ? ORDENADAS.filter((x) => x.slug !== slug)
        .sort((a, b) => (b.tipo === p.tipo) - (a.tipo === p.tipo) || b.fecha.localeCompare(a.fecha))
        .slice(0, 3)
    : ORDENADAS.slice(0, 3);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cita(p));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      /* sin permiso de portapapeles: no pasa nada */
    }
  }

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        compact
        parent={{ to: '/publicaciones', label: 'Publicaciones' }}
        crumb={p ? TIPOS[p.tipo] : 'No encontrada'}
        title={p ? p.titulo : 'Publicación no encontrada'}
        lede={p ? fechaLarga(p.fecha) : undefined}
      />

      <section className="section-pad pub-articulo">
        <div className="container pub-articulo-grid">
          {p ? (
            <article className="pub-cuerpo reveal">
              {(p.autores || p.revista) && (
                <div className="pub-ficha">
                  {p.autores && (
                    <p><span>Autores</span>{p.autores}</p>
                  )}
                  {p.revista && (
                    <p><span>Publicado en</span>{p.revista}</p>
                  )}
                  {p.doi && (
                    <p>
                      <span>DOI</span>
                      <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer">{p.doi}</a>
                    </p>
                  )}
                </div>
              )}

              {p.imagen && (
                <figure className="pub-figura">
                  <img src={p.imagen} alt={p.titulo} />
                </figure>
              )}

              <div className="pub-texto" dangerouslySetInnerHTML={{ __html: externos(p.html) }} />

              {(p.externo || (p.autores && p.revista)) && (
                <div className="pub-acciones">
                  {p.externo && (
                    <a href={p.externo} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
                      {p.tipo === 'investigacion' ? 'Leer en la revista' : 'Ir al recurso'} <span className="arrow">↗</span>
                    </a>
                  )}
                  {p.autores && p.revista && (
                    <button type="button" className="pub-copiar" onClick={copiar}>
                      {copiado ? 'Cita copiada ✓' : 'Copiar cita'}
                    </button>
                  )}
                </div>
              )}

              <p className="pub-origen">
                Publicado originalmente en el{' '}
                <a href={p.original} target="_blank" rel="noopener noreferrer">sitio anterior de la REMACV</a>.
              </p>

              <nav className="pub-nav" aria-label="Más publicaciones">
                {anterior ? (
                  <Link to={`/publicaciones/${anterior.slug}`} className="pub-nav-prev">
                    <span>← Anterior</span>
                    <strong>{anterior.titulo}</strong>
                  </Link>
                ) : <span />}
                {siguiente ? (
                  <Link to={`/publicaciones/${siguiente.slug}`} className="pub-nav-next">
                    <span>Siguiente →</span>
                    <strong>{siguiente.titulo}</strong>
                  </Link>
                ) : <span />}
              </nav>
            </article>
          ) : (
            <div className="pub-cuerpo">
              <p className="pub-texto">La publicación que buscas no existe o cambió de dirección.</p>
            </div>
          )}

          <aside className="pub-aside reveal d1">
            <Link to="/publicaciones" className="pub-volver">← Todas las publicaciones</Link>
            <h2>{p ? 'También te puede interesar' : 'Publicaciones recientes'}</h2>
            <ul>
              {relacionadas.map((o) => (
                <li key={o.slug}>
                  <Link to={`/publicaciones/${o.slug}`}>
                    <Miniatura p={o} />
                    <span className="pub-aside-txt">
                      <span className="pub-tipo" data-tipo={o.tipo}>{TIPOS[o.tipo]}</span>
                      <strong>{o.titulo}</strong>
                      <time dateTime={o.fecha}>{fechaLarga(o.fecha)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
