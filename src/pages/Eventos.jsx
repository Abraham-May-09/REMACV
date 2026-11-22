import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { EVENTOS, TIPOS_EVENTO } from '../data/eventos.js';
import '../styles/eventos.css';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const parte = (iso) => iso.split('-').map(Number);

// «28–30 oct 2019», «26 jun – 10 jul 2019», «22 nov 2017»
function rango(inicio, fin) {
  const [a1, m1, d1] = parte(inicio);
  if (!fin) return `${d1} ${MESES[m1 - 1]} ${a1}`;
  const [a2, m2, d2] = parte(fin);
  if (a1 === a2 && m1 === m2) return `${d1}–${d2} ${MESES[m1 - 1]} ${a1}`;
  if (a1 === a2) return `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]} ${a1}`;
  return `${d1} ${MESES[m1 - 1]} ${a1} – ${d2} ${MESES[m2 - 1]} ${a2}`;
}

const ORDENADOS = [...EVENTOS].sort((a, b) => b.inicio.localeCompare(a.inicio));
const HOY = new Date().toISOString().slice(0, 10);
const PROXIMOS = ORDENADOS.filter((e) => (e.fin || e.inicio) >= HOY).reverse();
const PASADOS = ORDENADOS.filter((e) => (e.fin || e.inicio) < HOY);
const DESTACADO = PASADOS[0];

const ANIOS = PASADOS.map((e) => Number(e.inicio.slice(0, 4)));
const FILTROS = [
  ['', 'Todos'],
  ['organiza', 'Organizados por la REMACV'],
  ...Object.entries(TIPOS_EVENTO),
];

function Portada({ ev, grande = false }) {
  if (ev.imagen) {
    return (
      <span className={`evt-img ${ev.ajuste === 'contain' ? 'contain' : ''}`.trim()}>
        <img src={ev.imagen} alt="" loading={grande ? 'eager' : 'lazy'} />
      </span>
    );
  }
  return (
    <span className="evt-img evt-img-marca" aria-hidden="true">
      <img src="/assets/remacv-mark.png" alt="" />
      <span>{TIPOS_EVENTO[ev.tipo]}</span>
    </span>
  );
}

