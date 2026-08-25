// Year
document.getElementById('year').textContent = new Date().getFullYear();

// CMYK loader — hide after first paint
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 800);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav — hamburger toggle
(function () {
  const header = document.querySelector('.site-header');
  const toggle = header && header.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  header.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================================
   Home photo marquee — a rightward conveyor of photos that are
   small at the left edge and full size at the right.

   Each item is placed by hand rather than by flex: its scale comes
   from where it sits across the viewport, and the next item starts
   right after the *scaled* width of the previous one, so the gap
   stays constant while the photos grow. Items that run off the right
   are recycled to the head of the queue, which makes the loop endless
   without duplicating any markup.
   ============================================================ */
(function () {
  const marquee = document.querySelector('.photo-marquee');
  if (!marquee) return;
  const track = marquee.querySelector('.photo-marquee__track');
  const items = [].slice.call(track.children);
  if (!items.length) return;

  const MIN = 0.36;   // scale at the left edge
  const MAX = 1;      // scale at the right edge
  const CURVE = 0.55; // <1 grows quickly on the left, then eases out
  const SPEED = 58;   // px per second

  // scale for an item whose left edge sits at x
  const px = (v) => parseFloat(getComputedStyle(marquee).getPropertyValue(v)) || 0;
  let widths = [];  // unscaled width of each item
  let gap = 22;
  let vw = 0;

  const measure = () => {
    gap = px('--pm-gap');
    vw = marquee.clientWidth;
    // width/height attributes on the <img> give the right box even
    // before the photo itself has downloaded
    widths = items.map((el) => el.offsetWidth);
  };

  const scaleAt = (x, w) => {
    // two passes: guess from the left edge, refine using the centre
    let s = MIN;
    for (let k = 0; k < 2; k++) {
      let t = (x + (w * s) / 2) / vw;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      s = MIN + (MAX - MIN) * Math.pow(t, CURVE);
    }
    return s;
  };

  // order[0] is the leftmost photo; head is its left edge, in px
  let order = items.map((_, i) => i);
  let head = 0;
  let last = 0;
  let running = false;
  let paused = false;

  const layout = () => {
    // recycle: photo that has left the right-hand end comes back at the front
    let guard = items.length * 2;
    while (head > 0 && guard--) {
      order.unshift(order.pop());
      head -= widths[order[0]] * MIN + gap;
    }
    guard = items.length * 2;
    while (head + widths[order[0]] * MIN + gap < 0 && guard--) {
      head += widths[order[0]] * MIN + gap;
      order.push(order.shift());
    }

    let x = head;
    for (let k = 0; k < order.length; k++) {
      const i = order[k];
      const w = widths[i];
      const s = scaleAt(x, w);
      items[i].style.transform =
        'translate3d(' + x.toFixed(1) + 'px,0,0) scale(' + s.toFixed(4) + ')';
      x += w * s + gap;
    }
  };

  const frame = (now) => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!paused) head += SPEED * dt;
    layout();
    requestAnimationFrame(frame);
  };

  measure(); // widths come from the plain flex row, before we take over
  marquee.classList.add('photo-marquee--live');
  layout();

  if (reducedMotion) return; // photos stay where they are, no conveyor

  marquee.addEventListener('mouseenter', () => { paused = true; });
  marquee.addEventListener('mouseleave', () => { paused = false; });
  window.addEventListener('resize', () => { measure(); layout(); });

  // only animate while the strip is actually on screen
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !running) {
        running = true; last = 0; requestAnimationFrame(frame);
      } else if (!e.isIntersecting) {
        running = false;
      }
    });
  }).observe(marquee);

  // photos are lazy so the page stays light; warm them in the background
  // in queue order so none of them pops in blank as it scrolls on
  window.addEventListener('load', () => {
    items.forEach((el, k) => setTimeout(() => {
      const img = el.querySelector('img');
      if (img && !img.complete) new Image().src = img.src;
    }, k * 200));
  });
})();

/* ============================================================
   Scroll story: paper → print → die-cut → folded carton
   ============================================================ */
