(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.client-group').forEach(group => {
    const gallery = group.querySelector('.client-gallery');
    const items = [...gallery.querySelectorAll('.client-pair')];
    if (!items.length) return;
    const prev = group.querySelector('.client-gallery-prev');
    const next = group.querySelector('.client-gallery-next');
    const count = group.querySelector('.client-gallery-count');
    let active = Math.floor(items.length / 2), frame = 0;
    function paint() {
      frame = 0;
      const bounds = gallery.getBoundingClientRect();
      let closest = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const distance = Math.abs(r.left + r.width / 2 - bounds.left - bounds.width / 2);
        if (distance < closest) { closest = distance; active = i; }
      });
      count.textContent = (active + 1) + ' / ' + items.length;
      prev.disabled = active === 0;
      next.disabled = active === items.length - 1;
    }
    function update() { if (!frame) frame = requestAnimationFrame(paint); }
    function go(index, instant = false) {
      const item = items[Math.max(0, Math.min(items.length - 1, index))];
      const r = item.getBoundingClientRect(), g = gallery.getBoundingClientRect();
      gallery.scrollTo({left: gallery.scrollLeft + r.left + r.width / 2 - g.left - g.width / 2, behavior: instant || reduced.matches ? 'instant' : 'smooth'});
    }
    prev.addEventListener('click', () => go(active - 1));
    next.addEventListener('click', () => go(active + 1));
    gallery.addEventListener('scroll', update, {passive:true});
    // Leave vertical wheels and swipes to the page; horizontal motion stays native.
    gallery.addEventListener('keydown', e => {
      if (e.target !== gallery) return;
      if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) {
        e.preventDefault();
        go(e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : active + (e.key === 'ArrowRight' ? 1 : -1));
      }
    });
    go(active, true);
    paint();
    let width = gallery.clientWidth;
    new ResizeObserver(() => {
      if (width !== gallery.clientWidth) { width = gallery.clientWidth; go(active, true); }
      update();
    }).observe(gallery);
  });
})();
