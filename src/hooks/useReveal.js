import { useEffect } from 'react';

/**
 * useReveal — keyframe-based reveal-on-scroll.
 *
 * Adds `.in` to any element with class `.reveal` or `.reveal-scale` when it
 * enters the viewport. Plus a safety net (700 ms after mount) that flips
 * every remaining `.reveal` in the initial viewport to `.in`, so animations
 * never leave a page stuck in the pre-animation hidden state — which can
 * happen on route re-mount or after a state change re-renders cards.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
      if (!el.classList.contains('in')) io.observe(el);
    });

    // Safety net: force-show anything still hidden after 700 ms.
    // Covers elements that are in the initial viewport before the
    // observer has had a chance to fire (which on React route re-mount
    // can race the first paint), and elements above the fold whose
    // observation never produces an intersection entry in some browsers.
    const t = setTimeout(() => {
      document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => {
        if (!el.classList.contains('in')) el.classList.add('in');
      });
    }, 700);

    return () => {
      io.disconnect();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
