// Home process journey: the scroll position is the playhead of one continuous camera move through the factory.
// Every photo fills the frame. A keyframe names a photo, what the carton and the printing plate look like and
// where they sit (fractions of that photo), and a camera:
//   view(fx, fy, z)  — frame the photo around (fx, fy) at z × "just covers the screen";
//   lock(target)     — hold the carton or the plate centred at a fixed size on screen.
// Changes of photo always happen between two locks (the carton holds its place and size while the factory
// changes around it) or between two close views of matching spots (a zoom-through), so every frame connects.
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
  const LOCK = .52; // a locked object's width on screen, as a share of the frame's shorter side

  const view = (fx, fy, z = 1) => ({ fx, fy, z });
  const lock = target => ({ lock: target });
  const cartonVars = { print: 0, plate: 0, red: 0, cut: 0, sides: 0, flaps: 0, view: 0, sheet: 0, blank: 0, mono: 0, ink: 0, scan: 0, uv: 0, spot: 0 };
  const keys = [
    // 01 Design — into the designer's screen, where the artwork comes up.
    { photo: 0, step: 0, cam: view(.5, .5), carton: { a: 0, x: .705, y: .54, w: .25, r: 0 } },
    { photo: 0, step: 0, cam: view(.705, .54, 2.2), carton: { a: 1, v: { print: 1, red: 1 } } },
    { photo: 0, step: 0, cam: lock('carton') },
    // 02 CTP — the artwork lands on the blue plate and dissolves into it.
    { photo: 1, step: 1, cam: lock('carton'), carton: { x: .37, y: .52, w: .19, r: -6, v: { plate: .5 } } },
    { photo: 1, step: 1, cam: view(.45, .55, 1.05), carton: { v: { plate: 1 } } },
    { photo: 1, step: 1, cam: view(.42, .55, 1.12), carton: { a: 0 }, plate: { a: 1, x: .37, y: .52, w: .19, r: -6, coat: 1, image: .3 } },
    { photo: 1, step: 1, cam: lock('plate') },
    // 03 Processing — the plate goes in among the rollers; zoom on through.
    { photo: 2, step: 2, cam: lock('plate'), plate: { x: .43, y: .24, r: 0, w: .2 } },
    { photo: 2, step: 2, cam: view(.45, .5, 1.02), plate: { y: .45 } },
    { photo: 2, step: 2, cam: view(.43, .55, 1.25), plate: { a: 0, y: .58, sy: .15 } },
    { photo: 2, step: 2, cam: view(.43, .55, 2.4) },
    // 04 Plate ready — out on the tray, washed to aluminium with the image showing; the carton returns in plate blue.
    { photo: 3, step: 3, cam: view(.36, .64, 2.4), plate: { a: 1, x: .38, y: .64, w: .36, sy: .5, sk: -28, coat: 0, image: 1 } },
    { photo: 3, step: 3, cam: view(.45, .55, 1) },
    { photo: 3, step: 3, cam: view(.5, .5, 1.04), carton: { a: 1, x: .64, y: .36, w: .28, r: 0, v: { print: 1, red: 1, plate: .45, view: .25 } }, plate: { a: .3 } },
    // 05 Press — back to plate size, onto the press, rolled in round the roller.
    { photo: 3, step: 4, cam: view(.55, .45, 1.1), carton: { a: 0 }, plate: { a: 1, x: .64, y: .38, w: .28, sy: 1, sk: 0 } },
    { photo: 3, step: 4, cam: lock('plate') },
    { photo: 4, step: 4, cam: lock('plate'), plate: { x: .69, y: .5, w: .3, sy: .75 } },
    { photo: 4, step: 4, cam: view(.6, .6, 1.02), plate: { y: .6 } },
    { photo: 4, step: 4, cam: view(.69, .67, 1.3), plate: { a: 0, y: .675, w: .24, sy: .04 } },
    { photo: 4, step: 4, cam: view(.69, .67, 2.4) },
    // 06 Sheets — a white sheet lifts off the pallet.
    { photo: 5, step: 5, cam: view(.76, .8, 2.4), carton: { a: 0, x: .76, y: .78, w: .12, r: 0, v: { print: 0, red: 0, plate: 0, view: 0, sheet: 1, blank: 1 } } },
    { photo: 5, step: 5, cam: view(.62, .55, 1) },
    { photo: 5, step: 5, cam: view(.6, .5, 1.05), carton: { a: 1, x: .6, y: .44, w: .26, r: -8 } },
    { photo: 5, step: 5, cam: lock('carton') },
    // 07 UV coating — under the green light, out with its gloss.
    { photo: 6, step: 6, cam: lock('carton'), carton: { x: .43, y: .62, w: .42, r: 0 } },
    { photo: 6, step: 6, cam: view(.45, .66, 1), carton: { y: .74, w: .38, v: { uv: 1, spot: 1 } } },
    { photo: 6, step: 6, cam: lock('carton') },
    // 08 Die-cutting.
    { photo: 7, step: 7, cam: lock('carton'), carton: { x: .5, y: .45, w: .36 } },
    { photo: 7, step: 7, cam: view(.5, .5, 1), carton: { v: { cut: 1 } } },
    { photo: 7, step: 7, cam: lock('carton') },
    // 09 Breaking out — the waste sheet falls away.
    { photo: 8, step: 8, cam: lock('carton'), carton: { x: .77, y: .5, w: .3 } },
    { photo: 8, step: 8, cam: view(.6, .5, 1), carton: { v: { sheet: 0, view: .15 } } },
    { photo: 8, step: 8, cam: lock('carton') },
    // 10 Inspection — the finished design in the inspector's hands.
    { photo: 9, step: 9, cam: lock('carton'), carton: { x: .6, y: .56, w: .32, v: { blank: 0, print: 1, red: 1, view: .5 } } },
    { photo: 9, step: 9, cam: view(.55, .5, 1) },
    { photo: 9, step: 9, cam: lock('carton') },
    // 11 Folding & gluing — folded along the belt.
    { photo: 10, step: 10, cam: lock('carton'), carton: { x: .36, y: .44, w: .2, v: { sides: 1, flaps: .15, view: 1 } } },
    { photo: 10, step: 10, cam: view(.5, .45, 1), carton: { x: .55, y: .42, w: .18, v: { flaps: 1, cut: 0 } } },
    { photo: 10, step: 10, cam: lock('carton') },
    // 12 Packing — down into a shipping box; zoom on through.
    { photo: 11, step: 11, cam: lock('carton'), carton: { x: .54, y: .56, w: .13 } },
    { photo: 11, step: 11, cam: view(.52, .62, 1), carton: { a: 0, y: .69, w: .06 } },
    { photo: 11, step: 11, cam: view(.54, .7, 2.4) },
    // 13 Delivery.
    { photo: 12, step: 12, cam: view(.4, .62, 2.4) },
    { photo: 12, step: 12, cam: view(.45, .55, 1) },
    { photo: 12, step: 12, cam: view(.45, .55, 1.06) }
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
  let W = 0, H = 0;

  function layout() {
    W = sticky.clientWidth; H = sticky.clientHeight;
    images.forEach((img, i) => { img.style.width = sizes[i][0] + 'px'; img.style.height = sizes[i][1] + 'px'; });
  }
  const cover = photo => Math.max(W / sizes[photo][0], H / sizes[photo][1]);

  // A camera as { photo, s (px per photo px), cx, cy (photo point wanted at the frame centre) }.
  function cameraOf(frame) {
    const { cam, photo } = frame;
    if (cam.lock) {
      const o = frame[cam.lock];
      const s = Math.max(cover(photo), LOCK * Math.min(W, H) / (o.w * sizes[photo][0]));
      return { photo, s, cx: o.x, cy: o.y };
    }
    return { photo, s: cover(photo) * cam.z, cx: cam.fx, cy: cam.fy };
  }
  // Where the photo goes: its point (cx, cy) at the centre, nudged so the photo always fills the frame.
  function place(cam) {
    const [nw, nh] = sizes[cam.photo];
    const pw = nw * cam.s, ph = nh * cam.s;
    const tx = Math.min(0, Math.max(W - pw, W / 2 - cam.cx * pw));
    const ty = Math.min(0, Math.max(H - ph, H / 2 - cam.cy * ph));
    return { ...cam, pw, tx, ty, at: (x, y) => [tx + x * pw, ty + y * ph] };
  }
  const blend = (a, b, e) => ({ photo: a.photo, s: Math.exp(mix(Math.log(a.s), Math.log(b.s), e)), cx: mix(a.cx, b.cx, e), cy: mix(a.cy, b.cy, e) });

  function show(el, alpha) {
    el.style.opacity = String(alpha);
    el.style.visibility = alpha > .001 ? 'visible' : 'hidden';
  }

  function paint(pos) {
    const i = Math.min(Math.floor(pos), Math.max(0, last - 1));
    const t = clamp(pos - i);
    const e = smooth(t);
    const A = frames[i], B = frames[Math.min(i + 1, last)];
    const same = A.photo === B.photo;
    const camA0 = cameraOf(A), camB0 = cameraOf(B);

    let pa, pb, fade = 0;
    if (same) {
      pa = pb = place(blend(camA0, camB0, e));
    } else {
      // Across a cut the camera keeps pushing forward: the old photo grows past, the new one grows into place.
      fade = smooth(clamp((t - .25) / .5));
      pa = place({ ...camA0, s: camA0.s * (1 + .3 * e) });
      pb = place({ ...camB0, s: camB0.s * (.8 + .2 * e) });
    }

    shots.forEach((shot, n) => {
      const alpha = n === A.photo ? (same ? 1 : 1 - fade) : n === B.photo ? fade : 0;
      show(shot, alpha);
      if (alpha > 0) {
        const cam = n === A.photo ? pa : pb;
        images[n].style.transform = `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`;
      }
    });

    // An object's screen spot and size. In one photo it rides with the camera; across a cut it eases from where
    // it sat in the old photo to where it sits in the new one, ignoring the push, so it is the steady thread.
    function spot(a, b) {
      if (same) {
        const q = pa.at(mix(a.x, b.x, e), mix(a.y, b.y, e));
        return { x: q[0], y: q[1], size: mix(a.w, b.w, e) * pa.pw };
      }
      const ra = place(camA0), rb = place(camB0);
      const qa = ra.at(a.x, a.y), qb = rb.at(b.x, b.y);
      return { x: mix(qa[0], qb[0], e), y: mix(qa[1], qb[1], e), size: mix(a.w * ra.pw, b.w * rb.pw, e) };
    }

    const ca = A.carton, cb = B.carton;
    const cAlpha = mix(ca.a, cb.a, e);
    show(carton, cAlpha);
    if (cAlpha > .001) {
      const at = spot(ca, cb);
      carton.style.transform = `translate(${at.x - 275}px, ${at.y - 230}px) rotate(${mix(ca.r, cb.r, e)}deg) scale(${at.size / 550})`;
      for (const key in ca.v) {
        const value = mix(ca.v[key], cb.v[key], e);
        const target = ['sheet', 'blank', 'mono', 'ink', 'scan', 'uv', 'spot'].includes(key) ? carton : scene;
        target.style.setProperty('--' + (key === 'sides' ? 'foldA' : key === 'flaps' ? 'foldB' : key), value);
      }
      scene.style.setProperty('--intro', '1');
    }

    const qa = A.plate, qb = B.plate;
    const pAlpha = mix(qa.a, qb.a, e);
    show(plate, pAlpha);
    if (pAlpha > .001) {
      const at = spot(qa, qb);
      const k = at.size / 550;
      plate.style.transform = `translate(${at.x - 275}px, ${at.y - 230}px) rotate(${mix(qa.r, qb.r, e)}deg) skewX(${mix(qa.sk, qb.sk, e)}deg) scale(${k}, ${k * mix(qa.sy, qb.sy, e)})`;
      plate.style.setProperty('--coat', mix(qa.coat, qb.coat, e));
      plate.style.setProperty('--image', mix(qa.image, qb.image, e));
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
    current = reduced.matches ? target : current + (target - current) * .16;
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
