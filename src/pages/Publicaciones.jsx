import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { PUBLICACIONES, TIPOS } from '../data/publicaciones.js';
import '../styles/publicaciones.css';

export function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const ORDENADAS = [...PUBLICACIONES].sort((a, b) => b.fecha.localeCompare(a.fecha));

export default function Publicaciones() {
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: 'Publicaciones · REMACV',
    description: 'Artículos, anuncios, convocatorias y recursos publicados por la Red Mexicana de Análisis de Ciclo de Vida.',
    path: '/publicaciones',
  });

  const [tipo, setTipo] = useState('');
  const lista = useMemo(() => ORDENADAS.filter((p) => !tipo || p.tipo === tipo), [tipo]);
  const conteo = (t) => ORDENADAS.filter((p) => p.tipo === t).length;

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Publicaciones"
        title={<>Publicaciones <em>de la red.</em></>}
        lede="Artículos, anuncios, convocatorias y recursos publicados por la Red Mexicana de Análisis de Ciclo de Vida."
      />

      <section className="section-pad pubs">
        <div className="container">
          <div className="pubs-head reveal">
            <div className="pubs-filtros" role="group" aria-label="Filtrar por tipo">
              <button type="button" className={!tipo ? 'activo' : ''} onClick={() => setTipo('')}>
                Todas <span>{ORDENADAS.length}</span>
              </button>
              {Object.entries(TIPOS).map(([k, label]) => (
                <button
                  type="button"
                  key={k}
                  className={tipo === k ? 'activo' : ''}
                  onClick={() => setTipo(k)}
                >
                  {label} <span>{conteo(k)}</span>
                </button>
              ))}
            </div>
            <p className="pubs-nota">
              Incluye el archivo del sitio anterior de la REMACV (2018–2019).
            </p>
          </div>

          <ul className="pubs-grid">
            {lista.map((p) => (
              <li key={p.slug} className="pub-card">
                <Link to={`/publicaciones/${p.slug}`} className="pub-link">
                  {p.imagen ? (
                    <span className={`pub-thumb ${p.ajuste === 'contain' ? 'contain' : ''}`.trim()}>
                      <img src={p.imagen} alt="" loading="lazy" />
                    </span>
                  ) : (
                    <span className="pub-thumb pub-thumb-marca" aria-hidden="true">
                      <img src="/assets/remacv-mark.png" alt="" />
                      <span>{TIPOS[p.tipo]}</span>
                    </span>
                  )}
                  <span className="pub-body">
                    <span className="pub-meta">
                      <span className="pub-tipo">{TIPOS[p.tipo]}</span>
                      <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
                    </span>
                    <span className="pub-titulo">{p.titulo}</span>
                    <span className="pub-resumen">{p.resumen}</span>
                    <span className="pub-leer">Leer <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
}