const scrolly = document.getElementById('story');
const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const landing = document.getElementById('landing');
const printHead = document.getElementById('printHead');
const captions = [...document.querySelectorAll('.caption')];
const dots = [...document.querySelectorAll('.dots span')];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const norm = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
// ease for the fold so panels settle gently
const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function setVars(p) {
  const intro = norm(p, 0.02, 0.14);
  const print = norm(p, 0.17, 0.45);
  const cut   = norm(p, 0.49, 0.64);
  const waste = norm(p, 0.64, 0.72);
  const fold  = norm(p, 0.74, 0.95);
  const foldA = easeInOut(norm(fold, 0, 0.6));
  const foldB = easeInOut(norm(fold, 0.45, 1));
  const view  = easeInOut(norm(p, 0.72, 0.98));

  stage.style.setProperty('--intro', intro);
  stage.style.setProperty('--print', print);
  stage.style.setProperty('--cut', cut);
  stage.style.setProperty('--waste', waste);
  stage.style.setProperty('--foldA', foldA);
  stage.style.setProperty('--foldB', foldB);
  stage.style.setProperty('--view', view);

  // landing headline fades out as the story starts
  const landingOut = norm(p, 0.01, 0.08);
  landing.style.opacity = 1 - landingOut;
  landing.style.transform = `translateY(${landingOut * -40}px)`;
  landing.style.visibility = landingOut >= 1 ? 'hidden' : 'visible';

  // print head only visible mid-pass
  printHead.classList.toggle('on', print > 0 && print < 1);

  // captions + dots
  let step = -1;
  if (p > 0.06 && p <= 0.17) step = 0;
  else if (p > 0.17 && p <= 0.49) step = 1;
  else if (p > 0.49 && p <= 0.74) step = 2;
  else if (p > 0.74) step = 3;
  captions.forEach((c) => c.classList.toggle('active', +c.dataset.step === step));
  dots.forEach((d) => d.classList.toggle('active', +d.dataset.step === step));
}

if (!reducedMotion && scrolly) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const total = scrolly.offsetHeight - window.innerHeight;
      const p = clamp(-scrolly.getBoundingClientRect().top / total, 0, 1);
      setVars(p);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
} else if (scrolly) {
  // reduced motion: show the finished state, all captions visible via CSS
  landing.style.opacity = 1;
  printHead.classList.remove('on');
}

// Scale the 700x460 scene down on small screens
function fitScene() {
  if (!scene) return;
  const s = Math.min(1, (window.innerWidth - 32) / 700, (window.innerHeight - 220) / 460);
  scene.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fitScene);
fitScene();

/* ============================================================
   Generic niceties
   ============================================================ */
// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Assign photos to .media placeholders based on their caption label
(function () {
  var map = [
    ['tablet', 'images/p-tablet.jpg'],
    ['syrup', 'images/p-syrup.jpg'],
    ['blister', 'images/p-blister.jpg'],
    ['ointment', 'images/p-ointment.jpg'],
    ['vial', 'images/p-vial.jpg'],
    ['ampoule', 'images/p-vial.jpg'],
    ['leaflet', 'images/p-leaflet.jpg'],
    ['insert', 'images/p-leaflet.jpg'],
    ['die-cut', 'images/diecutting.jpg'],
    ['folder-gluer', 'images/foldergluer.jpg'],
    ['pressroom', 'images/pressroom.jpg'],
    ['press', 'images/pressroom.jpg'],
    ['finished cartons', 'images/cartons.jpg'],
    ['carton', 'images/cartons.jpg'],
    ['factory', 'images/factory.jpg'],
    ['building', 'images/factory.jpg'],
    ['quality', 'images/quality.jpg'],
    ['inspection', 'images/quality.jpg'],
    ['team', 'images/team.jpg'],
    ['floor', 'images/team.jpg']
  ];
  document.querySelectorAll('.media').forEach(function (m) {
    var chip = m.querySelector('.media__chip');
    if (!chip) return;
    var t = chip.textContent.toLowerCase();
    for (var i = 0; i < map.length; i++) {
      if (t.indexOf(map[i][0]) > -1) {
        m.style.backgroundImage = "url('" + map[i][1] + "')";
        m.classList.add('media--has-photo');
        chip.textContent = chip.textContent.replace('📷', '').trim();
        break;
      }
    }
  });
})();

// Animated stat counters
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));
