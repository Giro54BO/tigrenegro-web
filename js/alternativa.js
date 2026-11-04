(() => {
  // Placeholder until the client confirms the sales number (Bolivia: 591 + 8 digits); same as js/main.js
  const WHATSAPP_NUMBER = '59100000000';
  const DEFAULT_MESSAGE = 'Hola, me gustaría pedir café TigreNegro.';
  const waLink = (message) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  document.documentElement.classList.add('js');

  // WhatsApp links: variety cards send the variety name, everything else a general message
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    const variety = link.closest('[data-variety]')?.dataset.variety;
    const message = link.dataset.message
      || (variety ? `Hola, quiero pedir TigreNegro ${variety}, proceso natural, bolsa de 200 g.` : DEFAULT_MESSAGE);
    link.href = waLink(message);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  // Header gets a solid background once the page scrolls
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Product gallery: thumbnails swap the sticky stage image
  const stage = document.querySelector('[data-stage]');
  const thumbs = [...document.querySelectorAll('.thumb')];
  thumbs.forEach((thumb) => thumb.addEventListener('click', () => {
    if (thumb.classList.contains('is-active')) return;
    thumbs.forEach((t) => {
      t.classList.toggle('is-active', t === thumb);
      t.setAttribute('aria-pressed', String(t === thumb));
    });
    stage.classList.add('is-swapping');
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
    button.setAttribute('aria-label', `${card.dataset.variety}: ver notas`);
    button.addEventListener('click', () => {
      const open = !card.classList.contains('is-open');
      varieties.forEach((c) => {
        c.classList.toggle('is-open', c === card && open);
        c.querySelector('button').setAttribute('aria-expanded', String(c === card && open));
      });
      if (open) setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }), 350);
    });
  });

  // Order form: opens WhatsApp with what the visitor typed
  document.querySelector('[data-order]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = event.currentTarget.message.value.trim();
    window.open(waLink(text ? `Hola, quiero pedir: ${text}` : DEFAULT_MESSAGE), '_blank', 'noopener');
  });

  // Gentle reveal for content below the hero
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
})();
