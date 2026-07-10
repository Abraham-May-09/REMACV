import { useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import '../styles/eventos.css';

// ============================================================
// EVENTS DATA — fiel al WordPress original (solo summary)
// ============================================================
const EVENTS = [
  {
    id: 'webinars',
    thumb: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=85&auto=format&fit=crop',
    thumbContain: false,
    kind: 'webinar',
    kindLabel: 'Webinars',
    title: 'Webinars ACV',
    loc: 'En línea · Red Iberoamericana de Ciclo de Vida',
    tagline: 'Serie de webinars sobre el pensamiento de ciclo de vida realizada en 2019.',
  },
  {
    id: 'cilca-2019',
    thumb: '/assets/events/cilca-2019.jpg',
    thumbContain: true,
    kind: 'conferencia',
    kindLabel: 'Conferencia Internacional',
    title: 'CILCA 2019 — ACV para la Competitividad Global',
    loc: 'VIII Conferencia Internacional de ACV en Latinoamérica · Costa Rica',
    tagline: 'Edición bienal con expertos de toda Iberoamérica y participación REMACV.',
  },
  {
    id: 'amica-gin-2019',
    thumb: '/assets/events/amica-2019.jpg',
    thumbContain: true,
    kind: 'congreso',
    kindLabel: 'Congreso · Ciudad de México',
    title: 'Congreso AMICA-GIN 2019',
    loc: '4° Congreso de Ingeniería Ambiental + 5° GIN Conference · 28–30 de octubre 2019',
    tagline: '"Ambiente y Gobernanza: Innovación para la sostenibilidad"',
  },
  {
    id: 'ecodal-2018',
    thumb: '/assets/events/ecodal-2018.png',
    thumbContain: true,
    kind: 'encuentro',
    kindLabel: 'Encuentro · Puebla',
    title: 'EcodAL Puebla 2018',
    loc: 'Encuentro de Ecodiseño en América Latina · Puebla, México',
    tagline: 'Mesa de integración de ACV en procesos de diseño sustentable.',
  },
  {
    id: 'seminario-honduras-2018',
    thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=85&auto=format&fit=crop',
    thumbContain: false,
    kind: 'seminario',
    kindLabel: 'Seminario Internacional',
    title: '6° Seminario Internacional de Análisis de Ciclo de Vida',
    loc: 'Honduras · 24–25 de octubre de 2018',
    tagline: 'Sexta edición con participación de redes iberoamericanas, centroamericanas y sudamericanas.',
  },
];

function EventCard({ ev, delay }) {
  return (
    <article className={`event-card reveal ${delay}`.trim()} id={ev.id}>
      <div className="event-card-inner">
        <div className="event-thumb">
          <img
            src={ev.thumb}
            alt={ev.title}
            loading="lazy"
            className={ev.thumbContain ? 'contain' : ''}
          />
        </div>
        <div className="event-body">
          <span className="event-kind" data-kind={ev.kind}>{ev.kindLabel}</span>
          <h3>{ev.title}</h3>
          <span className="loc">{ev.loc}</span>
          <p className="tagline">{ev.tagline}</p>
        </div>
      </div>
    </article>
  );
}

export default function Eventos() {
  useScrollProgress();
  useReveal();

  useEffect(() => {
    document.title = 'Eventos · REMACV';
  }, []);

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Eventos"
        title="Eventos."
        lede="Webinars, conferencias, congresos y seminarios donde la comunidad ACV ha compartido avances, casos de estudio y formación."
      />

      <section className="section-pad">
        <div className="container">
          <div className="events-list">
            {EVENTS.map((ev, i) => (
              <EventCard
                key={ev.id}
                ev={ev}
                delay={['', 'd1', 'd2', 'd3', 'd3'][i] || ''}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
