
  // (Logo mark + wordmark are <img> tags loaded directly from /assets/)

  // ====================================================
  // CURRENT YEAR  —  Footer.jsx ya pone el año, este es un fallback
  // por si el DOM legacy todavía tiene <span id="year">.
  // ====================================================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ====================================================
  // SMOOTH SCROLL
  // ====================================================
  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const navH = 80;
    const y = el.getBoundingClientRect().top + window.pageYOffset - navH;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // ====================================================
  // NAV STATE + PARALLAX + SCROLL PROGRESS
  // ====================================================
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const heroStage = document.querySelector('.hero-stage');
  const acercaImg = document.getElementById('acercaParallax');
  const nlBg = document.getElementById('newsletterBg');

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      // nav state (Nav.jsx ya lo maneja; mantener como fallback null-safe)
      if (nav) {
        if (y > 30) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
      }
      // progress bar
      if (progress) progress.style.width = Math.min(100, (y / docH) * 100) + '%';

      // hero parallax (move whole stage slightly slower than scroll)
      if (heroStage && y < window.innerHeight * 1.2) {
        heroStage.style.transform = `translateY(${y * 0.32}px)`;
      }

      // acerca photo parallax — only when in view
      if (acercaImg) {
        const r = acercaImg.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          const t = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          const shift = (t - 0.5) * -50; // -25 to +25 px
          acercaImg.style.transform = `translateY(${shift}px)`;
        }
      }

      // newsletter bg parallax
      if (nlBg) {
        const r = nlBg.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          const t = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          const shift = (t - 0.5) * -80;
          nlBg.style.transform = `translateY(${shift}px) scale(1.08)`;
        }
      }

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ====================================================
  // REVEAL ON SCROLL
  // ====================================================
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => io.observe(el));

  // ====================================================
  // ANIMATED COUNTERS
  // ====================================================
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.count').forEach((el) => countIO.observe(el));

  // ====================================================
  // NEWSLETTER FORM
  // ====================================================
  function subscribeNL(ev) {
    ev.preventDefault();
    const email = document.getElementById('nl-email').value.trim();
    if (!email) return;
    const form = ev.target;
    form.innerHTML = `<div style="padding: 14px 22px; color: #fff; font-size: 14px; font-weight: 600; letter-spacing: .04em;">¡Listo, ${email}! Te suscribimos al boletín.</div>`;
  }

  // ====================================================
  // MEMBERSHIP FORM
  // ====================================================
  function submitForm() {
    const nombre = document.getElementById('f-nombre').value.trim();
    const correo = document.getElementById('f-correo').value.trim();
    if (!nombre || !correo) {
      const btn = document.getElementById('submitBtn');
      btn.style.background = '#b85d3b';
      btn.textContent = 'Completa nombre y correo';
      setTimeout(() => { btn.style.background = ''; btn.textContent = 'Enviar solicitud'; }, 1800);
      return;
    }
    const inner = document.getElementById('formInner');
    inner.style.opacity = '0';
    inner.style.transform = 'translateY(8px)';
    inner.style.transition = 'opacity .35s ease, transform .35s ease';
    setTimeout(() => {
      inner.innerHTML = `
        <div style="text-align: center; padding: 30px 0;">
          <div style="width: 64px; height: 64px; border-radius: 999px; background: rgba(31,122,71,.12); color: var(--green); display: grid; place-items: center; margin: 0 auto 18px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 style="font-family: var(--serif); font-size: 26px; margin-bottom: 10px;">¡Gracias, ${nombre.split(' ')[0]}!</h3>
          <p style="color: #5b6c61; font-size: 15px; line-height: 1.5;">Hemos recibido tu solicitud.<br>Te contactaremos muy pronto.</p>
        </div>`;
      inner.style.opacity = '1';
      inner.style.transform = 'none';
    }, 360);
  }

  // ====================================================
  // PLACEHOLDER GENERATORS for aliados + comité
  // ====================================================
  function monogramSVG(label, opts) {
    const o = opts || {};
    const bg = o.bg || '#1a2230';
    const fg = o.fg || '#fff';
    const accent = o.accent || '#c4302b';
    const sub = o.sub || '';
    const fs = label.length <= 3 ? 32 : label.length <= 4 ? 26 : 20;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
      <rect width='120' height='120' rx='6' fill='${bg}'/>
      <circle cx='98' cy='22' r='4' fill='${accent}' opacity='.95'/>
      <path d='M14 100 L106 100' stroke='${accent}' stroke-width='1.6' stroke-opacity='.6'/>
      <text x='60' y='${sub ? 60 : 70}' text-anchor='middle'
        font-family='-apple-system, SF Pro Display, Helvetica Neue, sans-serif'
        font-weight='800' font-size='${fs}' letter-spacing='-.5'
        fill='${fg}'>${esc(label)}</text>
      ${sub ? `<text x='60' y='82' text-anchor='middle'
        font-family='-apple-system, SF Pro Text, Helvetica Neue, sans-serif'
        font-weight='600' font-size='7' letter-spacing='1.4'
        fill='${fg}' fill-opacity='.6'>${esc(sub)}</text>` : ''}
    </svg>`;
    return 'data:image/svg+xml;utf8,' + svg.replace(/#/g, '%23').replace(/\n/g, '').replace(/\s{2,}/g, ' ');
  }
  function avatarSVG(initials, hue) {
    const c1 = `hsl(${hue}, 28%, 38%)`;
    const c2 = `hsl(${hue}, 32%, 22%)`;
    const accent = `hsl(${(hue + 40) % 360}, 50%, 62%)`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'>
      <defs>
        <linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stop-color='${c1}'/>
          <stop offset='1' stop-color='${c2}'/>
        </linearGradient>
        <radialGradient id='spot' cx='.35' cy='.3' r='.7'>
          <stop offset='0' stop-color='${accent}' stop-opacity='.2'/>
          <stop offset='1' stop-color='${accent}' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <rect width='200' height='250' fill='url(%23bg)'/>
      <rect width='200' height='250' fill='url(%23spot)'/>
      <g opacity='.32' fill='${c2}'>
        <circle cx='100' cy='112' r='38'/>
        <path d='M40 250 C40 192 64 165 100 165 C136 165 160 192 160 250 Z'/>
      </g>
      <text x='100' y='130' text-anchor='middle'
        font-family='Manrope, sans-serif'
        font-weight='700' font-size='44' letter-spacing='-1'
        fill='#f5f3ec' fill-opacity='.96'>${esc(initials)}</text>
      <text x='100' y='220' text-anchor='middle'
        font-family='Manrope, sans-serif'
        font-weight='700' font-size='8' letter-spacing='2'
        fill='#f5f3ec' fill-opacity='.5'>FOTO POR DEFINIR</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + svg.replace(/#/g, '%23').replace(/\n/g, '').replace(/\s{2,}/g, ' ');
  }
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const aliadoLogos = {
    'aliado-unep':      { label: 'UNEP', sub: 'LIFE CYCLE INITIATIVE', bg: '#1a4d8f', accent: '#7ac4ff' },
    'aliado-ricv':      { label: 'RICV', sub: 'IBEROAMÉRICA',          bg: '#1f7a47', accent: '#7ed09a' },
    'aliado-fslci':     { label: 'FSLCI', sub: 'BERLÍN · GLOBAL',       bg: '#2a2a2a', accent: '#e6a82e' },
    'aliado-aclca':     { label: 'ACLCA', sub: 'AMERICAN CENTER',       bg: '#8a2c2c', accent: '#f0b3a0' },
    'aliado-ilca':      { label: 'ILCA',  sub: 'INTERNATIONAL',         bg: '#0d3b66', accent: '#62c0d6' },
    'aliado-cadis':     { label: 'CADIS', sub: 'MÉXICO',                bg: '#134d33', accent: '#3fa15e' },
    'aliado-unam':      { label: 'UNAM',  sub: 'MÉXICO',                bg: '#0f3a1c', accent: '#cfa14a' },
    'aliado-uanl':      { label: 'UANL',  sub: 'MONTERREY',             bg: '#2c4a3a', accent: '#caa258' },
    'aliado-semarnat':  { label: 'SEMARNAT', sub: 'GOBIERNO',           bg: '#5c2c2c', accent: '#e6a82e' },
    'aliado-cilca':     { label: 'CILCA', sub: 'LATAM',                 bg: '#1f5f7a', accent: '#7ec4d0' },
    'aliado-conahcyt':  { label: 'CONAHCYT', sub: 'CIENCIA',            bg: '#4a2c5c', accent: '#c098e0' },
    'aliado-mexilca':   { label: 'MexiLCA', sub: 'BASE NACIONAL',       bg: '#0f1f17', accent: '#3fa15e' },
  };
  const committeePhotos = {
    'comite-pasiano':   { initials: 'PR', hue: 145 },
    'comite-padilla':   { initials: 'AP', hue: 165 },
    'comite-escamilla': { initials: 'CE', hue: 30 },
    'comite-paredes':   { initials: 'MP', hue: 195 },
    'comite-adriana':   { initials: 'A',  hue: 350 },
    'comite-claudia':   { initials: 'C',  hue: 285 },
    'comite-vocal-1':   { initials: '?',  hue: 100 },
    'comite-vocal-2':   { initials: '?',  hue: 220 },
  };

  function applyPlaceholders() {
    Object.entries(aliadoLogos).forEach(([id, cfg]) => {
      const slot = document.getElementById(id);
      if (slot && !slot.getAttribute('src')) {
        slot.setAttribute('src', monogramSVG(cfg.label, { bg: cfg.bg, accent: cfg.accent, sub: cfg.sub }));
      }
    });
    Object.entries(committeePhotos).forEach(([id, cfg]) => {
      const slot = document.getElementById(id);
      if (slot && !slot.getAttribute('src')) {
        slot.setAttribute('src', avatarSVG(cfg.initials, cfg.hue));
      }
    });
  }
  function tryApply(retries) {
    applyPlaceholders();
    if (retries > 0) setTimeout(() => tryApply(retries - 1), 150);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryApply(10));
  } else {
    tryApply(10);
  }
