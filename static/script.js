// Year
document.getElementById('year').textContent = new Date().getFullYear();

// CMYK loader — hide after first paint
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 800);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Shared by Home and the automatic Services card sequence.
const cardMotion = Object.freeze({ reveal: 1100, hold: 100, slide: 1100, gap: 100, easing: "cubic-bezier(.16,1,.3,1)" });

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

/* Homepage three-stage scroll story */
(function () {
  const story = document.querySelector('.home-story');
  if (!story) return;

  const scenes = [...story.querySelectorAll('[data-home-stage]')];
  const dots = [...story.querySelectorAll('.home-story__progress span')];
  const header = document.querySelector('.site-header');
  let activeStage = -1;
  let ticking = false;

  function showStage(index) {
    index = Math.max(0, Math.min(scenes.length - 1, index));
    if (index === activeStage) return;
    activeStage = index;
    story.dataset.activeStage = String(index);
    scenes.forEach((sceneEl, sceneIndex) => sceneEl.classList.toggle('is-active', sceneIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  }

  function updateStory() {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    showStage(Math.round(progress * (scenes.length - 1)));
    header?.classList.toggle('is-over-hero', rect.bottom > 68 && rect.top < 68);
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateStory);
  }

  showStage(0);
  updateStory();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);

})();

