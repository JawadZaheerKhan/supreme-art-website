(() => {
  const gallery = document.querySelector('.client-gallery');
  if (!gallery) return;
  const items = [...gallery.querySelectorAll('.client-pair')];
  const prev = document.querySelector('.client-gallery-prev');
  const next = document.querySelector('.client-gallery-next');
  const count = document.querySelector('.client-gallery-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, frame = 0;
  function paint() {
    frame = 0;
    const bounds = gallery.getBoundingClientRect();
    let closest = Infinity;
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const distance = (r.left + r.width / 2 - bounds.left - bounds.width / 2) / r.width;
      if (Math.abs(distance) < closest) { closest = Math.abs(distance); active = i; }
    });
    count.textContent = (active + 1) + ' / ' + items.length;
    prev.disabled = active === 0;
    next.disabled = active === items.length - 1;
  }
  function update() { if (!frame) frame = requestAnimationFrame(paint); }
  function go(index) {
    const item = items[Math.max(0, Math.min(items.length - 1, index))];
    const r = item.getBoundingClientRect(), g = gallery.getBoundingClientRect();
    gallery.scrollTo({left: gallery.scrollLeft + r.left + r.width / 2 - g.left - g.width / 2, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  gallery.addEventListener('scroll', update, {passive:true});
  // Native scrolling preserves each axis: vertical moves the page, horizontal the gallery.
  gallery.addEventListener('keydown', e => {
    if (e.target !== gallery) return;
    if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
      e.preventDefault();
      go(e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : active + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  // In this gallery touch gestures browse the collection; mouse/keyboard still turn cartons.
  gallery.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' && !e.target.closest('button')) e.stopPropagation();
  }, true);
  gallery.querySelectorAll('.product-box-view').forEach(view => view.style.touchAction = 'pan-x pan-y');
  new ResizeObserver(update).observe(gallery);
  reduced.addEventListener('change', update);
  paint();
})();
