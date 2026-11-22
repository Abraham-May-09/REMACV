// ============================================================
// Publicaciones de la REMACV.
//
// tipo: 'investigacion' | 'articulo' | 'convocatoria' | 'recurso'
// destacado: true para mostrarla grande al inicio del listado
// autores, revista, doi: datos de citación (opcionales)
// ajuste: 'contain' para mostrar la imagen completa en la tarjeta (carteles anchos)
// html: cuerpo del artículo (HTML simple: p, ul, li, strong, em, a, h2-h4)
// Para agregar una publicación nueva, copia un bloque y cambia los datos.
// ============================================================

export const TIPOS = {
  investigacion: 'Investigación',
  articulo: 'Artículo',
  convocatoria: 'Anuncio y convocatoria',
  recurso: 'Recurso',
};

export const PUBLICACIONES = [
  {
    slug: 'lca-in-mexico-ijlca-2015',
    tipo: 'investigacion',
    destacado: true,
    titulo: 'Life cycle assessment in Mexico: overview of development and implementation',
    autores: 'Leonor Patricia Güereca, Ricardo Ochoa Sosa, Haley E. Gilbert, Nydia Suppen Reynaga',
    revista: 'The International Journal of Life Cycle Assessment, 20, 311–317 (2015)',
    doi: '10.1007/s11367-014-0844-9',
    fecha: '2015-01-21',
    resumen:
      'Revisión de cómo ha evolucionado el análisis de ciclo de vida en México desde 1999: quiénes lo han impulsado y en qué sectores se ha aplicado.',
    imagen: '/assets/events/historico/ijlca-2014.png',
    ajuste: 'cover',
    externo: 'https://doi.org/10.1007/s11367-014-0844-9',
    html: `
<p>Artículo de discusión publicado en <em>The International Journal of Life Cycle Assessment</em> por integrantes de la red, entre ellos sus socias fundadoras Leonor Patricia Güereca y Nydia Suppen Reynaga.</p>
<p>El trabajo parte de una observación: desde 1999 ha habido avances en el uso del ACV en México —capacitación, investigación y aplicación del pensamiento de ciclo de vida en el gobierno, la industria y la academia—, pero en su mayoría como iniciativas aisladas, lo que ha dado la impresión de que el progreso ha sido mínimo.</p>
<p>Entre sus hallazgos, describe que hasta 2010 la investigación y la academia encabezaron los esfuerzos, con énfasis en el manejo de residuos, y que después de ese año el interés se amplió a los sistemas energéticos, la huella de carbono y de agua, y el sector de la construcción. En el sector privado, el interés temprano vino de empresas con presencia en mercados internacionales, como CEMEX, la minería, la industria del calzado, PEMEX y la Comisión Federal de Electricidad.</p>
<p>Recibido el 27 de noviembre de 2014, aceptado el 29 de diciembre de 2014 y publicado en línea el 21 de enero de 2015.</p>`,
  },
  {
    slug: 'ponencia-setac-2012',
    tipo: 'investigacion',
    titulo: 'Life Cycle Assessment in Mexico: Overview and development of the Mexican LCA Network',
    autores: 'Patricia Güereca (Instituto de Ingeniería, UNAM) y Nydia Suppen (CADIS)',
    revista: 'SETAC Europe 18th LCA Case Study Symposium · Copenhague, 26–28 de noviembre de 2012',
    fecha: '2012-11-26',
    resumen:
      'Ponencia presentada en Copenhague sobre el desarrollo del ACV en México y la conformación de la Red Mexicana de Análisis de Ciclo de Vida.',
    imagen: '/assets/events/historico/setac-2012.png',
    ajuste: 'cover',
    html: `
<p>Trabajo presentado en el <strong>SETAC Europe 18th LCA Case Study Symposium</strong>, «Sustainability assessment in the 21st century – tools, trends and applications», celebrado en Copenhague, Dinamarca, del 26 al 28 de noviembre de 2012.</p>
<p>Formó parte de la sesión dedicada a las redes regionales y nacionales de ACV —qué existe y cómo funcionan—, donde se presentó el panorama del ACV en México y el desarrollo de la Red Mexicana de Análisis de Ciclo de Vida.</p>`,
  },
  {
    slug: 'webinars-acv-2019',
    tipo: 'convocatoria',
    titulo: 'Webinars ACV 2019',
    fecha: '2019-08-13',
    resumen:
      'Ciclo de webinars de la Red Iberoamericana de Ciclo de Vida sobre impactos ambientales, ISO 14001 y declaraciones ambientales de producto.',
    imagen: '',
    html: `
<p>Durante el 2019, la Red Iberoamericana de Ciclo de Vida estará realizando una serie de webinars sobre el pensamiento de ciclo de vida. En esta página estaremos colocando la información. A continuación presentamos los más próximos:</p>
<ul>
  <li>Revisión de impactos ambientales en el LCA. Miércoles 26 de junio, de 14:00 a 15:00 h CET. Cassia Ugaya, Brasil.</li>
  <li>ISO 14001:2015 – Gestión ambiental y ACV y novedades del comité de la ISO. Martes 2 de julio, de 14:00 a 15:00 h CET. Nydia Suppen, México.</li>
  <li>Declaraciones ambientales de producto y ACV. Miércoles 10 de julio, de 14:00 a 15:00 h CET. Claudia Peña, Chile – Bárbara Civit, Argentina – Nydia Suppen, México – Pablo Arena, Argentina.</li>
</ul>
<p><a href="https://docs.google.com/forms/d/e/1FAIpQLScbwrx-erC8g_lCKb3gIl1mhJ4N47SIjFxSxWve5IlQInBXIg/viewform?usp=sf_link">Formulario de inscripción</a></p>
<p>El link para unirse al webinar le llegará entre un día y una semana antes por correo electrónico, siempre y cuando se haya registrado en el formulario de inscripción.</p>
<p>Si no eres parte de una Red Nacional asociada a la RICV, el costo de los webinars tiene la siguiente escala:</p>
<ul>
  <li>1 webinar, 10 USD</li>
  <li>2 webinars, 15 USD</li>
  <li>3 webinars, 20 USD</li>
  <li>4 webinars, 25 USD</li>
</ul>
<p>El pago es mediante PayPal y se debe solicitar al siguiente correo electrónico: ricv2019@gmail.com</p>`,
  },
  {
    slug: 'objetivos-de-la-red',
    tipo: 'articulo',
    titulo: 'Objetivos de la Red Mexicana de Análisis de Ciclo de Vida',
    fecha: '2019-05-26',
    resumen:
      'Los propósitos con los que nació la REMACV: agrupar a quienes desarrollan ACV en México, fortalecer sus buenas prácticas e incidir en políticas públicas.',
    imagen: '',
    html: `
<ul>
  <li>Agrupar a los desarrolladores de Análisis de Ciclo de Vida en México.</li>
  <li>Contribuir a la formulación de políticas y a la instrumentación de estrategias destinadas al fortalecimiento del ACV, a sus buenas prácticas y a fomentar un enfoque de ciclo de vida en la toma de decisiones.</li>
  <li>Salvaguardar los intereses de la sociedad en materia de la aplicación del Análisis de Ciclo de Vida, con base en la calidad y la integridad de los estudios desarrollados.</li>
  <li>Proveer de un sitio virtual para el intercambio de documentación, difusión de eventos, cursos, propuestas de proyectos de investigación, temas de tesis y otros relacionados con la temática de la Red.</li>
  <li>Promover el enfoque de ciclo de vida y el uso de herramientas afines como: ecoetiquetado, ecodiseño, gestión de ciclo de vida, huella de agua, huella de carbono, Análisis de Ciclo de Vida Social (ACV-S), Análisis de Ciclo de Vida Ambiental (ACV), Análisis de Ciclo de Vida económico (ACV-E), Análisis de Ciclo de Vida Organizacional (ACV-O), bases de datos de ACV, modelos de impacto ambiental, etc., como herramientas necesarias para la consecución de condiciones sustentables de desarrollo en la actividad empresarial, académica, de administración y de comportamiento de los consumidores.</li>
  <li>Fomentar mayor cooperación entre universidades/instituciones nacionales y/o extranjeras para la difusión del uso de herramientas basadas en un enfoque de ciclo de vida; buscar conjuntamente fondos para actividades de común interés en México.</li>
  <li>Intercambiar información, identificar grupos fuertes en distintas áreas y establecer con ellos programas de colaboración.</li>
  <li>Contribuir a la implementación de políticas públicas a nivel nacional.</li>
</ul>`,
  },
  {
    slug: 'congreso-amica-gin-2019',
    tipo: 'convocatoria',
    titulo: 'Congreso AMICA-GIN 2019',
    fecha: '2019-02-19',
    resumen:
      '4º Congreso de Ingeniería, Ciencia y Gestión Ambiental y 5ª Conferencia de Greening of Industry Network, Ciudad de México, 28 al 30 de octubre de 2019.',
    imagen: '/assets/events/amica-2019.jpg',
    html: `
<p>A través de este medio se le invita a participar en el <strong>4º Congreso de Ingeniería, Ciencia y Gestión Ambiental</strong> y la <strong>5ª Conferencia Internacional de Greening of Industry Network</strong>, que se llevará a cabo <strong>del 28 al 30 de octubre de 2019</strong> en la <strong>Ciudad de México</strong>. El Congreso es organizado por la Asociación Mexicana de Ingeniería, Ciencia y Gestión Ambiental (<a href="http://www.amica.com.mx/portal/">AMICA</a>) y Greening of Industry Network (<a href="http://www.greeningofindustry.org/">GIN</a>).</p>
<p>Con el tema “<strong>Ambiente y Gobernanza: Innovación para la sostenibilidad</strong>”, el congreso tiene como objetivo que investigadores, funcionarios, industriales y estudiantes generen una discusión y compartan experiencias a través de trabajos técnico-científicos y conferencias magistrales realizadas por destacadas personalidades en el área.</p>
<p>Durante el Congreso se hace una integración de temas ambientales de tradición (<strong>agua, residuos, calidad del aire</strong>) con temas vanguardistas y de preocupación nacional e internacional como lo son: <strong>análisis de ciclo de vida, transición energética, sostenibilidad, economía circular, cadena de valor sustentable, cambio climático y manufactura avanzada (inteligencia artificial, “internet of things”, robótica, etcétera)</strong>.</p>
<p>La fecha límite de recepción de trabajos es el <strong><em>15 de marzo de 2019</em></strong>. Trabajos científicos competitivos serán invitados para ser parte del libro Springer de la serie <em>Greening of Industry Studies</em> o como parte del Special Issue del <em>Journal Resources, Conservation and Recycling</em> (Factor de Impacto: 5.12).</p>
<p>Para más información visite la página web <a href="http://www.congresoamica2019.com/">congresoamica2019.com</a></p>
<p>Correo: <a href="mailto:congresoamica@amica.com.mx">congresoamica@amica.com.mx</a></p>`,
  },
  {
    slug: 'cilca-2019',
    tipo: 'convocatoria',
    titulo: 'CILCA 2019 – ACV para la Competitividad Global',
    fecha: '2018-11-14',
    resumen:
      'VIII Conferencia Internacional de Análisis de Ciclo de Vida en Latinoamérica, de regreso en Costa Rica en julio de 2019.',
    imagen: '/assets/events/cilca-2019.jpg',
    ajuste: 'contain',
    html: `
<p><strong>VIII Conferencia Internacional de Análisis de Ciclo de Vida en Latinoamérica.</strong></p>
<p>CILCA es un evento bianual que se lleva a cabo en diferentes países de América Latina y convoca a expertos e interesados de todo el mundo. La primera conferencia de CILCA se llevó a cabo en 2005, precisamente en San José de Costa Rica, y desde allí ha seguido un exitoso viaje que incluye Sao Paulo (Brasil) en 2007, Pucón (Chile) en 2009, Coatzacoalcos (México) en 2011, Mendoza (Argentina) en 2013, Lima (Perú) en 2015 y Medellín (Colombia) en 2017, programada a regresar nuevamente a Costa Rica para julio de 2019.</p>
<p>Fecha límite de recepción de resúmenes para ponencias/pósters: <strong><a href="http://conftool.alcalacr.org/">30 de noviembre de 2018</a></strong></p>
<p>Más información: <a href="https://www.cilca2019.org/">cilca2019.org</a></p>`,
  },
  {
    slug: 'ecodal-puebla-2018',
    tipo: 'convocatoria',
    titulo: 'EcodAL Puebla 2018',
    fecha: '2018-10-25',
    resumen:
      '3ª edición del Congreso Latinoamericano de Ecodiseño, del 29 al 31 de octubre de 2018 en Puebla, México.',
    imagen: '/assets/events/ecodal-2018.png',
    html: `
<p>La 3ª edición del Congreso Latinoamericano de Ecodiseño se llevará a cabo los días <strong>29, 30 y 31 de octubre</strong> de 2018 en la ciudad de Puebla de Zaragoza, capital del estado de <strong>Puebla, México</strong>.</p>
<p>Más información: <a href="http://www.ecodal.org/">ecodal.org</a></p>`,
  },
  {
    slug: 'seminario-internacional-acv-honduras-2018',
    tipo: 'convocatoria',
    titulo: '6° Seminario Internacional de Análisis de Ciclo de Vida',
    fecha: '2018-10-25',
    resumen:
      'Tegucigalpa, Honduras, recibió a expertos internacionales en ACV el 24 y 25 de octubre de 2018.',
    imagen: '',
    html: `
<p>Honduras será sede del sexto seminario internacional de análisis de ciclo de vida. La ciudad de Tegucigalpa recibirá el 24 y 25 de octubre de 2018 a expertos internacionales en el tema.</p>`,
  },
  {
    slug: 'international-journal-of-lca',
    tipo: 'recurso',
    titulo: 'The International Journal of Life Cycle Assessment',
    fecha: '2018-11-14',
    resumen: 'Revista científica dedicada enteramente al análisis de ciclo de vida, publicada por Springer.',
    imagen: '',
    externo: 'https://link.springer.com/journal/11367',
    html: `
<p><a href="https://link.springer.com/journal/11367">The International Journal of Life Cycle Assessment</a>: revista dedicada enteramente al análisis de ciclo de vida.</p>`,
  },
];
