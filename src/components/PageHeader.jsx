import { Link } from 'react-router-dom';

/**
 * Header tipo hero usado en cada subpágina (Eventos, Publicaciones, Redes).
 * 4 fotos con crossfade + overlay oscuro + grano + título/lede/crumbs.
 */
export default function PageHeader({ crumb, parent, title, lede, compact = false, children }) {
  return (
    <section className={`page-header ${compact ? 'page-header-compact' : ''}`.trim()}>
      <div className="page-stage">
        <div className="page-bg b1"></div>
        <div className="page-bg b2"></div>
        <div className="page-bg b3"></div>
        <div className="page-bg b4"></div>
      </div>
      <div className="page-overlay"></div>
      <div className="page-grain"></div>
      <div className="page-header-inner">
        <div className="page-crumbs reveal in">
          <Link to="/">Inicio</Link>
          <span className="sep">/</span>
          {parent && (
            <>
              <Link to={parent.to}>{parent.label}</Link>
              <span className="sep">/</span>
            </>
          )}
          <span>{crumb}</span>
        </div>
        <h1 className="page-title reveal d1 in">{title}</h1>
        {lede && <p className="page-lede reveal d2 in">{lede}</p>}
        <div className="page-header-line"></div>
        {children}
      </div>
    </section>
  );
}
