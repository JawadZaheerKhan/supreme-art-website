// Photo matte: a photo shown whole (object-fit: contain) in a frame of a different shape leaves empty bands beside
// or above it. For frames marked [data-matte], the bands are painted with the photo's own background, read from its
// edges, so the photo runs on into its frame without a visible join. Works for any photo uploaded through the CMS.
(() => {
  const frames = [...document.querySelectorAll('[data-matte]')];
  if (!frames.length) return;
  const SAMPLES = 7; // colour stops along each edge
  const FEATHER = .05; // the photo fades into its band over this share of its width (or height)
  const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

  function read(img) {
    const w = 128, h = Math.max(8, Math.round(128 * img.naturalHeight / img.naturalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    // where the colour is read: as deep inside the photo as its feathered edge reaches (FEATHER of its size)
    const IN = Math.round(w * FEATHER), INY = Math.round(h * FEATHER);
    // average a few pixels in from the edge, so a thin border or shadow line does not decide the colour
    const at = (x0, x1, y0, y1) => {
      const sum = [0, 0, 0]; let n = 0; let alpha = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = (y * w + x) * 4; sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; alpha += data[i + 3]; n++; }
      if (alpha < n * 250) throw new Error('not decoded');
      return sum.map(v => v / n);
    };
    // a product can touch the edge of a photo: any stop that is clearly not background (far from the edge's typical
    // colour, or strongly coloured) takes the typical colour instead
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const chroma = c => Math.max(...c) - Math.min(...c);
    const stops = (n, pick) => {
      const raw = Array.from({ length: n }, (_, k) => pick(k / (n - 1)));
      const sorted = [...raw].sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
      const typical = sorted[Math.floor(n / 2)];
      return raw.map(c => hex(dist(c, typical) > 26 || chroma(c) > 34 ? typical : c));
    };
    return {
      left: stops(SAMPLES, t => { const y = Math.round(t * (h - 3)); return at(IN, IN + 1, y, y + 2); }),
      right: stops(SAMPLES, t => { const y = Math.round(t * (h - 3)); return at(w - IN - 2, w - IN - 1, y, y + 2); }),
      top: stops(SAMPLES, t => { const x = Math.round(t * (w - 3)); return at(x, x + 2, INY, INY + 1); }),
      bottom: stops(SAMPLES, t => { const x = Math.round(t * (w - 3)); return at(x, x + 2, h - INY - 2, h - INY - 1); })
    };
  }

  function paint(frame) {
    const img = frame.querySelector('img');
    // a lazy photo knows its size before its pixels arrive: read it only once it is fully loaded, and never keep a
    // reading taken from undecoded (transparent, so black) pixels
    if (!img || !img.complete || !img.naturalWidth) return;
    if (!frame._matte) {
      try { frame._matte = read(img); }
      catch { if ((frame._tries = (frame._tries || 0) + 1) < 8) setTimeout(() => paint(frame), 250); return; }
    }
    const m = frame._matte;
    const wide = frame.clientWidth / Math.max(1, frame.clientHeight) > img.naturalWidth / img.naturalHeight;
    // bands at the sides follow the photo's left and right edges top to bottom; bands above and below follow its
    // top and bottom edges left to right
    // the photo is drawn centred in the frame (object-fit: contain); its edges facing a band fade out over FEATHER
    // of its size, so it dissolves into the band instead of meeting it at a line
    const W = frame.clientWidth, H = frame.clientHeight, ratio = img.naturalWidth / img.naturalHeight;
    const pw = wide ? H * ratio : W, ph = wide ? H : W / ratio;
    const o = wide ? (W - pw) / 2 : (H - ph) / 2, len = wide ? pw : ph, fpx = len * FEATHER;
    const banded = (wide ? W - pw : H - ph) > 2;
    const mask = 'linear-gradient(' + (wide ? '90deg' : '180deg') + ', transparent ' + o + 'px, #000 ' + (o + fpx) + 'px, #000 ' + (o + len - fpx) + 'px, transparent ' + (o + len) + 'px)';
    img.style.webkitMaskImage = img.style.maskImage = banded ? mask : '';
    frame.style.background = wide
      ? `linear-gradient(180deg, ${m.left.join(', ')}) left / 50% 100% no-repeat, linear-gradient(180deg, ${m.right.join(', ')}) right / 50% 100% no-repeat`
      : `linear-gradient(90deg, ${m.top.join(', ')}) top / 100% 50% no-repeat, linear-gradient(90deg, ${m.bottom.join(', ')}) bottom / 100% 50% no-repeat`;
  }

  frames.forEach(frame => {
    const img = frame.querySelector('img');
    if (!img) return;
    if (img.complete && img.naturalWidth) paint(frame);
    else img.addEventListener('load', () => paint(frame), { once: true });
  });
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(entries => entries.forEach(e => paint(e.target))); frames.forEach(f => ro.observe(f)); }
  else addEventListener('resize', () => frames.forEach(paint));
})();
