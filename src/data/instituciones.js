// ============================================================
// Instituciones y organizaciones representadas en la red.
//
// Para usar el logotipo oficial de una institución, coloca el archivo en
// public/assets/instituciones/ y escribe su ruta en `logo`. Mientras `logo`
// esté vacío se muestra una tarjeta tipográfica con la sigla.
// ============================================================

export const INSTITUCIONES = {
  IPN: {
    sigla: 'IPN',
    nombre: 'Instituto Politécnico Nacional',
    logo: '',
  },
  UAM: {
    sigla: 'UAM',
    nombre: 'Universidad Autónoma Metropolitana',
    logo: '',
  },
  TEC: {
    sigla: 'Tec',
    nombre: 'Tecnológico de Monterrey',
    logo: '',
  },
  TEC_QRO: {
    sigla: 'Tec',
    nombre: 'Tecnológico de Monterrey, campus Querétaro',
    galeria: false, // en la galería se representa con TEC
  },
  UANL: {
    sigla: 'UANL',
    nombre: 'Universidad Autónoma de Nuevo León',
    logo: '',
  },
  UNAM: {
    sigla: 'UNAM',
    nombre: 'Universidad Nacional Autónoma de México',
    logo: '',
  },
  II_UNAM: {
    sigla: 'II UNAM',
    nombre: 'Instituto de Ingeniería, UNAM',
    logo: '',
  },
  ENES_MORELIA: {
    sigla: 'ENES Morelia',
    nombre: 'ENES Unidad Morelia, UNAM',
    logo: '',
  },
  UDEM: {
    sigla: 'UDEM',
    nombre: 'Universidad de Monterrey',
    logo: '',
  },
  UADY: {
    sigla: 'UADY',
    nombre: 'Universidad Autónoma de Yucatán',
    logo: '',
  },
  UAEMEX: {
    sigla: 'UAEMéx',
    nombre: 'Universidad Autónoma del Estado de México',
    logo: '',
  },
  CADIS: {
    sigla: 'CADIS',
    nombre: 'Centro de Análisis de Ciclo de Vida y Diseño Sustentable',
    logo: '/assets/logos/cadis.jpg',
  },
  EARTHSHIFT: {
    sigla: 'EarthShift',
    nombre: 'EarthShift Global',
    logo: '',
  },
  UMA: {
    sigla: 'UMA',
    nombre: 'Universidad del Medio Ambiente',
    logo: '',
  },
  UABJ: {
    sigla: 'UABJ',
    nombre: 'UABJ',
    logo: '',
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
