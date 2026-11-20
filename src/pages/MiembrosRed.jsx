import { useMemo, useState } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import InstitucionesRed from '../components/InstitucionesRed.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { MIEMBROS } from '../data/miembros.js';
import { INSTITUCIONES } from '../data/instituciones.js';
import '../styles/miembros.css';

const collator = new Intl.Collator('es', { sensitivity: 'base' });

// Quita acentos y pasa a minúsculas para que la búsqueda no dependa de ellos.
function normaliza(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const ROL = {
  fundadora: 'Socia fundadora',
  comite: 'Comité ejecutivo',
};

const ORDENADOS = [...MIEMBROS].sort(
  (a, b) => collator.compare(a.apellidos, b.apellidos) || collator.compare(a.nombre, b.nombre)
);

// Opciones del filtro: solo instituciones con al menos una persona.
const OPCIONES = [...new Set(ORDENADOS.map((m) => m.inst))]
  .map((k) => ({ key: k, nombre: INSTITUCIONES[k].nombre }))
  .sort((a, b) => collator.compare(a.nombre, b.nombre));

export default function MiembrosRed() {
  useScrollProgress();
  useReveal();

  usePageMeta({
    title: 'Miembros de la red · REMACV',
    description: 'Directorio de las personas que integran la Red Mexicana de Análisis de Ciclo de Vida y de las instituciones que representan.',
    path: '/miembros',
  });

  const [q, setQ] = useState('');
  const [inst, setInst] = useState('');

  const lista = useMemo(() => {
    const nq = normaliza(q.trim());
    return ORDENADOS.filter(
      (m) => (!inst || m.inst === inst) && (!nq || normaliza(m.nombre).includes(nq))
    );
  }, [q, inst]);

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Miembros de la red"
        title={<>Miembros <em>de la red.</em></>}
        lede="Las personas que integran la REMACV, ordenadas por primer apellido."
      />

      <section className="section-pad directorio" id="directorio">
        <div className="container">
          <div className="dir-tools reveal">
            <div className="field">
              <label htmlFor="dir-q">Buscar por nombre</label>
              <input
                id="dir-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Escribe un nombre o apellido"
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="dir-inst">Institución</label>
              <select id="dir-inst" value={inst} onChange={(e) => setInst(e.target.value)}>
                <option value="">Todas las instituciones</option>
                {OPCIONES.map((o) => (
                  <option key={o.key} value={o.key}>{o.nombre}</option>
                ))}
              </select>
            </div>
            <p className="dir-count" aria-live="polite">
              {lista.length === ORDENADOS.length
                ? `${ORDENADOS.length} personas`
                : `${lista.length} de ${ORDENADOS.length} personas`}
            </p>
          </div>

          {lista.length > 0 ? (
            <ul className="dir-grid">
              {lista.map((m) => {
                const i = INSTITUCIONES[m.inst];
                return (
                  <li className="dir-card" key={m.nombre}>
                    <div className="dir-head">
                      <span className="dir-sig">{i.sigla}</span>
                      {m.rol && <span className="dir-rol">{ROL[m.rol]}</span>}
                    </div>
                    <h3>{m.nombre}</h3>
                    <p className="dir-inst">{i.nombre}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="dir-empty">
              No encontramos personas con esos criterios.
              <button type="button" onClick={() => { setQ(''); setInst(''); }}>
                Limpiar filtros
              </button>
            </p>
          )}
        </div>
      </section>

      <InstitucionesRed />

      <Footer />
    </>
  );
}
