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
  // Carton: plate is the blue CTP coating, red the printed colour theme.
  // From the paperboard scene to die-cutting the carton sits on a printed sheet (sheet): it starts blank,
  // ink prints it in black only (mono), red brings the colour, scan is the green inspection light,
  // uv the full gloss and spot the raised texture; at die-cutting the sheet falls away around the cut.
  const base = { print: 1, plate: 0, red: 1, cut: .25, sides: 0, flaps: 0, view: .3, sheet: 0, blank: 0, mono: 0, ink: 1, scan: 1, uv: 1, spot: 1 };
  const before = { red: 0, ink: 0, scan: 0, uv: 0, spot: 0 };
  const onSheet = { sheet: 1, cut: 0, view: 0 };
  const states = [
    { ...base, ...before, label: 'A flat sheet of board', print: 0, cut: 0, view: 0 },
    { ...base, ...before, label: 'The artwork is prepared', print: .35, view: .1 },
    { ...base, ...before, label: 'Imaged onto a blue plate', print: .35, plate: 1, view: .12 },
    { ...base, ...before, label: 'Cleaned, the image appears', view: .14 },
    { ...base, ...before, ...onSheet, label: 'A clean sheet of board', print: 0, blank: 1 },
    { ...base, ...before, ...onSheet, label: 'Printed in black', blank: 1, mono: 1, ink: 1 },
    { ...base, ...before, ...onSheet, label: 'Colour comes to life', ink: 1, red: 1 },
    { ...base, ...before, ...onSheet, label: 'Every colour is checked', ink: 1, red: 1, scan: 1 },
    { ...base, ...onSheet, label: 'A full UV gloss', spot: 0 },
    { ...base, ...onSheet, label: 'Spot UV texture and shine' },
    { ...base, label: 'Die-cut from the sheet', cut: 1, view: .15 },
    { ...base, label: 'The carton blank is separated', cut: 1, view: .5 },
    { ...base, label: 'Checked before folding', cut: 1, view: .6 },
    { ...base, label: 'Sides fold and join', cut: 1, sides: 1, flaps: .15, view: 1 },
    { ...base, label: 'A complete carton', cut: 0, sides: 1, flaps: 1, view: 1 }
  ];
  const stepIndex = { artwork: 1, plate: 2, clean: 3, ready: 4, sheet: 5, colour: 6, measure: 7, uv: 8, spot: 9, cutting: 10, breaking: 11, sorting: 12, pasting: 13, delivery: 14 };
  const eased = ['print','plate','cut','sides','flaps','view'];
  const landed = ['red','sheet','blank','mono','ink','scan','uv','spot']; // these arrive fully on the first scene of their step
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
    for (const key of eased) state[key] = mix(from[key], to[key], f);
    for (const key of landed) state[key] = to[key];
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
    scene.style.setProperty('--plate', value('plate'));
    scene.style.setProperty('--red', value('red'));
    for (const key of ['sheet','blank','mono','ink','scan','uv','spot']) stage.style.setProperty('--' + key, value(key));
    scene.style.setProperty('--cut', value('cut'));
    scene.style.setProperty('--foldA', value('sides'));
    scene.style.setProperty('--foldB', value('flaps'));
    scene.style.setProperty('--view', value('view'));
    // The carton travels in the middle of the hand-over, so it settles before the next scene lands.
    rail.style.setProperty('--box-pos', mix(a.box, b.box, smooth(clamp((t-.12)/.76))));
    let flat = Math.min((stage.clientWidth-28)/550, (stage.clientHeight-16)/460);
    // In the phone and tablet bar there is no gutter to spill into, so the sheet (662 × 528) must fit inside it.
    if (innerWidth <= 900) flat = mix(flat, Math.min(flat, (stage.clientWidth-6)/662, (stage.clientHeight-6)/528), value('sheet'));
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
