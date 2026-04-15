/**
 * Observatorio de Movilidad — Interaction Effects
 * Only hover/scroll UI effects — no content-hiding animations
 */
(function () {
  'use strict';

  /* ── 1. Header shadow on scroll ─────────────────────────── */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('header-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. Back-to-top button (bottom center, hides over footer) ── */
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.innerHTML =
    '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  const footer = document.querySelector('footer');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const aboveMin = scrolled > 400;
    // hide when button would overlap footer
    let aboveFooter = true;
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      // button bottom is ~window.innerHeight - 32px (2rem from bottom)
      aboveFooter = footerTop > window.innerHeight - 80;
    }
    btn.classList.toggle('show', aboveMin && aboveFooter);
  }, { passive: true });

  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ── 3. Active nav link highlight ───────────────────────── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach((link) => {
    if (link.getAttribute('href') === currentPage)
      link.classList.add('nav-link-active');
  });

  /* ── 4. Gallery image tilt on mouse move ─────────────────── */
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      item.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) scale(1.02)`;
    });
    item.addEventListener('mouseleave', () => { item.style.transform = ''; });
  });

  /* ── 5. Animated number counters ────────────────────────── */
  function animateCount(el) {
    const target = parseInt(el.dataset.count);
    if (!target) return;
    const start = performance.now();
    const duration = 1500;
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-MX');
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
  const countObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
    }),
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => countObs.observe(el));

})();
