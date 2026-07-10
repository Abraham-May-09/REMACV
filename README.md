# REMACV — Sitio web

Proyecto **React + Vite** del sitio de la Red Mexicana de Análisis de Ciclo de Vida (REMACV).

## Estructura

```
remacv-react/
├── public/
│   └── assets/               ← Imágenes, logos y archivos estáticos
├── src/
│   ├── components/           ← Nav, Footer, PageHeader (chrome compartido)
│   ├── pages/                ← Home, Eventos, Publicaciones, RedesAliadas
│   ├── styles/               ← CSS por componente / página
│   ├── App.jsx               ← Router principal
│   └── main.jsx              ← Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Requisitos

- **Node.js** 18 o superior
- **npm** 9 o superior (viene con Node)

## Instalación

```bash
cd remacv-react
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador. Los cambios se reflejan al instante (hot reload).

## Build de producción

```bash
npm run build
```

Genera la versión optimizada en `dist/`. Para previsualizarla:

```bash
npm run preview
```

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Home |
| `/eventos` | Archivo de eventos |
| `/publicaciones` | Publicaciones |
| `/redes` | Redes aliadas |

## Tecnologías

- [Vite](https://vitejs.dev/) — bundler
- [React 18](https://react.dev/)
- [React Router 6](https://reactrouter.com/) — navegación cliente

## Notas para editar

- Los **estilos compartidos** (tokens, nav, footer) están en `src/styles/shared.css`
- El **hero crossfade** (4 fotos de paisajes mexicanos) está en `src/styles/shared.css` (`.page-header`) y se reutiliza en todas las sub-páginas
- Cada **página tiene su CSS** (`home.css`, `eventos.css`, etc.) que se carga al renderizar
- Las **imágenes de los eventos** están en `public/assets/events/`
- Las **fotos del comité** en `public/assets/people/`
- Los **logos de redes aliadas** en `public/assets/logos/`

## Contacto

redmexicanadeciclodevida@gmail.com
