(() => {
  // Placeholder until the client confirms the sales number (Bolivia: 591 + 8 digits); same as js/main.js
  const WHATSAPP_NUMBER = '59100000000';
  const DEFAULT_MESSAGE = 'Hola, me gustaría pedir café TigreNegro.';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  root.classList.add('js');

  // WhatsApp links: variety cards send the variety name, everything else a general message
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const variety = link.closest('[data-variety]')?.dataset.variety;
    const message = link.dataset.message
      || (variety ? `Hola, quiero pedir TigreNegro ${variety}, proceso natural, bolsa de 200 g.` : DEFAULT_MESSAGE);
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener';
  });

  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('[data-hero]');
  const video = document.querySelector('[data-hero-video]');
  if (reduceMotion) video?.pause();

  // Process timeline: a static row of cards you swipe or scroll sideways; the panorama and the
  // drawings load as the section nears the viewport and show complete (no scroll animation).
  const timeline = document.querySelector('[data-timeline]');
  const panorama = timeline?.querySelector('[data-timeline-bg]');
  const figures = timeline ? [...timeline.querySelectorAll('.process-figure')] : [];

  const loadTimeline = () => {
    if (panorama) panorama.style.backgroundImage = `url("${panorama.dataset.src}")`;
    figures.forEach((figure) => {
      fetch(figure.dataset.src)
        .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
        .then((markup) => { figure.innerHTML = markup; })
        // Without fetch (e.g. opened from disk) show the drawing as a still image
        .catch(() => { figure.innerHTML = `<img src="${figure.dataset.src}" alt="" />`; });
    });
  };

  if (timeline) {
    const loadObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadObserver.disconnect();
      loadTimeline();
    }, { rootMargin: '100% 0px' });
    loadObserver.observe(timeline);
  }

  // Scroll-driven effects, all in one animation frame.
  // Sticky hero reveal: as the curtain rises over the pinned hero, --reveal goes 0 → 1; the header
  // turns solid once the curtain reaches it, and the video pauses once fully covered.
  const update = () => {
    const y = window.scrollY;
    const viewport = window.innerHeight;
    const reveal = clamp(y / viewport);
    if (!reduceMotion) hero.style.setProperty('--reveal', reveal.toFixed(4));
    header.classList.toggle('is-solid', y >= viewport - header.offsetHeight);
    if (video && !reduceMotion) {
      if (reveal >= 1 && !video.paused) video.pause();
      else if (reveal < 1 && video.paused) video.play().catch(() => {});
    }
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();

  // Product gallery: thumbnails swap the stage image; the info chips only show on the bag
  const stage = document.querySelector('[data-stage]');
  const frame = document.querySelector('[data-stage-frame]');
  const thumbs = [...document.querySelectorAll('.thumb')];
  frame.classList.toggle('has-chips', Boolean(document.querySelector('.thumb.is-active[data-chips]')));
  thumbs.forEach((thumb) => thumb.addEventListener('click', () => {
    if (thumb.classList.contains('is-active')) return;
    thumbs.forEach((t) => {
      t.classList.toggle('is-active', t === thumb);
      t.setAttribute('aria-pressed', String(t === thumb));
    });
    stage.classList.add('is-swapping');
    frame.classList.toggle('has-chips', thumb.hasAttribute('data-chips'));
    const next = new Image();
    next.src = thumb.dataset.src;
    const swap = () => {
      stage.src = thumb.dataset.src;
      stage.alt = thumb.dataset.alt;
      stage.style.objectPosition = thumb.dataset.pos;
      stage.classList.toggle('is-blend', thumb.hasAttribute('data-blend'));
      requestAnimationFrame(() => stage.classList.remove('is-swapping'));
    };
    next.decode ? next.decode().then(swap, swap) : (next.onload = swap);
  }));

  // Variety strip: one card open at a time
  const varieties = [...document.querySelectorAll('.variety[data-variety]')];
  varieties.forEach((card) => {
    const button = card.querySelector('button');
    button.addEventListener('click', () => {
      const open = !card.classList.contains('is-open');
      varieties.forEach((c) => {
        c.classList.toggle('is-open', c === card && open);
        c.querySelector('button').setAttribute('aria-expanded', String(c === card && open));
      });
      if (open) setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }), 350);
    });
  });

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

  // Gentle reveal for content inside the curtain
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
})();
