import { useEffect } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import useScrollProgress from '../hooks/useScrollProgress.js';
import '../styles/redes.css';

// ============================================================
// Redes aliadas — dataset (4 regiones, 12 redes)
// ============================================================
const REGIONS = [
  {
    id: 'global',
    num: '01',
    title: 'Iniciativas',
    titleEm: 'globales',
    count: '3 organizaciones',
    redes: [
      {
        href: 'https://www.unep.org/es',
        logo: '/assets/logos/unep.jpg',
        alt: 'UNEP Life Cycle Initiative',
        sig: 'UNEP LCI',
        pais: 'Global',
        h3: 'UNEP Life Cycle Initiative',
        desc: 'Alianza global multi-actor del Programa de la ONU para el Medio Ambiente; más de 600 miembros en todo el mundo.',
      },
      {
        href: 'https://fslci.org/',
        logo: '/assets/logos/fslci.jpg',
        alt: 'FSLCI',
        sig: 'FSLCI',
        pais: 'Berlín · Global',
        h3: 'Forum for Sustainability through Life Cycle Innovation',
        desc: 'Comunidad internacional sin fines de lucro (Berlín, 2015): summer schools, webinars y bolsa de trabajo del sector.',
      },
      {
        href: 'https://ilca.es/',
        logo: '/assets/logos/ilca.png',
        alt: 'ILCA',
        sig: 'ILCA',
        pais: 'Internacional',
        h3: 'International Life Cycle Academy',
        desc: 'Iniciativa para la formación de profesionales y docentes en metodologías de ciclo de vida.',
      },
    ],
  },
  {
    id: 'iberoamerica',
    num: '02',
    title: 'Red',
    titleEm: 'iberoamericana',
    count: '2 organizaciones',
    redes: [
      {
        href: 'https://rediberoamericanacv.net/',
        logo: '/assets/logos/ricv.png',
        alt: 'RICV',
        sig: 'RICV',
        pais: 'Iberoamérica',
        h3: 'Red Iberoamericana de Ciclo de Vida',
        desc: 'Une a las redes nacionales de ACV de países iberoamericanos en torno al pensamiento de ciclo de vida.',
      },
      {
        href: 'http://www.cilca2025.mx/',
        logo: '/assets/logos/cilca.png',
        alt: 'CILCA',
        sig: 'CILCA',
        pais: 'Iberoamérica',
        h3: 'Conferencia Internacional de ACV en América Latina',
        desc: 'Encuentro regional bienal organizado en colaboración con las redes nacionales iberoamericanas de ciclo de vida.',
      },
    ],
  },
  {
    id: 'latinoamerica',
    num: '03',
    title: 'Redes hermanas en',
    titleEm: 'Latinoamérica',
    count: '4 redes nacionales',
    redes: [
      {
        href: 'http://redacvchile.wixsite.com/acvchile',
        logo: '/assets/logos/red-chilena.avif',
        alt: 'Red Chilena de ACV',
        sig: 'RACV CL',
        pais: 'Chile',
        h3: 'Red Chilena de Análisis de Ciclo de Vida',
        desc: 'Comunidad chilena que articula academia, gobierno y empresa en torno al ACV y la sostenibilidad nacional.',
      },
      {
        href: 'http://red.pucp.edu.pe/ciclodevida/',
        logo: '/assets/logos/red-peruana.png',
        alt: 'Red Peruana de Ciclo de Vida',
        sig: 'REC PE',
        pais: 'Perú',
        h3: 'Red Peruana de Ciclo de Vida y Ecología Industrial',
        desc: 'Iniciativa peruana coordinada desde la PUCP, integra investigación e industria con enfoque de ciclo de vida.',
      },
      {
        href: 'https://cnaranjo4.wixsite.com/redcolombianaacv',
        logo: '/assets/logos/red-colombiana.avif',
        alt: 'Red Colombiana de Ciclo de Vida',
        sig: 'RACV CO',
        pais: 'Colombia',
        h3: 'Red Colombiana de Ciclo de Vida',
        desc: 'Articula a la comunidad colombiana de ACV: universidades, centros de investigación, consultoría y sector público.',
      },
      {
        href: 'http://www.alcalacr.org/',
        logo: '/assets/logos/alcala.svg',
        alt: 'AlCALA',
        sig: 'AlCALA',
        pais: 'Centroamérica',
        h3: 'Alianza Centroamericana de ACV',
        desc: 'Red regional centroamericana enfocada en construir capacidades locales para el Análisis de Ciclo de Vida.',
      },
    ],
  },
  {
    id: 'mexico',
    num: '04',
    title: 'Aliados en',
    titleEm: 'México',
    count: '3 organizaciones',
    redes: [
      {
        href: 'https://www.aclca.org/',
        logo: '/assets/logos/aclca.png',
        alt: 'ACLCA',
        sig: 'ACLCA',
        pais: 'EE. UU. · NA',
        h3: 'American Center for Life Cycle Assessment',
        desc: 'Organización norteamericana dedicada a educación, divulgación e incidencia para fortalecer el ACV ambiental.',
      },
      {
        href: 'https://www.cadis.earth/',
        logo: '/assets/logos/cadis.jpg',
        alt: 'CADIS',
        sig: 'CADIS',
        pais: 'México',
        h3: 'Centro de Análisis de Ciclo de Vida y Diseño Sustentable',
        desc: 'Socio nacional en proyectos, conferencias y desarrollo de capacidades en ACV en México.',
      },
      {
        href: 'https://ciclodevida.mx/',
        logo: '/assets/logos/mexilca.webp',
        alt: 'MexiLCA',
        sig: 'MexiLCA',
        pais: 'México',
        h3: 'Base de Datos Mexicana de Ciclo de Vida',
        desc: 'Iniciativa nacional para construir y mantener bases de datos representativas del contexto mexicano.',
      },
    ],
  },
];

