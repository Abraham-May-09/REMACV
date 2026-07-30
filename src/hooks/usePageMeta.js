import { useEffect } from 'react';

const SITE_URL = 'https://remacv.mx';
const SITE_NAME = 'REMACV — Red Mexicana de Análisis de Ciclo de Vida';

function setMeta(selector, attr, value, createEl) {
  let el = document.querySelector(selector);
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Sets per-route title, meta description, canonical and Open Graph tags.
 * Needed because the app is a client-side SPA — index.html only carries
 * generic defaults, so each page must patch <head> on mount.
 */
export default function usePageMeta({ title, description, path = '/' }) {
  useEffect(() => {
    document.title = title;
    const url = `${SITE_URL}${path}`;

    setMeta('meta[name="description"]', 'content', description, () => {
      const el = document.createElement('meta');
      el.setAttribute('name', 'description');
      return el;
    });

    setMeta('link[rel="canonical"]', 'href', url, () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    });

    setMeta('meta[property="og:title"]', 'content', title, () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:title');
      return el;
    });

    setMeta('meta[property="og:description"]', 'content', description, () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:description');
      return el;
    });

    setMeta('meta[property="og:url"]', 'content', url, () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:url');
      return el;
    });
  }, [title, description, path]);
}

export { SITE_URL, SITE_NAME };
