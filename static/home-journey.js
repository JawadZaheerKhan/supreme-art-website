// Home process journey: the scroll position is the playhead for one carton travelling through the factory photos.
// Each keyframe names a photo, a camera (focus x/y as fractions of the photo, zoom s, and c — how far the focus
// is pulled to the centre of the frame) and what the carton and the printing plate look like and where they sit,
// in fractions of that photo. Between keyframes everything eases; across a photo change the shots cross-fade
// while the carton travels in screen space from one photo's spot to the next.
(() => {
  const section = document.querySelector('.home-journey');
  const track = section?.querySelector('.home-journey__track');
  if (!track) return;
  const sticky = track.querySelector('.home-journey__sticky');
  const shots = [...track.querySelectorAll('.home-journey__shot')];
  const images = shots.map(shot => shot.querySelector('img'));
  const carton = track.querySelector('.home-journey__carton');
  const scene = carton.querySelector('.proc-box__scene');
  const plate = track.querySelector('.home-journey__plate');
  const steps = [...track.querySelectorAll('[data-journey-step]')];
  const meter = track.querySelector('.home-journey__meter span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // Natural sizes of the 13 photos, in order (design → delivery).
  const sizes = [[1448,1086],[1317,1086],[1448,1086],[1448,1086],[638,940],[1240,1086],[1086,1448],[1448,1086],[1086,1448],[1086,1448],[1448,1086],[1448,1086],[1086,1448]];

  const cartonVars = { print: 0, plate: 0, red: 0, cut: 0, sides: 0, flaps: 0, view: 0, sheet: 0, blank: 0, mono: 0, ink: 0, scan: 0, uv: 0, spot: 0 };
  const keys = [
    // Design: zoom into the designer's screen, where the carton artwork appears.
    { photo: 0, step: 0, cam: [.705, .54, 1, 0], carton: { a: 0, x: .705, y: .54, w: .2, r: 0 } },
    { photo: 0, step: 0, cam: [.705, .54, 2.3, 1], carton: { a: 1, w: .25, v: { print: 1, red: 1 } } },
    // CTP: the artwork flies onto the blue plate and dissolves into it.
    { photo: 1, step: 1, cam: [.36, .54, 1.2, .25], carton: { x: .37, y: .52, w: .19, r: -6, v: { plate: .6 } } },
    { photo: 1, step: 1, cam: [.36, .54, 1.3, .35], carton: { a: 0, w: .17, v: { plate: 1 } }, plate: { a: 1, x: .37, y: .52, w: .19, r: -6, coat: 1, image: .25 } },
    // Processor: the plate goes in among the rollers.
    { photo: 2, step: 2, cam: [.43, .45, 1.1, .2], plate: { x: .43, y: .2, w: .2, r: 0 } },
    { photo: 2, step: 2, cam: [.43, .5, 1.2, .25], plate: { a: 0, y: .55, sy: .2 } },
    // Out on the tray, washed to aluminium with the image showing; then the carton returns in plate blue.
    { photo: 3, step: 3, cam: [.36, .64, 1.1, .2], plate: { a: 1, x: .38, y: .64, w: .36, sy: .5, sk: -28, coat: 0, image: 1 } },
    { photo: 3, step: 3, cam: [.5, .5, 1.05, .3], carton: { a: 1, x: .62, y: .38, w: .3, r: 0, v: { print: 1, red: 1, plate: .45, view: .25 } }, plate: { a: .35 } },
    // Press: back to plate size, onto the press and rolled in around the roller.
    { photo: 4, step: 4, cam: [.69, .62, 1.1, .2], carton: { a: 0, w: .25 }, plate: { a: 1, x: .69, y: .5, w: .3, sy: .75, sk: 0, r: 0 } },
    { photo: 4, step: 4, cam: [.69, .67, 1.3, .3], plate: { a: 0, y: .675, w: .24, sy: .04 } },
    // Feeder: a white sheet lifts off the pallet.
    { photo: 5, step: 5, cam: [.76, .8, 1.05, .1], carton: { a: 0, x: .76, y: .76, w: .12, r: 0, v: { print: 0, red: 0, plate: 0, view: 0, sheet: 1, blank: 1 } } },
    { photo: 5, step: 5, cam: [.7, .6, 1.1, .2], carton: { a: 1, x: .62, y: .42, w: .26, r: -8 } },
    // UV coater: in at the green light, out coated with its gloss sweep.
    { photo: 6, step: 6, cam: [.43, .75, 1.15, .25], carton: { x: .43, y: .62, w: .42, r: 0 } },
    { photo: 6, step: 6, cam: [.43, .78, 1.2, .3], carton: { y: .75, w: .38, v: { uv: 1, spot: 1 } } },
    // Die-cutter: the cut traces the carton.
    { photo: 7, step: 7, cam: [.5, .47, 1.05, .15], carton: { x: .5, y: .45, w: .36 } },
    { photo: 7, step: 7, cam: [.5, .47, 1.12, .2], carton: { v: { cut: 1 } } },
    // Breaking out: the waste sheet falls away.
    { photo: 8, step: 8, cam: [.75, .52, 1.1, .2], carton: { x: .77, y: .5, w: .3, v: { sheet: 0, view: .15 } } },
    // Inspection: the finished design, in the inspector's hands.
    { photo: 9, step: 9, cam: [.6, .58, 1.15, .25], carton: { x: .6, y: .56, w: .32, v: { blank: 0, print: 1, red: 1, view: .5 } } },
    // Folder-gluer: folded and glued along the belt.
    { photo: 10, step: 10, cam: [.45, .44, 1.1, .2], carton: { x: .36, y: .44, w: .2, v: { sides: 1, flaps: .15, view: 1 } } },
    { photo: 10, step: 10, cam: [.5, .44, 1.15, .25], carton: { x: .55, y: .42, w: .18, v: { flaps: 1, cut: 0 } } },
    // Packing: down into a shipping box.
    { photo: 11, step: 11, cam: [.54, .69, 1.1, .2], carton: { x: .54, y: .56, w: .13 } },
    { photo: 11, step: 11, cam: [.54, .7, 1.15, .25], carton: { a: 0, y: .69, w: .06 } },
    // Delivery.
    { photo: 12, step: 12, cam: [.42, .6, 1, 0] },
    { photo: 12, step: 12, cam: [.42, .6, 1.12, .2] }
  ];

  // Carry every value forward so each keyframe holds a complete state.
  let c = { a: 0, x: .5, y: .5, w: .2, r: 0, v: { ...cartonVars } };
  let p = { a: 0, x: .5, y: .5, w: .2, r: 0, sk: 0, sy: 1, coat: 1, image: 0 };
  const frames = keys.map(k => {
    c = { ...c, ...k.carton, v: { ...c.v, ...(k.carton?.v || {}) } };
    p = { ...p, ...k.plate };
    return { photo: k.photo, step: k.step, cam: k.cam, carton: c, plate: p };
  });
  const last = frames.length - 1;
  track.style.setProperty('--journey-steps', last);

  const clamp = v => Math.max(0, Math.min(1, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  // Where each photo sits, whole, in the frame: beside the caption card on wide screens, above it on phones.
  let boxes = [], centre = [0, 0];
  function layout() {
    const W = sticky.clientWidth, H = sticky.clientHeight, wide = W >= 1000;
    const area = wide
      ? { x: Math.min(420, W * .3), y: 84, w: W - Math.min(420, W * .3) - 24, h: H - 108 }
      : { x: 12, y: 76, w: W - 24, h: H - 76 - 200 };
    centre = [area.x + area.w / 2, area.y + area.h / 2];
    boxes = sizes.map(([w, h]) => {
      const s = Math.min(area.w / w, area.h / h);
      const bw = w * s, bh = h * s;
      return { x: area.x + (area.w - bw) / 2, y: area.y + (area.h - bh) / 2, w: bw, h: bh };
    });
    images.forEach((img, i) => { img.style.width = boxes[i].w + 'px'; img.style.height = boxes[i].h + 'px'; });
  }

  // Camera for a photo: the focus point is pulled toward the frame centre by c, and the photo scales s around it.
  function camera(photo, [fx, fy, s, cpull]) {
    const b = boxes[photo];
    const bx = b.x + fx * b.w, by = b.y + fy * b.h;
    const tx = mix(bx, centre[0], cpull), ty = mix(by, centre[1], cpull);
    return { b, s, fx, fy, tx, ty, ox: tx - fx * b.w * s, oy: ty - fy * b.h * s };
  }
  const toScreen = (cam, x, y) => [cam.tx + (x - cam.fx) * cam.b.w * cam.s, cam.ty + (y - cam.fy) * cam.b.h * cam.s];

  function show(el, alpha) {
    el.style.opacity = String(alpha);
    el.style.visibility = alpha > .001 ? 'visible' : 'hidden';
  }

  function paint(pos) {
    const i = Math.min(Math.floor(pos), last - 1 < 0 ? 0 : last - 1);
    const t = clamp(pos - i);
    const e = smooth(t);
    const A = frames[i], B = frames[Math.min(i + 1, last)];
    const same = A.photo === B.photo;

    let camA, camB, fade = 0;
    if (same) {
      camA = camB = camera(A.photo, A.cam.map((v, k) => mix(v, B.cam[k], e)));
    } else {
      fade = smooth(clamp((t - .2) / .6));
      camA = camera(A.photo, [A.cam[0], A.cam[1], A.cam[2] * (1 + .08 * e), A.cam[3]]);
      camB = camera(B.photo, [B.cam[0], B.cam[1], B.cam[2] * (1 + .08 * (1 - e)), B.cam[3]]);
    }

    shots.forEach((shot, n) => {
      const alpha = n === A.photo ? (same ? 1 : 1 - fade) : n === B.photo ? fade : 0;
      show(shot, alpha);
      if (alpha > 0) {
        const cam = n === A.photo ? camA : camB;
        images[n].style.transform = `translate(${cam.ox}px, ${cam.oy}px) scale(${cam.s})`;
      }
    });

    // An object's screen spot and size: same photo → ease in photo space; across photos → ease in screen space.
    function place(a, b) {
      const pa = toScreen(camA, a.x, a.y), pb = toScreen(camB, b.x, b.y);
      const sa = a.w * camA.b.w * camA.s, sb = b.w * camB.b.w * camB.s;
      if (same) {
        const q = toScreen(camA, mix(a.x, b.x, e), mix(a.y, b.y, e));
        return { x: q[0], y: q[1], size: mix(a.w, b.w, e) * camA.b.w * camA.s };
      }
      return { x: mix(pa[0], pb[0], e), y: mix(pa[1], pb[1], e), size: mix(sa, sb, e) };
    }

    const ca = A.carton, cb = B.carton;
    const cAlpha = mix(ca.a, cb.a, e);
    show(carton, cAlpha);
    if (cAlpha > .001) {
      const at = place(ca, cb);
      carton.style.transform = `translate(${at.x - 275}px, ${at.y - 230}px) rotate(${mix(ca.r, cb.r, e)}deg) scale(${at.size / 550})`;
      for (const key in ca.v) {
        const value = mix(ca.v[key], cb.v[key], e);
        const target = ['sheet', 'blank', 'mono', 'ink', 'scan', 'uv', 'spot'].includes(key) ? carton : scene;
        target.style.setProperty('--' + (key === 'sides' ? 'foldA' : key === 'flaps' ? 'foldB' : key), value);
      }
      scene.style.setProperty('--intro', '1');
    }

    const pa = A.plate, pb = B.plate;
    const pAlpha = mix(pa.a, pb.a, e);
    show(plate, pAlpha);
    if (pAlpha > .001) {
      const at = place(pa, pb);
      const k = at.size / 550;
      plate.style.transform = `translate(${at.x - 275}px, ${at.y - 230}px) rotate(${mix(pa.r, pb.r, e)}deg) skewX(${mix(pa.sk, pb.sk, e)}deg) scale(${k}, ${k * mix(pa.sy, pb.sy, e)})`;
      plate.style.setProperty('--coat', mix(pa.coat, pb.coat, e));
      plate.style.setProperty('--image', mix(pa.image, pb.image, e));
    }

    const active = frames[Math.round(pos)].step;
    steps.forEach((el, n) => el.classList.toggle('is-on', n === active));
    meter.style.transform = `scaleX(${pos / last})`;
  }

  let target = 0, current = 0, ticking = false;
  function readScroll() {
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, track.offsetHeight - sticky.offsetHeight);
    target = clamp(-rect.top / travel) * last;
  }
  function frame() {
    current = reduced.matches ? target : current + (target - current) * .18;
    if (Math.abs(target - current) < .001) current = target;
    paint(current);
    ticking = current !== target;
    if (ticking) requestAnimationFrame(frame);
  }
  function update() {
    readScroll();
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  layout();
  readScroll();
  current = target;
  paint(current);
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { layout(); paint(current); update(); });
})();
