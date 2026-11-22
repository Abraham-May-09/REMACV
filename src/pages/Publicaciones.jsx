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

export const ORDENADAS = [...PUBLICACIONES].sort((a, b) => b.fecha.localeCompare(a.fecha));

const normaliza = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Miniatura({ p, grande = false }) {
  if (p.imagen) {
    return (
      <span className={`pub-thumb ${p.ajuste === 'contain' ? 'contain' : ''}`.trim()}>
        <img src={p.imagen} alt="" loading={grande ? 'eager' : 'lazy'} />
      </span>
    );
  }
  return (
    <span className="pub-thumb pub-thumb-marca" aria-hidden="true">
      <img src="/assets/remacv-mark.png" alt="" />
      <span>{TIPOS[p.tipo]}</span>
    </span>
  );
}

export default function Publicaciones() {
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: 'Publicaciones · REMACV',
    description: 'Investigación, artículos, anuncios, convocatorias y recursos publicados por la Red Mexicana de Análisis de Ciclo de Vida.',
    path: '/publicaciones',
  });

  const [tipo, setTipo] = useState('');
  const [q, setQ] = useState('');
  const destacada = ORDENADAS.find((p) => p.destacado);

  const lista = useMemo(() => {
    const nq = normaliza(q.trim());
    return ORDENADAS.filter(
      (p) =>
        (!tipo || p.tipo === tipo) &&
        (!nq || normaliza(`${p.titulo} ${p.resumen} ${p.autores || ''}`).includes(nq)) &&
        (tipo || nq || p !== destacada)
    );
  }, [tipo, q, destacada]);

  const conteo = (t) => ORDENADAS.filter((p) => p.tipo === t).length;

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Publicaciones"
        title={<>Publicaciones <em>de la red.</em></>}
        lede="Investigación, artículos, anuncios, convocatorias y recursos publicados por la Red Mexicana de Análisis de Ciclo de Vida."
      />

      {destacada && (
        <section className="pubs-destacada-wrap">
          <div className="container">
            <Link to={`/publicaciones/${destacada.slug}`} className="pub-destacada reveal">
              <Miniatura p={destacada} grande />
              <span className="pub-destacada-body">
                <span className="pub-kicker">Publicación destacada</span>
                <span className="pub-meta">
                  <span className="pub-tipo" data-tipo={destacada.tipo}>{TIPOS[destacada.tipo]}</span>
                  <time dateTime={destacada.fecha}>{fechaLarga(destacada.fecha)}</time>
                </span>
                <span className="pub-destacada-titulo">{destacada.titulo}</span>
                {destacada.autores && <span className="pub-autores">{destacada.autores}</span>}
                {destacada.revista && <span className="pub-revista">{destacada.revista}</span>}
                <span className="pub-resumen">{destacada.resumen}</span>
                <span className="pub-leer">Leer más <span aria-hidden="true">→</span></span>
              </span>
            </Link>
          </div>
        </section>
      )}

      <section className="section-pad pubs">
        <div className="container">
          <div className="pubs-head reveal">
            <div className="pubs-filtros" role="group" aria-label="Filtrar por tipo">
              <button type="button" className={!tipo ? 'activo' : ''} onClick={() => setTipo('')}>
                Todas <span>{ORDENADAS.length}</span>
              </button>
              {Object.entries(TIPOS).map(([k, label]) =>
                conteo(k) ? (
                  <button
                    type="button"
                    key={k}
                    className={tipo === k ? 'activo' : ''}
                    onClick={() => setTipo(k)}
                  >
                    {label} <span>{conteo(k)}</span>
                  </button>
                ) : null
              )}
            </div>
            <label className="pubs-buscar">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar publicaciones"
                aria-label="Buscar publicaciones"
              />
            </label>
          </div>

          {lista.length ? (
            <ul className="pubs-grid">
              {lista.map((p) => (
                <li key={p.slug} className="pub-card" data-tipo={p.tipo}>
                  <Link to={`/publicaciones/${p.slug}`} className="pub-link">
                    <Miniatura p={p} />
                    <span className="pub-body">
                      <span className="pub-meta">
                        <span className="pub-tipo" data-tipo={p.tipo}>{TIPOS[p.tipo]}</span>
                        <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
                      </span>
                      <span className="pub-titulo">{p.titulo}</span>
                      {p.autores && <span className="pub-autores">{p.autores}</span>}
                      <span className="pub-resumen">{p.resumen}</span>
                      <span className="pub-leer">Leer <span aria-hidden="true">→</span></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pubs-vacio">
              No encontramos publicaciones con esos criterios.
              <button type="button" onClick={() => { setQ(''); setTipo(''); }}>Ver todas</button>
            </p>
          )}

          <p className="pubs-nota reveal">
            ¿Quieres compartir una publicación con la red? Escríbenos a{' '}
            <a href="mailto:contacto@remacv.mx">contacto@remacv.mx</a>.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
