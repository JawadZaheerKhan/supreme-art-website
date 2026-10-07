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
      const d = Math.max(-1.5, Math.min(1.5, distance));
      item.style.setProperty('--gallery-tilt', (reduced.matches ? 0 : d * 9) + 'deg');
      item.style.setProperty('--gallery-rise', (reduced.matches ? 0 : Math.abs(d) * 22) + 'px');
      item.style.setProperty('--gallery-scale', reduced.matches ? 1 : 1 - Math.abs(d) * .1);
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
  gallery.addEventListener('wheel', e => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? gallery.clientWidth : 1);
    const max = gallery.scrollWidth - gallery.clientWidth;
    if ((delta < 0 && gallery.scrollLeft <= 1) || (delta > 0 && gallery.scrollLeft >= max - 1)) return;
    e.preventDefault(); gallery.scrollLeft += delta;
  }, {passive:false});
  gallery.addEventListener('keydown', e => {
    if (e.target !== gallery) return;
    if (['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)) {
      e.preventDefault();
      go(e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : active + (['ArrowRight','ArrowDown'].includes(e.key) ? 1 : -1));
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
