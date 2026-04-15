/**
 * Observatorio de Movilidad — Effects & Animations
 */

(function () {
  'use strict';

  /* ── 1. Scroll Reveal (Intersection Observer) ─────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  document
    .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    .forEach((el) => revealObserver.observe(el));

  /* ── 2. Stagger children within [data-stagger] containers ─── */
  document.querySelectorAll('[data-stagger]').forEach((container) => {
    container.querySelectorAll('.reveal').forEach((child, i) => {
      child.style.transitionDelay = `${i * 90}ms`;
      revealObserver.observe(child);
    });
  });

  /* ── 3. Header — add shadow when scrolled ────────────────── */
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () =>
      header.classList.toggle('header-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 4. Hero parallax background ─────────────────────────── */
  const parallaxBg = document.querySelector('.parallax-bg');
  if (parallaxBg) {
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight * 1.5) {
          parallaxBg.style.transform = `translateY(${scrolled * 0.35}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ── 5. Back-to-top button ────────────────────────────────── */
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.innerHTML =
    '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('show', window.scrollY > 400),
    { passive: true }
  );
  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ── 6. Smooth active-nav highlight on scroll ─────────────── */
  // highlight nav links matching current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('nav-link-active');
    }
  });

  /* ── 7. Image tilt on mouse move (gallery items) ─────────── */
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      item.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) scale(1.03)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });

  /* ── 8. Counter animation for numbers ────────────────────── */
  function animateCount(el) {
    const target = parseInt(el.dataset.count);
    if (!target) return;
    const duration = 1500;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-MX');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

})();
