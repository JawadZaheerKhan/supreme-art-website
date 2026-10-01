// Keep the gentle live photo zoom, pausing it when its photo is off screen.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      target.style.animationPlayState = isIntersecting ? 'running' : 'paused';
    });
  });
  document.querySelectorAll('.process-photo-frame img').forEach(image => {
    image.style.animationPlayState = 'paused';
    observer.observe(image);
  });
})();

// One carton follows the reserved spaces in the story. Normal page scrolling
// drives its travel and assembly; no wheel/touch interception or pinned panels.
(() => {
  const box = document.querySelector('.process-travelling-box');
  const scene = box?.querySelector('.proc-box__scene');
  const docks = [...document.querySelectorAll('.story-dock')];
  if (!scene || !docks.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = [...document.querySelectorAll('.prepress-collage figure, .prepress-panel .process-photo-copy, .process-photo-row > .process-photo-frame, .process-photo-row > .process-photo-copy')];
  reveals.forEach(el => el.classList.add('story-reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('is-visible'); observer.unobserve(target); }
    });
  }, { threshold: .12 });
  reveals.forEach(el => observer.observe(el));
  document.body.classList.add('story-motion-ready');
  // Artwork, cut outline, side folds, closing flaps, viewing angle.
  const states = [
    [.25,.5,0,0,0], [.4,.75,0,0,.12], [.4,.8,0,0,.22],
    [1,.15,0,0,.25], [1,.2,0,0,.3], [1,1,0,0,.32],
    [1,1,.1,0,.42], [1,1,.15,0,.5], [1,1,1,.65,.9], [1,0,1,1,1]
  ];
  const keys = ['--print','--cut','--foldA','--foldB','--view'];
  const clamp = n => Math.max(0, Math.min(1, n));
  const mix = (a,b,t) => a+(b-a)*t;
  let frame = 0;
  function update() {
    frame = 0;
    if (reduced.matches) { box.style.opacity = '0'; return; }
    const points = docks.map(dock => {
      const parent = dock.closest('.prepress-panel, .process-photo-row');
      const rect = dock.getBoundingClientRect(), p = parent.getBoundingClientRect();
      return { x: rect.left, y: rect.top, stop: scrollY+p.top-85, bottom:p.bottom };
    });
    let index=0;
    while(index<points.length-1 && scrollY>=points[index+1].stop) index++;
    const a=points[index], b=points[Math.min(index+1,points.length-1)];
    const t=a===b?0:clamp((scrollY-a.stop)/Math.max(1,b.stop-a.stop));
    const eased=t*t*(3-2*t);
    const x=mix(a.x,b.x,eased);
    // Linear vertical travel compensates for the document's own scrolling.
    const y=mix(a.y,b.y,t)-Math.sin(Math.PI*t)*18;
    box.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(Math.sin(Math.PI*t)*(index%2?-5:5)).toFixed(2)}deg)`;
    const visibility=clamp((innerHeight-points[0].y)/150)*clamp((points.at(-1).bottom-85)/150);
    box.style.opacity=String(visibility);
    scene.style.setProperty('--intro','1');
    const s=states[Math.min(index,states.length-1)], e=states[Math.min(index+1,states.length-1)];
    keys.forEach((key,i)=>scene.style.setProperty(key,mix(s[i],e[i],eased).toFixed(4)));
    const fold=mix(s[2],e[2],eased);
    scene.style.setProperty('--box-scale',String(innerWidth<=900?mix(.18,.27,fold):mix(.30,.43,fold)));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  reveals.forEach(el=>el.addEventListener('transitionend',schedule));
  reduced.addEventListener('change',()=>{
    if(reduced.matches)reveals.forEach(el=>el.classList.add('is-visible'));
    schedule();
  });
  new ResizeObserver(schedule).observe(document.querySelector('main'));
  schedule();
})();
