// Home clients wall: hover, touch or click a logo and it glides from its tile to a glass card at the centre of
// the screen; leave the wall, tap again, tap the card, press Escape or scroll away and it glides back.
(() => {
  const section = document.querySelector('.home-clients');
  if (!section) return;
  const tiles = [...section.querySelectorAll('[data-client]')];
  const spot = section.querySelector('.home-clients__spot');
  const focus = spot.querySelector('.home-clients__focus');
  const image = focus.querySelector('img');
  const caption = focus.querySelector('figcaption');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)');
  let active = null, closeTimer = 0, openedAt = 0;

  // The transform that lays the centred card exactly over a tile.
  function overTile(tile) {
    focus.style.transform = 'none';
    const a = tile.getBoundingClientRect(), b = focus.getBoundingClientRect();
    return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
  }

  function open(tile) {
    clearTimeout(closeTimer);
    if (active === tile) return;
    const already = !!active;
    active = tile;
    openedAt = scrollY;
    tiles.forEach(t => t.classList.toggle('is-active', t === tile));
    image.src = tile.querySelector('img').currentSrc || tile.querySelector('img').src;
    caption.textContent = tile.getAttribute('aria-label');
    spot.hidden = false;
    spot.classList.add('is-on');
    if (already || reduced.matches) {
      // Already at the centre: just swap what it shows.
      focus.style.transition = 'none';
      focus.style.transform = 'none';
      focus.style.opacity = '1';
      void focus.offsetWidth;
      focus.style.transition = '';
      return;
    }
    focus.style.transition = 'none';
    focus.style.transform = overTile(tile);
    focus.style.opacity = '0';
    void focus.offsetWidth;
    focus.style.transition = '';
    focus.style.transform = 'none';
    focus.style.opacity = '1';
  }

  function close() {
    if (!active) return;
    const tile = active;
    active = null;
    tiles.forEach(t => t.classList.remove('is-active'));
    spot.classList.remove('is-on');
    if (reduced.matches) { spot.hidden = true; return; }
    focus.style.transform = overTile(tile);
    focus.style.opacity = '0';
    const done = () => { focus.removeEventListener('transitionend', done); if (!active) spot.hidden = true; };
    focus.addEventListener('transitionend', done);
    setTimeout(done, 700);
  }

  const later = () => { clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); };

  tiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => { if (hoverable.matches) open(tile); });
    tile.addEventListener('focus', () => open(tile));
    tile.addEventListener('click', () => (active === tile ? close() : open(tile)));
  });
  section.querySelectorAll('.home-clients__wall').forEach(wall => wall.addEventListener('mouseleave', () => { if (hoverable.matches) later(); }));
  focus.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  focus.addEventListener('mouseleave', () => { if (hoverable.matches) later(); });
  focus.addEventListener('click', close);
  section.addEventListener('focusout', event => { if (!section.contains(event.relatedTarget)) close(); });
  document.addEventListener('click', event => { if (active && !section.contains(event.target)) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  addEventListener('scroll', () => { if (active && Math.abs(scrollY - openedAt) > 140) close(); }, { passive: true });
})();
