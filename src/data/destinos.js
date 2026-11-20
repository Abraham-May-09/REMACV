// ============================================================
// Destinos de los botones «Explorar» (líneas temáticas) y «Leer»
// (lecturas imprescindibles) de la página de Inicio.
//
// - Ruta interna:  '/publicaciones/mi-ficha'
// - PDF:           '/docs/mi-documento.pdf'  (archivo en public/docs/)
// - Enlace externo: 'https://...'           (se abre en otra pestaña)
//
// Mientras el valor esté vacío, la tarjeta muestra «Próximamente»
// y no es clicable.
// ============================================================

export const DESTINOS = {
  temas: {
    'economia-circular': '',
    'huella-carbono-agua': '',
    'ecodiseno': '',
    'acv-social-economico': '',
    'ecoetiquetado-dap': '',
    'mexilca': '',
    'politica-incidencia': '',
    'formacion-cursos': '',
  },
  especiales: {
    'huella-hidrica-agricola': '',
    'pet-2030': '',
    'acv-biodiversidad': '',
    'hidrogeno-verde': '',
    'cementeras': '',
  },
};
