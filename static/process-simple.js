// Scroll-linked carton that travels between scenes. Scroll position is the playhead:
// scrolling back reverses every fold and every move.
(() => {
  const root = document.querySelector('.process-assembly');
  const stage = root?.querySelector('.assembly-stage');
  const scene = stage?.querySelector('.proc-box__scene');
  if (!scene) return;
  const rail = root.querySelector('.assembly-sticky');
  const scenes = [...root.querySelectorAll('.process-scene')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const label = root.querySelector('.assembly-state');
  const meter = root.querySelector('.assembly-meter span');
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a,b,t) => a + (b-a)*t;
  const smooth = t => t*t*(3-2*t);
  const states = [
    { label: 'A flat sheet of board', print: 0, cut: 0, sides: 0, flaps: 0, view: 0 },
    { label: 'The artwork is prepared', print: .35, cut: .25, sides: 0, flaps: 0, view: .1 },
    { label: 'Ready for the printing press', print: .35, cut: .25, sides: 0, flaps: 0, view: .15 },
    { label: 'Colour comes to life', print: 1, cut: .25, sides: 0, flaps: 0, view: .25 },
    { label: 'The printed sheet is coated', print: 1, cut: .25, sides: 0, flaps: 0, view: .3 },
    { label: 'Cut and creased to shape', print: 1, cut: 1, sides: 0, flaps: 0, view: .4 },
    { label: 'The carton blank is separated', print: 1, cut: 1, sides: 0, flaps: 0, view: .5 },
    { label: 'Checked before folding', print: 1, cut: 1, sides: 0, flaps: 0, view: .6 },
    { label: 'Sides fold and join', print: 1, cut: 1, sides: 1, flaps: .15, view: 1 },
    { label: 'A complete carton', print: 1, cut: 0, sides: 1, flaps: 1, view: 1 }
  ];
  const stepIndex = { artwork: 1, ready: 2, print: 3, coating: 4, cutting: 5, breaking: 6, sorting: 7, pasting: 8, delivery: 9 };
  const boxPos = { left: 0, center: .5, right: 1 };
  const targets = scenes.map(el => stepIndex[el.dataset.step] ?? states.length-1);
  // Scenes sharing a step ease toward it together, starting from the flat sheet.
  const sceneStates = targets.map((target, i) => {
    let first = i, end = i;
    while (first > 0 && targets[first-1] === target) first--;
    while (end < targets.length-1 && targets[end+1] === target) end++;
    const from = states[first > 0 ? targets[first-1] : 0], to = states[target];
    const f = (i - first + 1) / (end - first + 1);
    const state = { label: to.label, box: boxPos[scenes[i].dataset.box] ?? .5 };
    for (const key of ['print','cut','sides','flaps','view']) state[key] = mix(from[key], to[key], f);
    return state;
  });
  const last = sceneStates.length-1;
  let queued = 0;
  function paint() {
    queued = 0;
    const inset = innerWidth <= 900 ? 85 : 100;
    const stops = scenes.map(el => scrollY + el.getBoundingClientRect().top - inset);
    let index = 0;
    while (index < last && scrollY >= stops[index+1]) index++;
    let t = index === last ? 0 : clamp((scrollY-stops[index])/Math.max(1,stops[index+1]-stops[index]));
    if (reduced.matches) t = 0;
    const ease = smooth(t);
    const a = sceneStates[index], b = sceneStates[Math.min(index+1,last)];
    const value = key => mix(a[key], b[key], ease);
    scene.style.setProperty('--intro', '1');
    scene.style.setProperty('--print', value('print'));
    scene.style.setProperty('--cut', value('cut'));
    scene.style.setProperty('--foldA', value('sides'));
    scene.style.setProperty('--foldB', value('flaps'));
    scene.style.setProperty('--view', value('view'));
    // The carton travels in the middle of the hand-over, so it settles before the next scene lands.
    rail.style.setProperty('--box-pos', mix(a.box, b.box, smooth(clamp((t-.12)/.76))));
    const flat = Math.min((stage.clientWidth-28)/550, (stage.clientHeight-16)/460);
    const folded = Math.min((stage.clientWidth-40)/300, (stage.clientHeight-20)/360);
    scene.style.setProperty('--box-scale', mix(flat,folded,value('sides')));
    label.textContent = (t>.6?b:a).label;
    meter.style.transform = 'scaleX(' + ((index+t)/last) + ')';
    root.dataset.assemblyStage = String(index);
  }
  function schedule() { if (!queued) queued = requestAnimationFrame(paint); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(root);
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      if (intersectionRatio >= .3) target.classList.add('is-visible');
      else if (!isIntersecting) target.classList.remove('is-visible');
    }), { threshold: [0, .3] });
    scenes.forEach(el => reveal.observe(el));
    const zoom = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
      target.style.animationPlayState = isIntersecting ? 'running' : 'paused';
    }));
    root.querySelectorAll('.process-photo-frame img').forEach(img => zoom.observe(img));
    document.body.classList.add('story-motion-ready');
  }
  schedule();
})();
