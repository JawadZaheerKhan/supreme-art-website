// Year
document.getElementById('year').textContent = new Date().getFullYear();

// CMYK loader — hide after first paint
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 800);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Menu panel — the header button opens the full-width nav
(function () {
  const header = document.querySelector('.site-header');
  const btn = header && header.querySelector('.menu-btn');
  if (!btn) return;
  const panel = header.querySelector('.menu-panel');

  const setOpen = (open) => {
    header.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // stop the page scrolling behind the open panel
    document.body.style.overflow = open ? 'hidden' : '';
  };
  const isOpen = () => header.classList.contains('menu-open');

  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!isOpen()); });
  // a link takes you somewhere, so close on the way out
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false); });
  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
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
