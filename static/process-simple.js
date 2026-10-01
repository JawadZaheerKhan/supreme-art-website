// Scroll-linked assembly with a sticky, reserved visual column.
// The scroll position is the playhead: backwards scrolling reverses every fold.
(() => {
  const root = document.querySelector('.process-assembly');
  const stage = root?.querySelector('.assembly-stage');
  const scene = stage?.querySelector('.proc-box__scene');
  if (!scene) return;
  const stages = [...root.querySelectorAll('.prepress-panel, .process-photo-row')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const label = root.querySelector('.assembly-state');
  const meter = root.querySelector('.assembly-meter span');
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a,b,t) => a + (b-a)*t;
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
  let queued = 0;
  function paint() {
    queued = 0;
    const inset = innerWidth <= 900 ? 85 : 100;
    const stops = stages.map(el => scrollY + el.getBoundingClientRect().top - inset);
    let index = 0;
    while (index < stops.length-1 && scrollY >= stops[index+1]) index++;
    let t = index === stops.length-1 ? 0 : clamp((scrollY-stops[index])/Math.max(1,stops[index+1]-stops[index]));
    if (reduced.matches) t = 0;
    const ease = t*t*(3-2*t);
    const a = states[Math.min(index,states.length-1)], b = states[Math.min(index+1,states.length-1)];
    const value = key => mix(a[key], b[key], ease);
    scene.style.setProperty('--intro', '1');
    scene.style.setProperty('--print', value('print'));
    scene.style.setProperty('--cut', value('cut'));
    scene.style.setProperty('--foldA', value('sides'));
    scene.style.setProperty('--foldB', value('flaps'));
    scene.style.setProperty('--view', value('view'));
    const flat = Math.min((stage.clientWidth-28)/550, (stage.clientHeight-16)/460);
    const folded = Math.min((stage.clientWidth-40)/300, (stage.clientHeight-20)/360);
    scene.style.setProperty('--box-scale', mix(flat,folded,value('sides')));
    label.textContent = (t>.6?b:a).label;
    meter.style.transform = 'scaleX(' + ((index+t)/(states.length-1)) + ')';
    root.dataset.assemblyStage = String(index);
  }
  function schedule() { if (!queued) queued = requestAnimationFrame(paint); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(root);
  if ('IntersectionObserver' in window) {
    const items = [...root.querySelectorAll('.prepress-collage figure, .process-photo-copy, .process-photo-row > .process-photo-frame')];
    items.forEach(el => el.classList.add('story-reveal'));
    const reveal = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => {
      if (isIntersecting) { target.classList.add('is-visible'); reveal.unobserve(target); }
    }), {threshold:.1});
    items.forEach(el => reveal.observe(el));
    const zoom = new IntersectionObserver(entries => entries.forEach(({target,isIntersecting}) => {
      target.style.animationPlayState = isIntersecting ? 'running' : 'paused';
    }));
    root.querySelectorAll('.process-photo-frame img').forEach(img => zoom.observe(img));
    document.body.classList.add('story-motion-ready');
  }
  schedule();
})();
