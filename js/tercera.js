(() => {
  // Placeholder until the client confirms the sales number (Bolivia: 591 + 8 digits); same as js/main.js
  const WHATSAPP_NUMBER = '59100000000';
  const DEFAULT_MESSAGE = 'Hola, me gustaría pedir café TigreNegro.';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const waLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const varietyMessage = (name) => `Hola, quiero pedir TigreNegro ${name}, proceso natural, bolsa de 200 g.`;

  document.documentElement.classList.add('js');

  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.href = waLink(link.dataset.message || DEFAULT_MESSAGE);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  // Header: cream over the hero photo, solid once past it
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - header.offsetHeight);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hero video: start from the middle of the clip. The #t=29 fragment on the source does this
  // in most browsers; this covers the rest. Paused for reduced motion and while off screen.
  const video = document.querySelector('[data-hero-video]');
  if (video) {
    const toMiddle = () => {
      if (video.duration && video.currentTime < video.duration * .4) video.currentTime = video.duration / 2;
    };
    if (video.readyState >= 1) toMiddle(); else video.addEventListener('loadedmetadata', toMiddle, { once: true });
    if (reduceMotion) video.pause();
    else new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
    }).observe(video);
  }

  // Variety carousel: the active bag sits in the middle, neighbors shrink to the sides, and the
  // section takes on a tint of the active variety's color. Wraps around in both directions.
  const section = document.querySelector('[data-varieties]');
  const carousel = document.querySelector('[data-carousel]');
  const slides = [...carousel.querySelectorAll('.slide')];
  const nameEl = carousel.querySelector('[data-variety-name]');
  const notesEl = carousel.querySelector('[data-variety-notes]');
  const countEl = carousel.querySelector('[data-count-current]');
  const linkEl = carousel.querySelector('[data-variety-link]');
  const total = slides.length;
  let current = 0;

  const show = (index) => {
    current = (index + total) % total;
    slides.forEach((slide, k) => {
      let d = k - current;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;
      const far = Math.abs(d);
      slide.style.setProperty('--d', d);
      slide.style.setProperty('--s', far === 0 ? 1 : far === 1 ? .7 : .55);
      slide.style.setProperty('--o', far <= 2 ? 1 : 0);
      slide.style.zIndex = String(10 - far);
      slide.classList.toggle('is-active', far === 0);
      const button = slide.querySelector('button');
      button.tabIndex = far <= 1 ? 0 : -1;
      if (far === 0) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
    });
    const slide = slides[current];
    section.style.setProperty('--active', getComputedStyle(slide).getPropertyValue('--glow').trim());
    nameEl.textContent = slide.dataset.name;
    notesEl.textContent = slide.dataset.notes;
    countEl.textContent = String(current + 1).padStart(2, '0');
    linkEl.href = waLink(varietyMessage(slide.dataset.name));
  };

  slides.forEach((slide, k) => slide.querySelector('button').addEventListener('click', () => {
    if (k !== current) show(k);
  }));
  carousel.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
  // Swipe on touch screens
  let startX = null;
  carousel.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  carousel.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
  });
  show(0);

  // Process cards: the card at the left edge is raised; arrows step one card at a time
  const track = document.querySelector('[data-steps]');
  const steps = [...track.querySelectorAll('.step')];
  const stepCurrent = document.querySelector('[data-step-current]');
  let activeStep = -1;
  let targetStep = null; // set while an arrow-driven scroll is on its way, so repeated clicks keep counting
  const edge = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const startOf = (step) => step.offsetLeft - edge();
  const setActive = (k) => {
    if (k === activeStep) return;
    activeStep = k;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === k));
    stepCurrent.textContent = String(k + 1).padStart(2, '0');
  };
  const markActive = () => {
    if (targetStep !== null) {
      if (Math.abs(startOf(steps[targetStep]) - track.scrollLeft) > 2) return;
      targetStep = null;
    }
    let best = 0;
    steps.forEach((step, k) => {
      if (Math.abs(startOf(step) - track.scrollLeft) < Math.abs(startOf(steps[best]) - track.scrollLeft)) best = k;
    });
    setActive(best);
  };
  const goStep = (k) => {
    targetStep = clamp(k, 0, steps.length - 1);
    setActive(targetStep);
    track.scrollTo({ left: startOf(steps[targetStep]), behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  let stepTick = false;
  track.addEventListener('scroll', () => {
    if (stepTick) return;
    stepTick = true;
    requestAnimationFrame(() => { markActive(); stepTick = false; });
  }, { passive: true });
  // A swipe or drag hands control back to the scroll position
  ['pointerdown', 'wheel', 'touchstart'].forEach((type) => track.addEventListener(type, () => { targetStep = null; }, { passive: true }));
  document.querySelector('[data-step-prev]').addEventListener('click', () => goStep(activeStep - 1));
  document.querySelector('[data-step-next]').addEventListener('click', () => goStep(activeStep + 1));
  window.addEventListener('resize', markActive);
  markActive();

  // A hundred grains: one cultivated, ninety-nine conserved
  const grains = document.querySelector('[data-grains]');
  if (grains) grains.innerHTML = Array.from({ length: 100 }, (_, k) => `<i${k === 0 ? ' class="is-cultivated"' : ''}></i>`).join('');

  // Count-up numbers
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const end = Number(target.dataset.count);
      countObserver.unobserve(target);
      if (reduceMotion) return;
      const start = performance.now();
      const tick = (time) => {
        const progress = clamp((time - start) / 1400);
        target.textContent = Math.round(end * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      target.textContent = '0';
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach((counter) => countObserver.observe(counter));

  // Gentle reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
})();
