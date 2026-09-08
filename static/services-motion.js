/* Animate real grid cards; their layout slots remain reserved throughout. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const speed = 1.2; // Keep the existing playback speed independent of loading and scrolling.
  if (preference.matches || !Element.prototype.animate) return;
  const groups = [...document.querySelectorAll('[data-services-section]')].map(section => {
    const grid = section.querySelector('.grid, .finishes-features');
    if (!grid) return null;
    const cards = [...grid.querySelectorAll(':scope > .card')];
    cards.forEach(card => {
      card.classList.remove('reveal', 'in');
      card.classList.add('service-card-pending');
    });
    grid.classList.add('services-motion-grid');
    return { grid, cards, index: 0 };
  }).filter(Boolean);
  let active = null;
  let queued = false;
  let stopped = false;
  const headerBottom = () => Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 16;
  const visible = rect => rect.bottom > headerBottom() && rect.top < innerHeight - 32;
  const readyToPlay = rect => {
    const top = headerBottom(), bottom = innerHeight - 32;
    const shown = Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, top));
    return shown >= Math.min(rect.height * .45, (bottom - top) * .45);
  };
  const settle = card => {
    card.classList.remove('service-card-pending', 'service-card-moving');
    card.dataset.serviceState = 'placed';
  };
  function cancelActive() {
    if (!active) return;
    active.cancelled = true;
    settle(active.card);
    active.animation?.cancel();
  }
  async function play(group, card) {
    const run = { card, animation: null, cancelled: false };
    active = run;
    card.classList.add('service-card-moving');
    try {
      const box = card.getBoundingClientRect();
      const gridBox = group.grid.getBoundingClientRect();
      const top = Math.max(headerBottom(), gridBox.top);
      const bottom = Math.min(innerHeight - 24, gridBox.bottom);
      const scale = Math.min(1.02, (innerWidth - 32) / box.width, Math.max(80, bottom - top) / box.height);
      const x = innerWidth / 2 - (box.left + box.width / 2);
      const y = (top + bottom) / 2 - (box.top + box.height / 2);
      const center = `translate(${x}px, ${y}px) scale(${scale})`;
      card.dataset.serviceState = 'popping';
      run.animation = card.animate([
        { opacity: 0, transform: `translate(${x}px, ${y + 70}px) scale(${scale * .35}) rotateX(7deg)` },
        { opacity: 1, transform: center }
      ], { duration: cardMotion.reveal / speed, endDelay: cardMotion.hold / speed, easing: cardMotion.easing, fill: 'forwards' });
      await run.animation.finished;
      if (run.cancelled) return;
      card.dataset.serviceState = 'sliding';
      const reveal = run.animation;
      run.animation = card.animate([
        { opacity: 1, transform: center },
        { opacity: 1, transform: 'translate(0px, 0px) scale(1)' }
      ], { duration: cardMotion.slide / speed, endDelay: cardMotion.gap / speed, easing: cardMotion.easing, fill: 'forwards' });
      reveal.cancel();
      await run.animation.finished;
    } catch (error) {
      // Scrolling away, rotating the device, or reduced motion can cancel a run.
      if (error.name !== 'AbortError') console.error(error);
    } finally {
      settle(card);
      run.animation?.cancel();
      active = null;
      schedule();
    }
  }
  function update() {
    queued = false;
    if (stopped) return;
    if (active) {
      if (!visible(active.card.closest('.services-motion-grid').getBoundingClientRect())) cancelActive();
      return;
    }
    for (const group of groups) {
      if (!visible(group.grid.getBoundingClientRect())) continue;
      while (group.index < group.cards.length) {
        const card = group.cards[group.index];
        const rect = card.getBoundingClientRect();
        if (rect.bottom <= headerBottom()) { settle(card); group.index++; continue; }
        if (!readyToPlay(rect)) break;
        group.index++;
        play(group, card);
        return;
      }
    }
  }
  function schedule() {
    if (!queued && !stopped) { queued = true; requestAnimationFrame(update); }
  }
  const observer = new IntersectionObserver(schedule, { rootMargin: '-80px 0px -32px 0px' });
  groups.forEach(group => observer.observe(group.grid));
  addEventListener('scroll', schedule, { passive: true });
  let viewportWidth = innerWidth;
  addEventListener('resize', () => {
    // Mobile browser bars change height during scrolling: do not snap a running card into place.
    if (innerWidth !== viewportWidth) {
      viewportWidth = innerWidth;
      cancelActive();
    }
    schedule();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) active?.animation?.pause();
    else { active?.animation?.play(); schedule(); }
  });
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    stopped = true;
    cancelActive();
    groups.forEach(group => group.cards.forEach(settle));
    observer.disconnect();
  });
  schedule();
})();