function RedCard({ red, delay }) {
  return (
    <a
      className={`red-card reveal ${delay}`.trim()}
      href={red.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={`red-logo ${red.mono ? 'red-logo-mono' : ''}`}>
        {red.mono ? (
          <span className="red-mono">
            {red.mono[0]}
            <small>{red.mono[1]}</small>
          </span>
        ) : (
          <img src={red.logo} alt={red.alt} loading="lazy" />
        )}
      </div>
      <div className="red-head">
        <span className="red-sig">{red.sig}</span>
        <span className="red-pais">{red.pais}</span>
      </div>
      <h3>{red.h3}</h3>
      <p>{red.desc}</p>
      <span className="red-link">
        Visitar <span className="arrow">↗</span>
      </span>
    </a>
  );
}

export default function RedesAliadas() {
  useScrollProgress();
  useReveal();

  useEffect(() => {
    document.title = 'Redes aliadas · REMACV';
  }, []);

  return (
    <>
      <div className="scroll-progress" id="scrollProgress"></div>
      <Nav />

      <PageHeader
        crumb="Redes aliadas"
        title={<>Una <em>comunidad global</em><br/>del ciclo de vida.</>}
        lede="REMACV dialoga y colabora con redes de ciclo de vida en México, Iberoamérica, América Latina y a nivel internacional."
      >
        <div className="region-nav reveal d3">
          {REGIONS.map((r) => (
            <a key={r.id} href={`#${r.id}`}>
              {r.id === 'global' ? 'Global'
                : r.id === 'iberoamerica' ? 'Iberoamérica'
                : r.id === 'latinoamerica' ? 'Latinoamérica'
                : 'México'}
            </a>
          ))}
        </div>
      </PageHeader>

      <div className="container">
        {REGIONS.map((region) => (
          <section className="region-section" id={region.id} key={region.id}>
            <div className="region-head reveal">
              <span className="region-num">{region.num}</span>
              <h2>{region.title} <em>{region.titleEm}</em></h2>
              <span className="region-count">{region.count}</span>
            </div>
            <div className="redes-grid">
              {region.redes.map((red, i) => (
                <RedCard
                  key={red.sig}
                  red={red}
                  delay={['', 'd1', 'd2', 'd3'][i] || ''}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </>
  );
}
