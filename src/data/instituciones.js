// ============================================================
// Instituciones y organizaciones representadas en la red.
//
// `logo`: logotipo tomado del sitio oficial de cada institución (noviembre
// 2026). Para alojarlo en el propio sitio, coloca el archivo en
// public/assets/instituciones/ y cambia aquí la ruta. Mientras `logo` esté
// vacío se muestra una tarjeta con la sigla.
// `invertir`: muestra en oscuro un logotipo que solo existe en blanco.
// `sitio`: página oficial; al hacer clic en el logotipo se abre en otra pestaña.

// ============================================================

export const INSTITUCIONES = {
  IPN: {
    sigla: 'IPN',
    nombre: 'Instituto Politécnico Nacional',
    sitio: 'https://www.ipn.mx/',
    logo: 'https://ipn.mx/assets/files/main/img/template/header/logo-ipn-horizontal.svg',
  },
  UAM: {
    sigla: 'UAM',
    nombre: 'Universidad Autónoma Metropolitana',
    sitio: 'https://www.uam.mx/',
    logo: 'https://www.uam.mx/_imgstc/logouam-variacion6.png',
  },
  TEC: {
    sigla: 'Tec',
    nombre: 'Tecnológico de Monterrey',
    sitio: 'https://tec.mx/es',
    logo: '/assets/instituciones/tec.png',
  },
  TEC_QRO: {
    sigla: 'Tec',
    nombre: 'Tecnológico de Monterrey, campus Querétaro',
    sitio: 'https://tec.mx/es',
    galeria: false, // en la galería se representa con TEC
  },
  UANL: {
    sigla: 'UANL',
    nombre: 'Universidad Autónoma de Nuevo León',
    sitio: 'https://www.uanl.mx/',
    logo: 'https://www.uanl.mx/wp-content/uploads/2020/06/uanl.png',
  },
  UNAM: {
    sigla: 'UNAM',
    nombre: 'Universidad Nacional Autónoma de México',
    sitio: 'https://www.unam.mx/',
    logo: 'https://www.iingen.unam.mx/es-mx/Paginas/Splash/images/Logo-UNAM.svg',
  },
  II_UNAM: {
    sigla: 'II UNAM',
    nombre: 'Instituto de Ingeniería, UNAM',
    sitio: 'https://www.iingen.unam.mx/',
    logo: 'https://www.iingen.unam.mx/es-mx/Paginas/Splash/images/Logo-Instituto.svg',
  },
  ENES_MORELIA: {
    sigla: 'ENES Morelia',
    nombre: 'ENES Unidad Morelia, UNAM',
    sitio: 'https://www.enesmorelia.unam.mx/',
    logo: 'https://enesmorelia.unam.mx/wp-content/themes/ENESTHEME/theme_assets/images_enes/home/logo-enes-text.png',
    invertir: true, // el original es blanco; se muestra en oscuro
  },
  UDEM: {
    sigla: 'UDEM',
    nombre: 'Universidad de Monterrey',
    sitio: 'https://www.udem.edu.mx/',
    logo: 'https://www.udem.edu.mx/themes/custom/udm/svg/general/logo.png',
  },
  UADY: {
    sigla: 'UADY',
    nombre: 'Universidad Autónoma de Yucatán',
    sitio: 'https://www.uady.mx/',
    logo: 'https://uady.mx/assets/img/logo_uady.svg',
  },
  UAEMEX: {
    sigla: 'UAEMéx',
    nombre: 'Universidad Autónoma del Estado de México',
    sitio: 'https://www.uaemex.mx/',
    logo: 'https://www.uaemex.mx/images/2025/logos/escudo_w.jpg',
  },
  CADIS: {
    sigla: 'CADIS',
    nombre: 'Centro de Análisis de Ciclo de Vida y Diseño Sustentable',
    sitio: 'https://www.cadis.earth/',
    logo: '/assets/logos/cadis.jpg',
  },
  EARTHSHIFT: {
    sigla: 'EarthShift',
    nombre: 'EarthShift Global',
    sitio: 'https://earthshiftglobal.com/',
    logo: 'https://earthshiftglobal.com/images/earthshift_logo.svg',
  },
  UMA: {
    sigla: 'UMA',
    nombre: 'Universidad del Medio Ambiente',
    sitio: 'https://www.umamexico.com/',
    logo: 'https://static.wixstatic.com/media/14900b_30f8b27d8b3e4cc694f7bf8b8006d637~mv2.png',
  },
  UABJ: {
    sigla: 'UABJ',
    nombre: 'Universidad Autónoma Benito Juárez de Oaxaca',
    sitio: 'https://www.uabjo.mx/',
    logo: '/assets/instituciones/uabj.jpg',
  },
};

// Orden de la galería «Instituciones y organizaciones representadas en la red».
export const GALERIA = [
  'IPN',
  'UAM',
  'TEC',
  'UANL',
  'UNAM',
  'II_UNAM',
  'ENES_MORELIA',
  'UDEM',
  'UADY',
  'UAEMEX',
  'CADIS',
  'EARTHSHIFT',
  'UMA',
  'UABJ',
];
