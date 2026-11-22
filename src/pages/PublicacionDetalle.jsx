import { Link, useParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { PUBLICACIONES, TIPOS } from '../data/publicaciones.js';
import { fechaLarga } from './Publicaciones.jsx';
import '../styles/publicaciones.css';

// Los enlaces externos del cuerpo se abren en otra pestaña.
function externos(html) {
  return html.replace(/<a href="(https?:|mailto:)/g, '<a target="_blank" rel="noopener noreferrer" href="$1');
}

export default function PublicacionDetalle() {
  const { slug } = useParams();
  const p = PUBLICACIONES.find((x) => x.slug === slug);
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: p ? `${p.titulo} · REMACV` : 'Publicación no encontrada · REMACV',
    description: p ? p.resumen : 'La publicación que buscas no existe o cambió de dirección.',
    path: `/publicaciones/${slug}`,
  });

  const otras = PUBLICACIONES.filter((x) => x.slug !== slug)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 3);

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
              {p.imagen && (
                <figure className="pub-figura">
                  <img src={p.imagen} alt={p.titulo} />
                </figure>
              )}
              <div className="pub-texto" dangerouslySetInnerHTML={{ __html: externos(p.html) }} />
              {p.externo && (
                <p className="pub-externo">
                  <a href={p.externo} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
                    Ir al recurso <span className="arrow">↗</span>
                  </a>
                </p>
              )}
              <p className="pub-origen">
                Publicado originalmente el {fechaLarga(p.fecha)} en el{' '}
                <a href={p.original} target="_blank" rel="noopener noreferrer">sitio anterior de la REMACV</a>.
              </p>
            </article>
          ) : (
            <div className="pub-cuerpo">
              <p className="pub-texto">
                La publicación que buscas no existe o cambió de dirección.
              </p>
            </div>
          )}

          <aside className="pub-aside reveal d1">
            <Link to="/publicaciones" className="pub-volver">← Todas las publicaciones</Link>
            <h2>Otras publicaciones</h2>
            <ul>
              {otras.map((o) => (
                <li key={o.slug}>
                  <Link to={`/publicaciones/${o.slug}`}>
                    <span className="pub-tipo">{TIPOS[o.tipo]}</span>
                    <strong>{o.titulo}</strong>
                    <time dateTime={o.fecha}>{fechaLarga(o.fecha)}</time>
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
