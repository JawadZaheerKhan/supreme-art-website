// The home hero: a walk into the building, built in 3D and driven by the page's own scroll, like the gallery
// tour on the portfolio site. The route: outside the building, up to the entrance doors (they swing open),
// through the lobby to its doors (they open too), through the open showroom doors, then right into the press
// hall and round to the Speedmaster. The real photographs are on the walls, unlit and untoned, so every room
// is the real room; floors, ceilings, door frames and the doors themselves are modelled, so the camera has
// true depth to move through. Scrolling back walks back out.
import * as THREE from '/vendor/three.min.js';

const story = document.querySelector('.home-story');
const canvas = story?.querySelector('.home-story__canvas');
if (story && canvas) start();

function start() {
  const sticky = story.querySelector('.home-story__sticky');
  const scenes = [...story.querySelectorAll('[data-home-stage]')];
  const dots = [...story.querySelectorAll('.home-story__progress span')];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch { return; } // no WebGL: the still photograph behind the canvas stays
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe4e8');
  const camera = new THREE.PerspectiveCamera(46, 1, 0.3, 120);

  // ── Materials ──
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  let pending = 0, failed = false;
  const photo = src => {
    pending++;
    const t = loader.load(src, () => { if (--pending === 0) draw(); }, undefined, () => { pending--; failed = true; });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return new THREE.MeshBasicMaterial({ map: t });
  };
  const paint = color => new THREE.MeshBasicMaterial({ color });
  const tiles = (base, line, size, count) => {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = line; g.lineWidth = 2;
    const step = 512 / count;
    for (let i = 0; i <= count; i++) { g.beginPath(); g.moveTo(i * step, 0); g.lineTo(i * step, 512); g.moveTo(0, i * step); g.lineTo(512, i * step); g.stroke(); }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
    t.repeat.set(size / count, size / count);
    return new THREE.MeshBasicMaterial({ map: t });
  };
  const glass = new THREE.MeshBasicMaterial({ color: '#c9dde4', transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide });

  // ── Builders ──
  const box = (w, h, d, material, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y, z); scene.add(m); return m; };
  // a vertical wall in the x/y plane facing +z; `hole` is {x0,x1,y0,y1} in the wall's own coordinates (x from
  // its left edge, y from its bottom); UVs cover the whole wall, so a photo fits it edge to edge
  function wall(width, height, material, hole) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(width, 0); shape.lineTo(width, height); shape.lineTo(0, height); shape.lineTo(0, 0);
    if (hole) { const p = new THREE.Path(); p.moveTo(hole.x0, hole.y0); p.lineTo(hole.x1, hole.y0); p.lineTo(hole.x1, hole.y1); p.lineTo(hole.x0, hole.y1); p.lineTo(hole.x0, hole.y0); shape.holes.push(p); }
    const geometry = new THREE.ShapeGeometry(shape);
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / width, uv.getY(i) / height);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
  }
  // place a wall by its bottom-left corner and the direction it faces: 'n' (+z, toward the entrance),
  // 's' (-z), 'e' (+x) or 'w' (-x)
  function place(mesh, x, y, z, facing) {
    mesh.position.set(x, y, z);
    if (facing === 's') mesh.rotation.y = Math.PI;
    if (facing === 'e') mesh.rotation.y = Math.PI / 2;
    if (facing === 'w') mesh.rotation.y = -Math.PI / 2;
    return mesh;
  }
  const floor = (w, d, material, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m; };
  const ceiling = (w, d, material, x, y, z) => { const m = floor(w, d, material, x, y, z); m.rotation.x = Math.PI / 2; return m; };
  // a pair of door leaves hinged on the outer jambs of an opening centred on x=0 at depth z, swinging to -z
  function doors(width, height, z, frameColor, { glassInset = .06, bar = .05 } = {}) {
    const leafW = width / 2, frame = paint(frameColor);
    return [-1, 1].map(side => {
      const hinge = new THREE.Group();
      hinge.position.set(side * (width / 2), 0, z);
      scene.add(hinge);
      const leaf = new THREE.Group();
      hinge.add(leaf);
      const cx = -side * (leafW / 2); // leaf extends from the hinge toward the centre
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(leafW - glassInset * 2, height - glassInset * 2), glass);
      pane.position.set(cx, height / 2, 0); leaf.add(pane);
      const stile = (x, w, h, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, bar), frame); m.position.set(x, y, 0); leaf.add(m); };
      stile(cx, leafW, bar, bar / 2); stile(cx, leafW, bar, height - bar / 2); // top and bottom rails
      stile(-side * bar / 2, bar, height, height / 2); stile(-side * (leafW - bar / 2), bar, height, height / 2); // hinge and meeting stiles
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .5, 10), paint('#d9d9d9'));
      handle.position.set(-side * (leafW - .14), height * .46, .06); leaf.add(handle);
      return { hinge, side };
    });
  }

  // ── The building ──
  // Outside: the facade photograph (1600×900) is the front wall, 23.7 m wide; its plaza runs below ground
  // level and is hidden by the floor. The entrance doors are cut out where they are in the photograph.
  const F = { w: 23.7, h: 13.33, doorX0: .535, doorX1: .675, doorTop: .585, ground: .80 };
  const fx = f => f * F.w, fy = f => (F.ground - f) * F.h; // photo fractions → metres (y from ground)
  const doorW = fx(F.doorX1) - fx(F.doorX0), doorH = fy(F.doorTop), doorCentre = (fx(F.doorX0) + fx(F.doorX1)) / 2;
  const offF = (1 - F.ground) * F.h; // the photo's plaza runs this far below ground
  place(wall(F.w, F.h, photo('/images/home/hero-building.webp'), { x0: fx(F.doorX0), x1: fx(F.doorX1), y0: offF, y1: offF + doorH }), -doorCentre, -offF, 0, 'n');
  floor(80, 60, tiles('#b9b4ac', '#a39e96', 80, 32), 0, 0, 20);
  // the reveal: the wall is half a metre thick around the doorway
  const reveal = paint('#d9d3c8');
  box(.3, doorH, .5, reveal, -doorW / 2 - .15, doorH / 2, -.25); box(.3, doorH, .5, reveal, doorW / 2 + .15, doorH / 2, -.25);
  box(doorW + .6, .3, .5, reveal, 0, doorH + .15, -.25);
  const entrance = doors(doorW, doorH, -.08, '#9ea4a8');

  // The lobby: 6 m wide, 4.07 m high and 8 m deep; its far wall is the lobby photograph (1448×1086) with the
  // next doors cut out where they are in it.
  const L = { w: 6, h: 4.5, floorLine: .905, x0: .35, x1: .665, top: .27, z: -8 };
  const ly = f => (L.floorLine - f) * L.h;
  const lobbyDoorW = (L.x1 - L.x0) * L.w, lobbyDoorH = ly(.375), lobbyCentre = ((L.x0 + L.x1) / 2) * L.w, lobbyWallH = ly(0);
  const offL = (1 - L.floorLine) * L.h;
  place(wall(L.w, L.h, photo('/images/home/hero-lobby.webp'), { x0: L.x0 * L.w, x1: L.x1 * L.w, y0: offL, y1: offL + lobbyDoorH }), -lobbyCentre, -offL, L.z, 'n');
  const lobbyWall = paint('#e6e0d6');
  floor(L.w, -L.z, tiles('#e9e3d8', '#d6cfc2', 6, 6), 0, .005, L.z / 2);
  ceiling(L.w, -L.z, paint('#f4f1ec'), 0, lobbyWallH, L.z / 2);
  place(wall(-L.z, lobbyWallH, lobbyWall), -L.w / 2, 0, 0, 'e'); // left wall, facing in
  place(wall(-L.z, lobbyWallH, lobbyWall), L.w / 2, 0, L.z, 'w'); // right wall, facing in
  place(wall(L.w, lobbyWallH, lobbyWall, { x0: L.w / 2 - doorW / 2, x1: L.w / 2 + doorW / 2, y0: 0, y1: doorH }), L.w / 2, 0, -.5, 's'); // back of the facade
  // light strips in the ceiling, as in the photograph
  const strip = new THREE.MeshBasicMaterial({ color: '#fff4e0' });
  for (let i = 0; i < 3; i++) { const m = floor(2.4, .35, strip, 0, lobbyWallH - .02, -1.5 - i * 2.4); m.rotation.x = Math.PI / 2; }
  const lobbyDoors = doors(lobbyDoorW, lobbyDoorH, L.z - .06, '#8a7350');

  // A short passage to the showroom doors (black frames, standing open), then the showroom: 4 m wide,
  // 3.75 m high; its far wall is the sample cabinets from the photograph.
  const P = { w: 2.4, h: lobbyDoorH + .5, z0: L.z, z1: -12 };
  const passageWall = paint('#e8e2d8');
  floor(P.w, P.z0 - P.z1, tiles('#e9e3d8', '#d6cfc2', 2.4, 2.4), 0, .005, (P.z0 + P.z1) / 2);
  ceiling(P.w, P.z0 - P.z1, paint('#f4f1ec'), 0, P.h, (P.z0 + P.z1) / 2);
  place(wall(P.z0 - P.z1, P.h, passageWall), -P.w / 2, 0, P.z0, 'e');
  place(wall(P.z0 - P.z1, P.h, passageWall), P.w / 2, 0, P.z1, 'w');
  const S = { w: 4, h: 3.75, z0: P.z1, z1: -17, doorW: 2.3, doorH: 2.7 };
  place(wall(S.w, S.h, passageWall, { x0: S.w / 2 - S.doorW / 2, x1: S.w / 2 + S.doorW / 2, y0: 0, y1: S.doorH }), -S.w / 2, 0, S.z0, 'n'); // the showroom's front wall, seen from the passage
  place(wall(S.w, S.h, passageWall, { x0: S.w / 2 - S.doorW / 2, x1: S.w / 2 + S.doorW / 2, y0: 0, y1: S.doorH }), S.w / 2, 0, S.z0 - .02, 's');
  const showroomDoors = doors(S.doorW, S.doorH, S.z0 - .06, '#1f1f22', { bar: .045 });
  showroomDoors.forEach(({ hinge, side }) => { hinge.rotation.y = side * 1.35; }); // standing open
  const showWall = paint('#e9e3d9');
  floor(S.w, S.z0 - S.z1, tiles('#ece6dc', '#dbd3c6', 4, 4), 0, .005, (S.z0 + S.z1) / 2);
  ceiling(S.w, S.z0 - S.z1, paint('#f6f3ee'), 0, S.h, (S.z0 + S.z1) / 2);
  place(wall(S.w, S.h, photo('/images/home/hero-showroom-wall.webp')), -S.w / 2, 0, S.z1, 'n');
  place(wall(S.z0 - S.z1, S.h, showWall), -S.w / 2, 0, S.z0, 'e');
  // the right wall opens into the press hall
  const H = { x0: S.w / 2, x1: 30, z0: -2, z1: -30, h: 12, openZ0: -16.4, openZ1: -13.4, openH: 3 };

  // The press hall: 28 m by 28 m and 12 m high. The hall photograph stands on its far wall, the Speedmaster on
  // its back wall; the rest is plain.
  const hallWall = paint('#dedcd7');
  floor(H.x1 - H.x0, H.z0 - H.z1, tiles('#a9a9ad', '#97979b', 28, 14), (H.x0 + H.x1) / 2, .002, (H.z0 + H.z1) / 2);
  ceiling(H.x1 - H.x0, H.z0 - H.z1, paint('#f2f2f0'), (H.x0 + H.x1) / 2, H.h, (H.z0 + H.z1) / 2);
  place(wall(H.z0 - H.z1, H.h, hallWall, { x0: H.z0 - H.openZ1, x1: H.z0 - H.openZ0, y0: 0, y1: H.openH }), H.x0, 0, H.z0, 'e'); // hall side of the showroom wall, with the opening
  place(wall(H.z0 - H.z1, H.h, hallWall), H.x1, 0, H.z1, 'w'); // far wall, plain
  place(wall(16, 12, photo('/images/home/hero-press-hall.webp')), H.x1 - .05, 0, -15.3 - 8, 'w'); // the hall photograph on it
  place(wall(H.x1 - H.x0, H.h, hallWall), H.x0, 0, H.z1, 'n'); // back wall, plain
  place(wall(12, 9.63, photo('/images/home/hero-speedmaster.webp')), 13, 0, H.z1 + .05, 'n'); // the Speedmaster on it
  place(wall(H.x1 - H.x0, H.h, hallWall), H.x1, 0, H.z0, 's'); // the wall behind the camera
  // the showroom's right wall as seen from inside the showroom, with the same opening
  place(wall(S.z0 - S.z1, S.h, showWall, { x0: H.openZ0 - S.z1, x1: H.openZ1 - S.z1, y0: 0, y1: H.openH }), S.w / 2 + .02, 0, S.z1, 'w');
  // hanging light strips in the hall
  for (let i = 0; i < 5; i++) { const m = floor(.3, 20, strip, H.x0 + 5 + i * 5, H.h - 2.2, (H.z0 + H.z1) / 2); m.rotation.x = Math.PI / 2; }

  // ── The route: a keyframe per line (position, look-at point); `stop` marks a stop ──
  const EYE = 1.62;
  const PATH = [
    { pos: [0, 1.75, 17], look: [0, 3.2, 0], stop: true },
    { pos: [0, 1.68, 9], look: [0, 2.1, 0] },
    { pos: [0, EYE, 3.6], look: [0, 1.5, 0], stop: true },
    { pos: [0, EYE, -.4], look: [0, 1.55, -8] },
    { pos: [0, EYE, -3.6], look: [0, 1.55, -8], stop: true },
    { pos: [0, EYE, -7.9], look: [0, 1.45, -12] },
    { pos: [0, EYE, -10.7], look: [0, 1.4, -17], stop: true },
    { pos: [0, EYE, -14.2], look: [2.5, 1.55, -14.9] },
    { pos: [3.6, EYE, -14.9], look: [30, 3, -15.3] },
    { pos: [11, 1.7, -15.3], look: [30, 3.4, -15.3] },
    { pos: [19, 1.7, -15.3], look: [30, 3.8, -15.3], stop: true },
    { pos: [22, 1.7, -18.5], look: [19, 3.4, -30] },
    { pos: [19, 1.7, -21.5], look: [19, 3.4, -30], stop: true },
  ];
  const V = a => new THREE.Vector3(...a);
  const positionCurve = new THREE.CatmullRomCurve3(PATH.map(k => V(k.pos)), false, 'centripetal');
  const targetCurve = new THREE.CatmullRomCurve3(PATH.map(k => V(k.look)), false, 'centripetal');
  const segments = PATH.length - 1;
  const stopKeys = PATH.map((k, i) => (k.stop ? i : -1)).filter(i => i >= 0);
  const STOPS = stopKeys.length;
  // slows into each stop without ever quite stopping: a dwell, not a halt
  const dwell = t => .3 * t + .7 * smootherstep(t);
  const stopToKey = s => { const i = Math.min(Math.floor(s), STOPS - 2); const f = Math.min(1, s - i); return stopKeys[i] + (stopKeys[i + 1] - stopKeys[i]) * dwell(f); };
  const lookPoint = new THREE.Vector3();
  function placeCamera(s) {
    const t = clamp01(stopToKey(s) / segments);
    positionCurve.getPoint(t, camera.position);
    targetCurve.getPoint(t, lookPoint);
    camera.lookAt(lookPoint);
    // the doors swing open as the visitor reaches them
    const open1 = smootherstep(clamp01((s - 1.02) / .55)) * 1.62;
    entrance.forEach(({ hinge, side }) => { hinge.rotation.y = side * open1; });
    const open2 = smootherstep(clamp01((s - 2.02) / .55)) * 1.62;
    lobbyDoors.forEach(({ hinge, side }) => { hinge.rotation.y = side * open2; });
  }

  // ── Captions and dots ──
  let activeStage = -1;
  function showStage(index) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    if (index === activeStage) return;
    activeStage = index;
    story.dataset.activeStage = String(index);
    scenes.forEach((el, i) => el.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  // ── Scroll is the playhead: the camera glides toward it with a damped lag ──
  // The section is 70svh of scrolling per stop plus a 60svh hold at the end (styles.css).
  const HOLD = .6;
  let target = 0, current = 0, frame = 0, last = 0, running = false, shown = false;
  function readScroll() {
    const travel = story.offsetHeight - sticky.clientHeight * (1 + HOLD);
    const p = travel > 0 ? clamp01(-story.getBoundingClientRect().top / travel) : 0;
    target = p * (STOPS - 1);
  }
  function draw() {
    placeCamera(current);
    renderer.render(scene, camera);
    showStage(Math.floor(current + .4));
    if (!shown && pending === 0 && !failed) { shown = true; story.classList.add('is-walking'); }
  }
  function tick(now) {
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    readScroll();
    if (still.matches) current = target;
    else { current += (target - current) * (1 - Math.exp(-dt * 2.4)); if (Math.abs(target - current) < .002) current = target; }
    draw();
    if (current !== target || pending > 0) frame = requestAnimationFrame(tick); else running = false;
  }
  function wake() { if (!running) { running = true; last = performance.now(); frame = requestAnimationFrame(tick); } }
  function resize() {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 66 : 46;
    camera.updateProjectionMatrix();
    draw();
  }
  resize();
  readScroll();
  current = target;
  wake();
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', resize);
  // keep rendering while the photographs arrive, then only when the scroll moves
  const waitForPhotos = () => { if (pending > 0) { draw(); requestAnimationFrame(waitForPhotos); } else draw(); };
  waitForPhotos();
}