function Acciones({ ev }) {
  if (!ev.publicacion && !ev.sitio) return null;
  return (
    <div className="evt-acciones">
      {ev.publicacion && (
        <Link to={`/publicaciones/${ev.publicacion}`} className="evt-btn">
          Leer anuncio <span aria-hidden="true">→</span>
        </Link>
      )}
      {ev.sitio && (
        <a href={ev.sitio} target="_blank" rel="noopener noreferrer" className="evt-btn evt-btn-sec">
          Sitio del evento <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

function Etiquetas({ ev }) {
  return (
    <div className="evt-tags">
      <span className="evt-tipo" data-tipo={ev.tipo}>{TIPOS_EVENTO[ev.tipo]}</span>
      {ev.organiza && <span className="evt-org">Organizado por la REMACV</span>}
    </div>
  );
}

function Lugar({ ev }) {
  return (
    <p className="evt-lugar">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
      </svg>
      {ev.lugar}
    </p>
  );
}

export default function Eventos() {
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: 'Eventos · REMACV',
    description: 'Seminarios, congresos, conferencias y webinars de Análisis de Ciclo de Vida organizados o acompañados por la REMACV desde 2011.',
    path: '/eventos',
  });

  const [filtro, setFiltro] = useState('');

  const porAnio = useMemo(() => {
    const lista = PASADOS.filter((e) =>
      !filtro ? true : filtro === 'organiza' ? e.organiza : e.tipo === filtro
    );
    const grupos = [];
    lista.forEach((e) => {
      const a = e.inicio.slice(0, 4);
      const g = grupos.find((x) => x.anio === a);
      g ? g.eventos.push(e) : grupos.push({ anio: a, eventos: [e] });
    });
    return grupos;
  }, [filtro]);

  const cuenta = (k) =>
    !k ? PASADOS.length : k === 'organiza' ? PASADOS.filter((e) => e.organiza).length : PASADOS.filter((e) => e.tipo === k).length;

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Eventos"
        title={<>Eventos <em>de la red.</em></>}
        lede="Seminarios, congresos, conferencias y webinars donde la comunidad de ACV ha compartido avances, casos de estudio y formación desde 2011."
      />

      {/* Guía de la página */}
      <section className="evt-guia-wrap">
        <div className="container">
          <div className="evt-guia reveal">
            <div className="evt-guia-txt">
              <span className="section-eyebrow">Agenda de la red</span>
              <h2>Encuentros que construyen la comunidad de ACV en México.</h2>
            </div>
            <nav className="evt-guia-nav" aria-label="En esta página">
              <a href="#proximos">
                <span>01</span>Próximos eventos
              </a>
              <a href="#trayectoria">
                <span>02</span>Trayectoria {Math.min(...ANIOS)}–{Math.max(...ANIOS)}
              </a>
              <a href="mailto:contacto@remacv.mx?subject=Propuesta%20de%20evento" className="evt-guia-cta">
                Proponer un evento <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </div>
      </section>

      {/* Próximos + destacado */}
      <section className="section-pad evt-intro" id="proximos">
        <div className="container evt-intro-grid">
          <div className="evt-proximos reveal">
            <span className="section-eyebrow">Próximos eventos</span>
            {PROXIMOS.length ? (
              <ul className="evt-proximos-lista">
                {PROXIMOS.map((e) => (
                  <li key={e.id}>
                    <span className="evt-fecha-chip">{rango(e.inicio, e.fin)}</span>
                    <strong>{e.titulo}</strong>
                    <Lugar ev={e} />
                    <Acciones ev={e} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="evt-vacio">
                <h2>Muy pronto, nuevas fechas.</h2>
                <p>
                  Estamos preparando la siguiente agenda de seminarios y encuentros de la red.
                  Suscríbete al boletín para enterarte primero.
                </p>
                <div className="evt-acciones">
                  <Link to="/#newsletter" className="evt-btn">Suscribirme <span aria-hidden="true">→</span></Link>
                  <a href="mailto:contacto@remacv.mx?subject=Propuesta%20de%20evento" className="evt-btn evt-btn-sec">
                    Proponer un evento
                  </a>
                </div>
              </div>
            )}
          </div>

          {DESTACADO && (
            <article className="evt-destacado reveal d1">
              <Portada ev={DESTACADO} grande />
              <div className="evt-destacado-body">
                <span className="evt-kicker">Evento más reciente</span>
                <Etiquetas ev={DESTACADO} />
                <h2>{DESTACADO.titulo}</h2>
                <p className="evt-sub">{DESTACADO.subtitulo}</p>
                <p className="evt-cuando">{rango(DESTACADO.inicio, DESTACADO.fin)}</p>
                <Lugar ev={DESTACADO} />
                <p className="evt-desc">{DESTACADO.descripcion}</p>
                <Acciones ev={DESTACADO} />
              </div>
            </article>
          )}
        </div>
      </section>

      {/* Trayectoria */}
      <section className="section-pad evt-trayectoria" id="trayectoria">
        <div className="container">
          <div className="evt-tray-head">
            <div>
              <div className="reveal"><span className="section-eyebrow">Trayectoria</span></div>
              <h2 className="section-title reveal d1">Una red que se <em>encuentra.</em></h2>
            </div>
            <div className="evt-filtros reveal d2" role="group" aria-label="Filtrar eventos">
              {FILTROS.map(([k, label]) =>
                cuenta(k) ? (
                  <button
                    type="button"
                    key={k || 'todos'}
                    className={filtro === k ? 'activo' : ''}
                    onClick={() => setFiltro(k)}
                  >
                    {label} <span>{cuenta(k)}</span>
                  </button>
                ) : null
              )}
            </div>
          </div>

          <div className="evt-timeline">
            {porAnio.map((g) => (
              <div className="evt-anio" key={g.anio}>
                <div className="evt-anio-marca"><span>{g.anio}</span></div>
                <div className="evt-anio-lista">
                  {g.eventos.map((e) => (
                    <article className="evt-card" key={e.id} id={e.id}>
                      <Portada ev={e} />
                      <div className="evt-card-body">
                        <div className="evt-card-top">
                          <Etiquetas ev={e} />
                          <span className="evt-fecha">{rango(e.inicio, e.fin)}</span>
                        </div>
                        <h3>{e.titulo}</h3>
                        {e.subtitulo && <p className="evt-sub">{e.subtitulo}</p>}
                        <Lugar ev={e} />
                        <p className="evt-desc">{e.descripcion}</p>
                        <Acciones ev={e} />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
