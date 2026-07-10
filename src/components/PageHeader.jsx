import { Link } from 'react-router-dom';

/**
 * Cinematic hero header used on every sub-page (Eventos, Publicaciones, Redes).
 * 4 crossfading nature photos + dark overlay + grain + title/lede/crumbs.
 */
export default function PageHeader({ crumb, title, lede, children }) {
  return (
    <section className="page-header">
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
