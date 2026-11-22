// ============================================================
// Eventos de la REMACV — trayectoria 2011–2019.
//
// inicio / fin: fechas ISO (fin opcional). Si solo se conoce el mes,
//   usa el día 1 y pon `soloMes: true`.
// tipo: 'conferencia' | 'congreso' | 'seminario' | 'webinar' | 'ponencia'
// organiza: true si la REMACV lo organizó o coorganizó.
// imagen: cartel o imagen del evento (null = portada con la marca).
// publicacion: slug en /publicaciones con el anuncio completo (opcional).
//
// Imágenes de eventos históricos: /assets/events/historico/
// ============================================================

export const TIPOS_EVENTO = {
  conferencia: 'Conferencia',
  congreso: 'Congreso',
  seminario: 'Seminario',
  webinar: 'Webinars',
  ponencia: 'Ponencia',
};

export const EVENTOS = [
  {
    id: 'amica-gin-2019',
    tipo: 'congreso',
    titulo: 'Congreso AMICA-GIN 2019',
    subtitulo: '4º Congreso de Ingeniería, Ciencia y Gestión Ambiental · 5ª Conferencia de Greening of Industry Network',
    inicio: '2019-10-28',
    fin: '2019-10-30',
    lugar: 'Instituto de Ingeniería, UNAM · Ciudad de México',
    descripcion:
      'Con el tema «Ambiente y Gobernanza: Innovación para la sostenibilidad», reunió temas ambientales clásicos con análisis de ciclo de vida, economía circular, transición energética y cambio climático.',
    imagen: '/assets/events/amica-2019.jpg',
    ajuste: 'cover',
    sitio: 'http://www.congresoamica2019.com/',
    publicacion: 'congreso-amica-gin-2019',
  },
  {
    id: 'webinars-acv-2019',
    tipo: 'webinar',
    titulo: 'Webinars ACV',
    subtitulo: 'Serie de la Red Iberoamericana de Ciclo de Vida',
    inicio: '2019-06-26',
    fin: '2019-07-10',
    lugar: 'En línea',
    descripcion:
      'Sesiones sobre impactos ambientales en el ACV, ISO 14001 y declaraciones ambientales de producto, con especialistas de Brasil, Chile, Argentina y México, entre ellos Nydia Suppen.',
    imagen: null,
    publicacion: 'webinars-acv-2019',
  },
  {
    id: 'cilca-2019',
    tipo: 'conferencia',
    titulo: 'CILCA 2019',
    subtitulo: 'VIII Conferencia Internacional de ACV en Latinoamérica · ACV para la Competitividad Global',
    inicio: '2019-07-15',
    fin: '2019-07-19',
    lugar: 'San José, Costa Rica',
    descripcion:
      'La conferencia bianual de ACV de América Latina regresó a Costa Rica, donde nació en 2005, tras pasar por Brasil, Chile, México, Argentina, Perú y Colombia.',
    imagen: '/assets/events/cilca-2019.jpg',
    ajuste: 'contain',
    sitio: 'https://www.cilca2019.org/',
    publicacion: 'cilca-2019',
  },
  {
    id: 'ecodal-2018',
    tipo: 'congreso',
    titulo: 'EcodAL México 2018',
    subtitulo: '3er Congreso Latinoamericano de Ecodiseño',
    inicio: '2018-10-29',
    fin: '2018-10-31',
    lugar: 'Cholula, Puebla',
    descripcion:
      'Bajo el lema «Kuali Nextiyotl, buen diseño», reunió a la comunidad latinoamericana de ecodiseño en torno a productos y servicios con menor huella ambiental.',
    imagen: '/assets/events/ecodal-2018.png',
    ajuste: 'cover',
    sitio: 'http://www.ecodal.org/',
    publicacion: 'ecodal-puebla-2018',
  },
  {
    id: 'seminario-honduras-2018',
    tipo: 'seminario',
    titulo: '6° Seminario Internacional de Análisis de Ciclo de Vida',
    subtitulo: 'Sexta edición del seminario internacional',
    inicio: '2018-10-24',
    fin: '2018-10-25',
    lugar: 'Tegucigalpa, Honduras',
    descripcion: 'Tegucigalpa recibió a especialistas internacionales en análisis de ciclo de vida.',
    imagen: null,
    publicacion: 'seminario-internacional-acv-honduras-2018',
  },
  {
    id: 'segundo-seminario-remacv-2017',
    tipo: 'seminario',
    organiza: true,
    titulo: 'Segundo Seminario de la Red Mexicana de ACV',
    subtitulo: 'Organizado por la REMACV',
    inicio: '2017-11-22',
    lugar: 'Auditorio Emilio Rosenblueth, Instituto de Ingeniería, UNAM · Ciudad de México',
    descripcion:
      'Segundo encuentro nacional de la red, celebrado en el Instituto de Ingeniería de la UNAM.',
    imagen: null,
  },
  {
    id: 'cicc-2016',
    tipo: 'congreso',
    organiza: true,
    titulo: '2° Congreso Interamericano de Cambio Climático',
    subtitulo: 'CICC 2016 · Conocimiento e innovación para afrontar los desafíos del cambio climático',
    inicio: '2016-03-14',
    fin: '2016-03-16',
    lugar: 'Ciudad de México',
    descripcion:
      'Organizado por la División de Coordinación de Cambio Climático de AIDIS con el apoyo del Instituto de Ingeniería de la UNAM, AMICA, la REMACV y SEMARNAT.',
    imagen: '/assets/events/historico/cicc-2016.png',
    ajuste: 'cover',
  },
  {
    id: 'primer-seminario-acv-2013',
    tipo: 'seminario',
    organiza: true,
    titulo: 'Primer Seminario de Análisis de Ciclo de Vida en México',
    subtitulo: 'Primer seminario nacional de la red',
    inicio: '2013-08-15',
    lugar: 'Auditorio José Luis Sánchez Bribiesca, Torre de Ingeniería, UNAM · Ciudad de México',
    descripcion:
      'Primer seminario nacional dedicado al análisis de ciclo de vida, celebrado en la Torre de Ingeniería de la UNAM.',
    imagen: '/assets/events/historico/seminario-2013.png',
    ajuste: 'contain',
  },
  {
    id: 'setac-2012',
    tipo: 'ponencia',
    titulo: 'SETAC Europe 18th LCA Case Study Symposium',
    subtitulo: 'Ponencia: «Life Cycle Assessment in Mexico: Overview and development of the Mexican LCA Network»',
    inicio: '2012-11-26',
    fin: '2012-11-28',
    lugar: 'Copenhague, Dinamarca',
    descripcion:
      'La red presentó su trayectoria y el estado del ACV en México en el simposio «Sustainability assessment in the 21st century».',
    imagen: '/assets/events/historico/setac-2012.png',
    ajuste: 'cover',
    publicacion: 'ponencia-setac-2012',
  },
  {
    id: 'cilca-2011',
    tipo: 'conferencia',
    titulo: 'CILCA 2011',
    subtitulo: 'IV Conferencia Internacional de Análisis de Ciclo de Vida en Latinoamérica',
    inicio: '2011-04-04',
    fin: '2011-04-07',
    lugar: 'Coatzacoalcos, Veracruz',
    descripcion:
      'Foro para construir una postura latinoamericana rumbo a Río+20, promoviendo el pensamiento de ciclo de vida con la participación de la academia y la industria.',
    imagen: '/assets/events/historico/cilca-2011.png',
    ajuste: 'cover',
  },
];
