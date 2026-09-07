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
    return window.matchMedia('(max-width: 780px)').matches;
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
/* Homepage process tunnel scroll chapter */
(function () {
  const story = document.querySelector('[data-home-process]');
  if (!story) return;

  const scenes = [...story.querySelectorAll('[data-process-card]')];
  const count = story.querySelector('.home-process-story__count b');
  const bar = story.querySelector('.home-process-story__progress span');
  let ticking = false;
  let wheelLocked = false;
  let wheelLockStarted = 0;
  let wheelUnlockTimer;

  function updateProcessStory() {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    const sequence = Math.min(scenes.length - 1, progress * (scenes.length - 1));
    const index = Math.min(scenes.length - 1, Math.floor(sequence));
    const local = index === scenes.length - 1 ? 0 : sequence - index;
    const maxScale = window.matchMedia('(max-width: 780px)').matches ? 1.72 : 2.18;

    scenes.forEach((scene, sceneIndex) => {
      const rendered = sceneIndex === index || sceneIndex === index + 1;
      scene.classList.toggle('is-rendered', rendered);
      if (!rendered) {
        scene.setAttribute('aria-hidden', 'true');
        return;
      }
      let scale = .58;
      let opacity = 0;
      let zIndex = 0;
      let copyOpacity = 0;
      let copyY = 34;

      if (sceneIndex === index) {
        scale = 1 + local * (maxScale - 1);
        opacity = 1 - Math.max(0, (local - .62) / .38);
        zIndex = 3;
        copyOpacity = 1 - Math.max(0, (local - .36) / .34);
        copyY = -local * 42;
      } else if (sceneIndex === index + 1) {
        const arrive = 1 - Math.pow(1 - local, 3);
        scale = .58 + arrive * .42;
        opacity = Math.min(1, local * 1.7);
        zIndex = 2;
        copyOpacity = Math.max(0, (local - .55) / .34);
        copyY = (1 - local) * 42;
      }

      scene.style.setProperty('--process-scale', scale.toFixed(4));
      scene.style.setProperty('--process-opacity', opacity.toFixed(4));
      scene.style.setProperty('--process-copy-opacity', Math.min(1, copyOpacity).toFixed(4));
      scene.style.setProperty('--process-copy-y', `${copyY.toFixed(2)}px`);
      scene.style.zIndex = String(zIndex);
      scene.setAttribute('aria-hidden', sceneIndex === index || sceneIndex === index + 1 ? 'false' : 'true');
    });

    if (count) count.textContent = String(index + 1).padStart(2, '0');
    if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
    ticking = false;
  }

  function requestProcessUpdate() {
    const rect = story.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProcessStory);
  }

  function processStep() {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    return Math.round(progress * (scenes.length - 1));
  }

  function scrollToProcessStep(step) {
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const top = window.scrollY + story.getBoundingClientRect().top;
    window.scrollTo({ top: top + travel * (step / (scenes.length - 1)), behavior: 'smooth' });
  }

  function scheduleWheelUnlock() {
    window.clearTimeout(wheelUnlockTimer);
    const remaining = Math.max(180, 700 - (performance.now() - wheelLockStarted));
    wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, remaining);
  }

  story.addEventListener('wheel', (event) => {
    if (reducedMotion || Math.abs(event.deltaY) < 1) return;
    if (wheelLocked) {
      event.preventDefault();
      scheduleWheelUnlock();
      return;
    }
    const rect = story.getBoundingClientRect();
    const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    if (!pinned) return;
    const current = processStep();
    const direction = event.deltaY > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(scenes.length - 1, current + direction));
    if (next === current) return;
    event.preventDefault();
    wheelLocked = true;
    wheelLockStarted = performance.now();
    scrollToProcessStep(next);
    scheduleWheelUnlock();
  }, { passive: false });

  story.style.setProperty('--process-count', scenes.length || 1);
  updateProcessStory();
  window.addEventListener('scroll', requestProcessUpdate, { passive: true });
  window.addEventListener('resize', requestProcessUpdate);
})();
/* Homepage quality tunnel scroll chapter */
(function () {
  const story = document.querySelector('[data-home-quality]');
  if (!story) return;

  const scenes = [...story.querySelectorAll('[data-quality-card]')];
  const count = story.querySelector('.home-quality-story__count b');
  const bar = story.querySelector('.home-quality-story__progress span');
  let ticking = false;
  let wheelLocked = false;
  let wheelLockStarted = 0;
  let wheelUnlockTimer;

  function storyPosition() {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    return { progress, travel };
  }

  function updateQualityStory() {
    const { progress } = storyPosition();
    const sequence = Math.min(scenes.length - 1, progress * (scenes.length - 1));
    const index = Math.min(scenes.length - 1, Math.floor(sequence));
    const local = index === scenes.length - 1 ? 0 : sequence - index;
    const maxScale = window.matchMedia('(max-width: 780px)').matches ? 1.72 : 2.18;

    scenes.forEach((scene, sceneIndex) => {
      const rendered = sceneIndex === index || sceneIndex === index + 1;
      scene.classList.toggle('is-rendered', rendered);
      if (!rendered) {
        scene.setAttribute('aria-hidden', 'true');
        return;
      }
      let scale = .58;
      let opacity = 0;
      let zIndex = 0;
      let copyOpacity = 0;
      let copyY = 34;
      if (sceneIndex === index) {
        scale = 1 + local * (maxScale - 1);
        opacity = 1 - Math.max(0, (local - .62) / .38);
        zIndex = 3;
        copyOpacity = 1 - Math.max(0, (local - .36) / .34);
        copyY = -local * 42;
      } else if (sceneIndex === index + 1) {
        const arrive = 1 - Math.pow(1 - local, 3);
        scale = .58 + arrive * .42;
        opacity = Math.min(1, local * 1.7);
        zIndex = 2;
        copyOpacity = Math.max(0, (local - .55) / .34);
        copyY = (1 - local) * 42;
      }
      scene.style.setProperty('--process-scale', scale.toFixed(4));
      scene.style.setProperty('--process-opacity', opacity.toFixed(4));
      scene.style.setProperty('--process-copy-opacity', Math.min(1, copyOpacity).toFixed(4));
      scene.style.setProperty('--process-copy-y', `${copyY.toFixed(2)}px`);
      scene.style.zIndex = String(zIndex);
      scene.setAttribute('aria-hidden', sceneIndex === index || sceneIndex === index + 1 ? 'false' : 'true');
    });
    if (count) count.textContent = String(index + 1).padStart(2, '0');
    if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
    ticking = false;
  }

  function requestQualityUpdate() {
    const rect = story.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateQualityStory);
  }

  function scheduleWheelUnlock() {
    window.clearTimeout(wheelUnlockTimer);
    const remaining = Math.max(180, 700 - (performance.now() - wheelLockStarted));
    wheelUnlockTimer = window.setTimeout(() => { wheelLocked = false; }, remaining);
  }

  story.addEventListener('wheel', (event) => {
    if (reducedMotion || Math.abs(event.deltaY) < 1) return;
    if (wheelLocked) {
      event.preventDefault();
      scheduleWheelUnlock();
      return;
    }
    const rect = story.getBoundingClientRect();
    if (!(rect.top <= 1 && rect.bottom >= window.innerHeight - 1)) return;
    const { progress, travel } = storyPosition();
    const current = Math.round(progress * (scenes.length - 1));
    const direction = event.deltaY > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(scenes.length - 1, current + direction));
    if (next === current) return;
    event.preventDefault();
    wheelLocked = true;
    wheelLockStarted = performance.now();
    const top = window.scrollY + rect.top;
    window.scrollTo({ top: top + travel * (next / (scenes.length - 1)), behavior: 'smooth' });
    scheduleWheelUnlock();
  }, { passive: false });

  story.style.setProperty('--quality-count', scenes.length || 1);
  updateQualityStory();
  window.addEventListener('scroll', requestQualityUpdate, { passive: true });
  window.addEventListener('resize', requestQualityUpdate);
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
  function updateClients(){if(!clients||!clientCards.length)return;const p=progressOf(clients),s=Math.min(clientCards.length-.0001,p*clientCards.length),i=Math.floor(s),local=s-i,placed=local>=.52;clientCards.forEach((card,n)=>{card.classList.toggle('is-placed',n<i||(n===i&&placed));card.classList.toggle('is-popping',n===i&&!placed);card.setAttribute('aria-hidden',n>i?'true':'false')});if(clientCount)clientCount.textContent=String(i+1).padStart(2,'0')}
  function updateClosing(){if(!closing||!newsCards.length)return;const p=progressOf(closing),s=Math.min(newsCards.length-.0001,p*newsCards.length),i=Math.floor(s),local=s-i;newsCards.forEach((card,n)=>{card.classList.toggle('is-placed',n<i||(n===i&&local>=.52));card.classList.toggle('is-popping',n===i&&local<.52)});if(closingBar)closingBar.style.width=`${(p*100).toFixed(2)}%`}  function update(){updateClients();updateClosing();ticking=false}function request(){if(ticking)return;ticking=true;requestAnimationFrame(update)}
  clients?.style.setProperty('--client-count',clientCards.length||1);closing?.style.setProperty('--closing-count',newsCards.length||1);update();addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
})();
/* Standalone contact scroll reveal */
(function(){const story=document.querySelector('[data-home-contact]');if(!story)return;let ticking=false;function update(){const rect=story.getBoundingClientRect(),travel=Math.max(1,story.offsetHeight-innerHeight),p=Math.max(0,Math.min(1,-rect.top/travel)),e=1-Math.pow(1-p,3);story.style.setProperty('--contact-opacity',e.toFixed(3));story.style.setProperty('--contact-scale',(.78+e*.22).toFixed(3));ticking=false}function request(){if(ticking)return;ticking=true;requestAnimationFrame(update)}update();addEventListener('scroll',request,{passive:true});addEventListener('resize',request)})();