/* Liquid navigation indicator — shared by every page and mobile menu. */
(function () {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.nav-links');
  const toggle = header?.querySelector('.nav-toggle');
  if (!nav) return;

  const topLinks = [...nav.querySelectorAll(':scope > a, :scope > .has-dropdown > a')];
  const pagePath = new URL(window.location.href).pathname.replace(/index\.html$/, '');
  const matchingLink = [...nav.querySelectorAll('a')].find((link) => {
    const linkPath = new URL(link.href, window.location.href).pathname.replace(/index\.html$/, '');
    return linkPath === pagePath;
  });
  const activeLink = topLevelLink(nav.querySelector('a.current') || matchingLink || topLinks[0]);
  let navigationTimer;
  let targetTimer;

  function isMobile() {
    return window.matchMedia('(max-width: 1024px)').matches;
  }

  function topLevelLink(link) {
    return link.closest('.has-dropdown')?.querySelector(':scope > a') || link;
  }

  function positionIndicator(link, animate) {
    link = topLevelLink(link);
    if (!link || link.offsetParent === null) return;
    clearTimeout(targetTimer);
    nav.querySelectorAll('.nav-flow-target').forEach((item) => item.classList.remove('nav-flow-target'));
    if (animate && !reducedMotion) {
      targetTimer = setTimeout(() => link.classList.add('nav-flow-target'), 520);
    } else {
      link.classList.add('nav-flow-target');
    }
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    if (isMobile()) {
      nav.style.setProperty('--nav-flow-y', `${linkRect.top - navRect.top}px`);
      nav.style.setProperty('--nav-flow-h', `${linkRect.height}px`);
    } else {
      nav.style.setProperty('--nav-flow-x', `${linkRect.left - navRect.left}px`);
      nav.style.setProperty('--nav-flow-w', `${linkRect.width}px`);
    }

    nav.classList.add('nav-flow-ready');
    if (animate && !reducedMotion) {
      nav.classList.remove('is-flowing');
      void nav.offsetWidth;
      nav.classList.add('is-flowing');
    }
  }

  function syncIndicator() {
    requestAnimationFrame(() => positionIndicator(activeLink, false));
  }

  function setupDropdownIndicator(dropdown) {
    const dropdownLinks = [...dropdown.querySelectorAll(':scope > a')];
    let subTargetTimer;
    const matched = dropdownLinks.find((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname.replace(/index\.html$/, '');
      return linkPath === pagePath;
    });

    function positionDropdown(link, animate) {
      if (!link) return;
      clearTimeout(subTargetTimer);
      dropdownLinks.forEach((item) => item.classList.remove('sub-flow-target', 'sub-flow-pending'));
      if (animate && !reducedMotion) {
        link.classList.add('sub-flow-pending');
        subTargetTimer = setTimeout(() => {
          link.classList.remove('sub-flow-pending');
          link.classList.add('sub-flow-target');
        }, 400);
      } else {
        link.classList.add('sub-flow-target');
      }
      dropdown.style.setProperty('--sub-flow-y', `${link.offsetTop}px`);
      dropdown.style.setProperty('--sub-flow-h', `${link.offsetHeight}px`);
      dropdown.classList.add('sub-flow-ready');
      if (animate && !reducedMotion) {
        dropdown.classList.remove('is-sub-flowing');
        void dropdown.offsetWidth;
        dropdown.classList.add('is-sub-flowing');
      }
    }

    dropdownLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => positionDropdown(link, true));
      link.addEventListener('focus', () => positionDropdown(link, true));
      link.addEventListener('click', () => positionDropdown(link, true));
    });
    dropdown.addEventListener('mouseleave', () => {
      if (matched) {
        positionDropdown(matched, true);
      } else {
        clearTimeout(subTargetTimer);
        dropdownLinks.forEach((item) => item.classList.remove('sub-flow-target', 'sub-flow-pending'));
        dropdown.classList.remove('sub-flow-ready', 'is-sub-flowing');
      }
    });
    if (matched) requestAnimationFrame(() => positionDropdown(matched, false));
  }

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.href === window.location.href) return;
      event.preventDefault();
      clearTimeout(navigationTimer);
      positionIndicator(link, true);
      navigationTimer = setTimeout(() => { window.location.href = url.href; }, reducedMotion ? 0 : 1050);
    });
  });

  nav.querySelectorAll('.dropdown').forEach(setupDropdownIndicator);
  toggle?.addEventListener('click', syncIndicator);
  window.addEventListener('resize', syncIndicator);
  syncIndicator();
})();
/* Homepage continuing scroll chapters */
(function () {
  const overview = document.querySelector('[data-home-overview]');
  const products = document.querySelector('[data-home-products]');
  if (!overview && !products) return;

  const productCards = products ? [...products.querySelectorAll('[data-product-card]')] : [];
  const productCount = products?.querySelector('.home-products-story__count b');
  let activeProduct = -1;
  let ticking = false;

  function storyProgress(element) {
    const rect = element.getBoundingClientRect();
    const travel = Math.max(1, element.offsetHeight - window.innerHeight);
    return Math.max(0, Math.min(1, -rect.top / travel));
  }

  function updateOverview() {
    if (!overview) return;
    const progress = storyProgress(overview);
    const revealProgress = Math.min(1, progress / 0.38);
    const eased = 1 - Math.pow(1 - revealProgress, 3);
    overview.style.setProperty('--overview-progress', eased.toFixed(4));
    overview.style.setProperty('--overview-opacity', (0.18 + eased * 0.82).toFixed(4));
    overview.style.setProperty('--overview-y', `${((1 - eased) * 105).toFixed(2)}px`);
    overview.style.setProperty('--overview-copy-y', `${((1 - eased) * 120).toFixed(2)}px`);
    overview.style.setProperty('--overview-scale', (0.72 + eased * 0.28).toFixed(4));
    overview.style.setProperty('--overview-clip-y', `${((1 - eased) * 36).toFixed(2)}%`);
    overview.style.setProperty('--overview-clip-x', `${((1 - eased) * 13).toFixed(2)}%`);
    overview.style.setProperty('--overview-image-scale', (1.13 - eased * 0.13).toFixed(4));
    overview.style.setProperty('--overview-bar-width', `${(progress * 100).toFixed(2)}%`);
  }

  function showProduct(index, localProgress) {
    if (!productCards.length) return;
    activeProduct = index;
    const currentIsPlaced = localProgress >= 0.52 || (index === productCards.length - 1 && localProgress >= 0.46);
    productCards.forEach((card, cardIndex) => {
      const placed = cardIndex < index || (cardIndex === index && currentIsPlaced);
      const popping = cardIndex === index && !currentIsPlaced;
      card.classList.toggle('is-placed', placed);
      card.classList.toggle('is-popping', popping);
      card.classList.toggle('is-awaiting', cardIndex > index);
      card.classList.remove('is-before', 'is-active', 'is-after');
      card.setAttribute('aria-hidden', cardIndex > index ? 'true' : 'false');
    });
    if (productCount) productCount.textContent = String(index + 1).padStart(2, '0');
  }

  function updateProducts() {
    if (products?.dataset.gestureControlled === 'true') return;
    if (!products || !productCards.length) return;
    const progress = storyProgress(products);
    const sequence = Math.min(productCards.length - 0.0001, progress * productCards.length);
    const index = Math.min(productCards.length - 1, Math.floor(sequence));
    const localProgress = sequence - index;
    showProduct(index, localProgress);
  }

  function update() {
    updateOverview();
    updateProducts();
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  products?.style.setProperty('--product-count', productCards.length || 1);
  showProduct(0, 0);
  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
})();
/* Homepage story stages: one gesture slides, then lifts the stage at center. */
(function () {
  const staticLayout = matchMedia('(prefers-reduced-motion: reduce), (max-height: 540px), (max-width: 1024px) and (max-height: 600px)');
  document.querySelectorAll('[data-home-process], [data-home-quality]').forEach(story => {
    const scenes = [...story.querySelectorAll('.home-process-scene')];
    if (!scenes.length) return;
    const prefix = story.hasAttribute('data-home-quality') ? 'home-quality-story' : 'home-process-story';
    const sticky = story.querySelector('.' + prefix + '__sticky');
    const counter = story.querySelector('.' + prefix + '__count b');
    const bar = story.querySelector('.' + prefix + '__progress span');
    story.style.setProperty('--stage-count', scenes.length);
    let index = -1, busy = false, frame = 0, lastWheel = -Infinity;
    let touchY = null, touchConsumed = false;
    const ease = t => t * t * (3 - 2 * t);
    function pinned() {
      const rect = story.getBoundingClientRect();
      return !staticLayout.matches && rect.top <= 2 && rect.bottom >= sticky.offsetHeight - 2;
    }
    function position(next) {
      const rect = story.getBoundingClientRect();
      return scrollY + rect.top + (story.offsetHeight - sticky.offsetHeight) * ((next + .5) / scenes.length);
    }
    function paint(card, x, scale, lift, visible) {
      card.classList.toggle('is-rendered', visible);
      card.style.setProperty('--stage-x', x + 'px');
      card.style.setProperty('--stage-scale', scale);
      card.style.setProperty('--stage-lift', lift + 'px');
    }
    function resting() {
      scenes.forEach((card, i) => {
        paint(card, 0, 1.045, -8, staticLayout.matches || i === index);
        card.setAttribute('aria-hidden', String(!staticLayout.matches && i !== index));
      });
      if (counter) counter.textContent = String(Math.max(1, index + 1)).padStart(2, '0');
      if (bar) bar.style.width = ((index + 1) / scenes.length * 100) + '%';
    }
    function animate(next, direction, anchor = true) {
      const previous = index;
      index = next;
      busy = true;
      if (anchor) scrollTo({top: position(next), behavior: 'instant'});
      const started = performance.now();
      scenes.forEach((card, i) => card.setAttribute('aria-hidden', String(i !== next)));
      if (counter) counter.textContent = String(next + 1).padStart(2, '0');
      function tick(now) {
        const elapsed = now - started;
        const slide = ease(Math.min(1, elapsed / 780));
        const lift = ease(Math.max(0, Math.min(1, (elapsed - 780) / 360)));
        const distance = innerWidth;
        scenes.forEach((card, i) => {
          if (i === next) paint(card, direction * distance * (1 - slide), .94 + .105 * lift, -8 * lift, true);
          else if (i === previous) paint(card, -direction * distance * slide, 1.045 - .105 * slide, -8 * (1 - slide), slide < 1);
          else paint(card, 0, .94, 0, false);
        });
        if (bar) bar.style.width = ((previous + 1 + (next - previous) * Math.min(1, elapsed / 1140)) / scenes.length * 100) + '%';
        if (elapsed < 1140) frame = requestAnimationFrame(tick);
        else { busy = false; frame = 0; resting(); }
      }
      frame = requestAnimationFrame(tick);
    }
    function move(direction, event) {
      if (!pinned()) return false;
      if (busy) { event.preventDefault(); return true; }
      const next = index + direction;
      if (next < 0 || next >= scenes.length) return false;
      event.preventDefault();
      animate(next, direction);
      return true;
    }
    addEventListener('wheel', event => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 1 || !pinned()) return;
      const now = performance.now(), continuingGesture = now - lastWheel < 200;
      lastWheel = now;
      // Consume trackpad momentum until the gesture ends, including on the last stage.
      if (busy || continuingGesture) { event.preventDefault(); return; }
      move(event.deltaY > 0 ? 1 : -1, event);
    }, {passive: false});
    addEventListener('touchstart', event => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
      touchConsumed = false;
    }, {passive: true});
    addEventListener('touchmove', event => {
      if (touchY === null || event.touches.length !== 1 || !pinned()) return;
      if (touchConsumed || busy) { event.preventDefault(); return; }
      const delta = touchY - event.touches[0].clientY;
      if (Math.abs(delta) >= 18) touchConsumed = move(delta > 0 ? 1 : -1, event);
    }, {passive: false});
    addEventListener('touchend', () => { touchY = null; touchConsumed = false; }, {passive: true});
    addEventListener('keydown', event => {
      if (event.target.closest('input, textarea, select, button, a, [contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey) return;
      const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1
        : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
      if (direction) move(direction, event);
    });
    function sync() {
      if (staticLayout.matches) { resting(); return; }
      if (busy || !pinned()) return;
      const progress = -story.getBoundingClientRect().top / Math.max(1, story.offsetHeight - sticky.offsetHeight);
      const target = Math.max(0, Math.min(scenes.length - 1, Math.floor(progress * scenes.length)));
      if (target !== index) animate(target, index < 0 || target > index ? 1 : -1, false);
    }
    function reset() {
      cancelAnimationFrame(frame);
      busy = false;
      lastWheel = -Infinity;
      resting();
      sync();
    }
    scenes.forEach(card => {
      const img = card.querySelector('img');
      if (img) { img.loading = 'eager'; img.decoding = 'async'; }
    });
    resting();
    sync();
    addEventListener('scroll', sync, {passive: true});
    addEventListener('resize', reset);
    staticLayout.addEventListener('change', reset);
  });
})();
/* Homepage clients, news and contact scroll chapters */
(function(){
  const clients=document.querySelector('[data-home-clients]');
  const closing=document.querySelector('[data-home-closing]');
  const clientCards=clients?[...clients.querySelectorAll('[data-client-card]')]:[];
  const clientCount=clients?.querySelector('.home-clients-story__count b');
  const newsCards=closing?[...closing.querySelectorAll('[data-closing-card]')]:[];
  const closingBar=closing?.querySelector('.home-closing-story__progress span');
  let ticking=false;
  const progressOf=el=>{const r=el.getBoundingClientRect(),t=Math.max(1,el.offsetHeight-innerHeight);return Math.max(0,Math.min(1,-r.top/t))};
  function updateClients(){if(clients?.dataset.gestureControlled==='true')return;if(!clients||!clientCards.length)return;const p=progressOf(clients),s=Math.min(clientCards.length-.0001,p*clientCards.length),i=Math.floor(s),local=s-i,placed=local>=.52;clientCards.forEach((card,n)=>{card.classList.toggle('is-placed',n<i||(n===i&&placed));card.classList.toggle('is-popping',n===i&&!placed);card.setAttribute('aria-hidden',n>i?'true':'false')});if(clientCount)clientCount.textContent=String(i+1).padStart(2,'0')}
  function updateClosing(){if(closing?.dataset.gestureControlled==='true')return;if(!closing||!newsCards.length)return;const p=progressOf(closing),s=Math.min(newsCards.length-.0001,p*newsCards.length),i=Math.floor(s),local=s-i;newsCards.forEach((card,n)=>{card.classList.toggle('is-placed',n<i||(n===i&&local>=.52));card.classList.toggle('is-popping',n===i&&local<.52)});if(closingBar)closingBar.style.width=`${(p*100).toFixed(2)}%`}  function update(){updateClients();updateClosing();ticking=false}function request(){if(ticking)return;ticking=true;requestAnimationFrame(update)}
  clients?.style.setProperty('--client-count',clientCards.length||1);closing?.style.setProperty('--closing-count',newsCards.length||1);update();addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
})();
/* Standalone contact scroll reveal */
(function(){const story=document.querySelector('[data-home-contact]');if(!story)return;let ticking=false;function update(){const rect=story.getBoundingClientRect(),travel=Math.max(1,story.offsetHeight-innerHeight),p=Math.max(0,Math.min(1,-rect.top/travel)),e=1-Math.pow(1-p,3);story.style.setProperty('--contact-opacity',e.toFixed(3));story.style.setProperty('--contact-scale',(.78+e*.22).toFixed(3));ticking=false}function request(){if(ticking)return;ticking=true;requestAnimationFrame(update)}update();addEventListener('scroll',request,{passive:true});addEventListener('resize',request)})();
/* One gesture owns one complete Product, Client, or News animation. */
(function(){
  if(reducedMotion)return;
  function setup(selector,itemSelector,countSelector,timing={pop:280,total:820}){
    const story=document.querySelector(selector);if(!story)return;
    const items=[...story.querySelectorAll(itemSelector)];if(!items.length)return;
    story.dataset.gestureControlled='true';
    let index=-1,busy=false,touchStart=null,touchConsumed=false,finishTimer,releaseTimer;
    const counter=story.querySelector(countSelector);
    items.forEach(item=>{item.classList.remove('is-popping','is-placed');item.setAttribute('aria-hidden','true')});
    const compactLayout=matchMedia("(max-width: 1024px) and (max-height: 600px)");
    function syncLayout(){clearTimeout(finishTimer);clearTimeout(releaseTimer);busy=false;index=-1;items.forEach(item=>{item.classList.remove("is-placed","is-popping");item.setAttribute("aria-hidden",compactLayout.matches?"false":"true")})}
    compactLayout.addEventListener("change",syncLayout);syncLayout();
    function pinned(){if(compactLayout.matches)return false;const rect=story.getBoundingClientRect();return rect.top<=2&&rect.bottom>=innerHeight-2}
    function finalScrollPosition(next){const rect=story.getBoundingClientRect(),travel=Math.max(1,story.offsetHeight-innerHeight),top=scrollY+rect.top;return top+travel*((next+1)/(items.length+1))}
    function renderBefore(next){items.forEach((item,n)=>{item.classList.toggle('is-placed',n<next);item.classList.toggle('is-popping',n===next);item.setAttribute('aria-hidden',n<=next?'false':'true')})}
    function animate(next){
      if(busy||next<0||next>=items.length)return false;
      busy=true;index=next;clearTimeout(finishTimer);clearTimeout(releaseTimer);
      renderBefore(next);
      if(counter)counter.textContent=String(next+1).padStart(2,'0');
      finishTimer=setTimeout(()=>{
        items[next].classList.remove('is-popping');
        items[next].classList.add('is-placed');
        scrollTo({top:finalScrollPosition(next),behavior:'smooth'});
      },timing.pop);
      releaseTimer=setTimeout(()=>{busy=false},timing.total);
      return true;
    }
    function move(direction,event){
      if(!pinned())return false;
      if(busy){event?.preventDefault();return true}
      const next=index+direction;
      if(next<0||next>=items.length)return false;
      event?.preventDefault();return animate(next);
    }
    addEventListener('wheel',event=>{if(!pinned()||Math.abs(event.deltaY)<1)return;move(event.deltaY>0?1:-1,event)},{passive:false});
    addEventListener('touchstart',event=>{touchStart=event.touches[0]?.clientY??null;touchConsumed=false},{passive:true});
    addEventListener('touchmove',event=>{
      if(touchStart===null||!pinned())return;
      const y=event.touches[0]?.clientY??touchStart,delta=touchStart-y;
      if(!delta)return;
      const direction=delta>0?1:-1,next=index+direction;
      if(next>=0&&next<items.length)event.preventDefault();
      if(touchConsumed||Math.abs(delta)<18)return;
      if(move(direction,event))touchConsumed=true;
    },{passive:false});
    addEventListener('touchend',()=>{touchStart=null;touchConsumed=false},{passive:true});
    // Safety net: a fast flick releases before any touchmove fires again, so momentum can
    // carry the page through the whole section with nothing popped. Once the scroll settles
    // somewhere pinned with no active touch, sync the cards to match where it landed.
    function progress(){const rect=story.getBoundingClientRect(),travel=Math.max(1,story.offsetHeight-innerHeight);return Math.max(0,Math.min(1,-rect.top/travel))}
    function catchUp(){
      if(busy||touchStart!==null||!pinned())return;
      const target=Math.max(-1,Math.min(items.length-1,Math.round(progress()*(items.length+1))-1));
      if(target===index)return;
      if(Math.abs(target-index)<=1){move(target>index?1:-1);return}
      index=target;
      items.forEach((item,n)=>{item.classList.toggle('is-placed',n<=target);item.classList.remove('is-popping');item.setAttribute('aria-hidden',n<=target?'false':'true')});
      if(counter&&target>=0)counter.textContent=String(target+1).padStart(2,'0');
    }
    let catchUpTimer;
    addEventListener('scroll',()=>{clearTimeout(catchUpTimer);catchUpTimer=setTimeout(catchUp,140)},{passive:true});
  }
  const accumulationTiming={pop:cardMotion.reveal+cardMotion.hold,total:cardMotion.reveal+cardMotion.hold+cardMotion.slide+cardMotion.gap};
  setup('[data-home-products]','[data-product-card]','.home-products-story__count b',accumulationTiming);
  setup('[data-home-clients]','[data-client-card]','.home-clients-story__count b',accumulationTiming);
  setup('[data-home-closing]','[data-closing-card]',null,accumulationTiming);
})();