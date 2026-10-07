// Finishes: a finish with several photos shows one large with the rest as thumbnails; a thumbnail swaps the
// large photo (the glass loupe reads the photo afresh on the next hover).
(() => {
  document.querySelectorAll('.finish__photos').forEach(figure => {
    const main = figure.querySelector('.finish__main img');
    const thumbs = [...figure.querySelectorAll('.finish__thumb')];
    if (!main || !thumbs.length) return;
    const show = thumb => {
      if (thumb.classList.contains('is-current')) return;
      main.src = thumb.dataset.src; main.alt = thumb.dataset.alt || '';
      thumbs.forEach(t => t.classList.toggle('is-current', t === thumb));
    };
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => show(thumb));
      thumb.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(thumb); });
    });
  });
})();
