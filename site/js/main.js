(() => {
  // Placeholder until the client confirms the sales number (Bolivia: 591 + 8 digits)
  const WHATSAPP_NUMBER = '59100000000';
  const DEFAULT_MESSAGE = 'Hola, me gustaría pedir café TigreNegro.';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('js');
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  const heroLogo = document.querySelector('[data-hero-logo]');
  const headerBrand = document.querySelector('.header-brand');
  const flight = document.querySelector('[data-flight]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // WhatsApp links: variety cards send the variety name, everything else a general message
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const variety = link.closest('[data-variety]')?.dataset.variety;
    const message = link.dataset.message
      || (variety ? `Hola, quiero pedir TigreNegro ${variety}, proceso natural, bolsa de 200 g.` : DEFAULT_MESSAGE);
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener';
  });

  // Mobile menu
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
    mobileMenu.hidden = !open;
    header.classList.remove('is-hidden');
  };
  menuToggle?.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !mobileMenu.hidden) setMenu(false); });

  // Split headings into words and letters, so letters stagger in without breaking words
  document.querySelectorAll('[data-split]').forEach((heading) => {
    let index = 0;
    const words = heading.textContent.trim().split(/\s+/);
    heading.setAttribute('aria-label', heading.textContent.trim());
    heading.innerHTML = words.map((word) => {
      const chars = [...word].map((char) => `<span class="char" style="--i:${index++}">${char}</span>`).join('');
      return `<span class="word" aria-hidden="true">${chars}</span>`;
    }).join(' ');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal], [data-split]').forEach((element) => revealObserver.observe(element));

  // Flip cards: hover flips on desktop (CSS); tap or keyboard toggles everywhere
  document.querySelectorAll('.variety-card .variety-front').forEach((front) => {
    front.addEventListener('click', () => {
      const card = front.closest('.variety-card');
      const flipped = card.classList.toggle('is-flipped');
      front.setAttribute('aria-expanded', String(flipped));
      if (flipped) card.querySelector('.variety-back a')?.focus({ preventScroll: true });
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

  // Process timeline (structure after apocalypsecoffee.com's): the stage pins while vertical
  // scroll slides the track sideways, and the panorama behind it pans more slowly.
  // Each card's drawing draws itself, scrubbed by scroll, as the card comes in
  // (outlines first, then the traced drawings fill in).
  const timeline = document.querySelector('[data-timeline]');
  const pin = timeline?.querySelector('[data-timeline-pin]');
  const track = timeline?.querySelector('[data-timeline-track]');
  const panorama = timeline?.querySelector('[data-timeline-bg]');
  const cards = timeline ? [...timeline.querySelectorAll('.process-card')] : [];
  const figures = cards.map((card) => card.querySelector('.process-figure'));
  const stepCurrent = timeline?.querySelector('[data-step-current]');
  const stepBar = timeline?.querySelector('[data-step-bar]');
  const pinned = Boolean(timeline) && !reduceMotion;
  if (pinned) timeline.classList.add('is-pinned');
  let travel = 0;
  let panoramaTravel = 0;
  let cardDraws = [];
  let activeStep = -1;

  const setDraw = (figure, progress) => {
    if (!figure.shapes || figure.progress === progress) return;
    figure.progress = progress;
    const draw = figure.traced ? clamp(progress / .75) : progress;
    const fill = clamp((progress - .55) / .45);
    figure.shapes.forEach(({ el, length }) => {
      el.style.strokeDashoffset = `${length * (1 - draw)}`;
      if (figure.traced) el.style.fillOpacity = `${fill}`;
    });
  };

  const prepareFigure = (figure) => {
    const svg = figure.querySelector('svg');
    if (!svg) return;
    figure.traced = svg.dataset.style === 'traced';
    figure.shapes = [...svg.querySelectorAll('path, ellipse, rect, circle, line, polyline')].map((el) => {
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      return { el, length };
    });
    figure.progress = null;
    setDraw(figure, 0);
    requestUpdate();
  };

  const loadTimeline = () => {
    if (panorama) panorama.style.backgroundImage = `url("${panorama.dataset.src}")`;
    figures.forEach((figure) => {
      fetch(figure.dataset.src)
        .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
        .then((markup) => { figure.innerHTML = markup; prepareFigure(figure); })
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

  // The section is as tall as the stage plus the sideways travel, so one pixel scrolled
  // moves the track one pixel; a short hold at the end lets the last card rest
  const measureTimeline = () => {
    if (!pinned) return;
    const viewportW = root.clientWidth;
    const pinHeight = pin.offsetHeight;
    travel = Math.max(0, track.offsetWidth - viewportW);
    timeline.style.height = `${pinHeight + travel + pinHeight * .2}px`;
    // Each card draws over the scroll that brings it fully into view: from the right edge for
    // cards that slide in, and as the section rises for the first ones, one after another
    const endGap = parseFloat(getComputedStyle(track).paddingRight) || 0;
    const risen = track.offsetTop + track.offsetHeight - pinHeight;
    cardDraws = cards.map((card, index) => {
      const length = card.offsetWidth + endGap;
      const slidIn = card.offsetLeft - (viewportW - length);
      const inView = Math.max(slidIn, risen + index * card.offsetWidth * .55);
      return { from: inView - length, length, center: card.offsetLeft + card.offsetWidth / 2 };
    });
    if (panorama) {
      const width = Math.max(viewportW, pinHeight * Number(panorama.dataset.ratio || 2));
      panorama.style.width = `${width}px`;
      panoramaTravel = width - viewportW;
    }
  };

  const updateTimeline = (viewport) => {
    const box = timeline.getBoundingClientRect();
    if (box.bottom < -viewport || box.top > viewport * 2) return;
    if (!pinned) { figures.forEach((figure) => setDraw(figure, 1)); return; }

    const scrolled = -box.top;
    const progress = clamp(scrolled / Math.max(1, travel));
    track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
    if (panorama) panorama.style.transform = `translate3d(${-progress * panoramaTravel}px, 0, 0)`;

    let active = 0;
    let drawn = 0;
    cardDraws.forEach(({ from, length }, index) => {
      const draw = clamp((scrolled - from) / length);
      setDraw(figures[index], draw);
      if (draw > .5) active = index;
      drawn += draw;
    });
    if (active !== activeStep) {
      activeStep = active;
      stepCurrent.textContent = String(active + 1).padStart(2, '0');
    }
    stepBar.style.transform = `scaleX(${drawn / cards.length})`;
  };

  // Keyboard focus on a card's link scrolls the page to where that card is in view
  track?.addEventListener('focusin', (event) => {
    if (!pinned) return;
    const index = cards.indexOf(event.target.closest('.process-card'));
    if (index < 0) return;
    const offset = clamp(cardDraws[index].center - root.clientWidth / 2, 0, travel);
    window.scrollTo({ top: timeline.getBoundingClientRect().top + window.scrollY + offset, behavior: 'instant' });
  });

  // Scroll-driven effects, all in one animation frame
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const scaleItems = [...document.querySelectorAll('[data-scale]')];
  const useFlight = !reduceMotion && hero && heroLogo && headerBrand && flight;
  if (useFlight) root.classList.add('js-flight');
  let lastY = window.scrollY;

  const update = () => {
    const y = window.scrollY;
    const viewport = window.innerHeight;
    const heroHeight = hero ? hero.offsetHeight : 0;

    // Header: solid past the hero; hides on scroll down and returns on scroll up
    header.classList.toggle('is-solid', y > heroHeight - header.offsetHeight);
    if (!document.body.classList.contains('menu-open')) {
      if (y > heroHeight && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y <= heroHeight) header.classList.remove('is-hidden');
    }
    lastY = y;

    // Hero wordmark flies into the header logo slot
    if (useFlight) {
      const progress = clamp(y / (heroHeight * .55));
      const eased = easeInOut(progress);
      const from = heroLogo.getBoundingClientRect();
      const to = headerBrand.getBoundingClientRect();
      // Draw at the large hero size and only scale down, so the wordmark stays sharp
      const baseWidth = Math.max(from.width, to.width);
      const width = lerp(from.width, to.width, eased);
      flight.style.width = `${baseWidth}px`;
      flight.style.transform = `translate3d(${lerp(from.left, to.left, eased)}px, ${lerp(from.top, to.top, eased)}px, 0) scale(${width / baseWidth})`;
      const docked = progress >= 1;
      flight.style.opacity = docked ? '0' : '1';
      header.classList.toggle('logo-docked', docked);
    }

    if (timeline) updateTimeline(viewport);

    if (!reduceMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;
        const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport + rect.height);
        item.style.transform = `translate3d(0, ${progress * -12}%, 0)`;
      });
      scaleItems.forEach((item) => {
        const rect = item.parentElement.getBoundingClientRect();
        const progress = clamp((viewport - rect.top) / (viewport * .8));
        item.style.transform = `scale(${.85 + .15 * easeInOut(progress)})`;
      });
    }
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  const remeasure = () => { measureTimeline(); requestUpdate(); };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', remeasure, { passive: true });
  document.fonts?.ready.then(remeasure);
  measureTimeline();
  update();
})();
