import { useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';

/**
 * Publicaciones — placeholder fiel al sitio anterior, donde este apartado
 * no contaba con contenido sustancial todavía.
 */
export default function Publicaciones() {
  useScrollProgress();
  useReveal();

  useEffect(() => {
    document.title = 'Publicaciones · REMACV';
  }, []);

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Publicaciones"
        title="Publicaciones."
        lede="Publicaciones académicas, técnicas y de divulgación producidas por la comunidad de la Red Mexicana de Análisis de Ciclo de Vida."
      />

      <section className="section-pad">
        <div className="container" style={{ maxWidth: 820 }}>
          <div
            className="reveal"
            style={{
              padding: '80px 32px',
              border: '1.5px dashed var(--line-strong)',
              borderRadius: 14,
              textAlign: 'center',
              background: 'var(--cream)',
            }}
          >
            <h2 style={{ fontSize: 26, letterSpacing: '-.022em', marginBottom: 16 }}>
              Apartado en construcción
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: '#5b6c61',
                maxWidth: 540,
                margin: '0 auto',
              }}
            >
              Aquí se publicarán artículos, reportes y materiales producidos por
              miembros de la red.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
