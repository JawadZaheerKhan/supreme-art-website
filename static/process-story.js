/* A scroll-scrubbed photographic journey. No scroll interception or animation library.
   The floating artwork/plate is drawn from the supplied photograph, not a substitute image. */
(() => {
  'use strict';
  const story = document.querySelector('.prepress-story');
  const canvas = document.querySelector('#prepress-canvas');
  if (!story || !canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const media = story.querySelector('.prepress-media');
  const viewer = story.querySelector('.prepress-viewer');
  const entries = [...story.querySelectorAll('.prepress-photo')].map(node => ({ ...node.dataset }));
  const images = new Map();
  const dots = [...story.querySelectorAll('[data-story-step]')];
  const caption = story.querySelector('.prepress-caption');
  const lead = story.querySelector('.prepress-lead');
  const detail = story.querySelector('.prepress-detail');
  const counter = story.querySelector('.prepress-counter');
  const progress = story.querySelector('.prepress-progress span');
  const previous = story.querySelector('[data-story-prev]');
  const next = story.querySelector('[data-story-next]');
  const mode = story.querySelector('.story-mode');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 580px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const range = (t, a, b) => ease((t - a) / (b - a));
  let width = 0, height = 0, frame = 0, active = -1, ready = false, manualGallery = false;
  let artwork, bluePlate, cleanPlate, stockTexture;
  const mobile = () => width <= 760;
  const imageFor = i => images.get(entries[i].image);

  // Camera positions are measured against the source photos. Keeping these in
  // source coordinates makes the same object connections work on every viewport.
  const targets = [
    [.713, .54], [.713, .54], [.361, .552], [.68, .48],
    [.345, .645], [.69, .60], [.28, .54], [.545, .65]
  ];
  const plateCorners = [[.281, .415], [.475, .469], [.431, .681], [.248, .580]];
  const processorCorners = [[.635, .226], [.705, .21], [.790, .728], [.691, .737]];
  const outputCorners = [[.136, .560], [.366, .497], [.58, .656], [.225, .79]];
  const stackCorners = [[.465, .272], [.86, .280], [.86, .83], [.465, .85]];
  const lifterCorners = [[.032, .277], [.466, .213], [.494, .685], [.13, .827]];
  const cutterCorners = [[.474, .603], [.630, .604], [.63, .685], [.476, .676]];

  function camera(i, zoom = 1, focus = [.5, .5]) {
    const img = imageFor(i);
    const baseScale = mobile()
      ? Math.min(width / img.naturalWidth, height / img.naturalHeight) * 1.12
      : Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const scale = baseScale * zoom;
    // Wide photographs remain readable on phones; focus on the active material.
    const focal = mobile() && zoom === 1 ? targets[i] : focus;
    let x = width * .5 - focal[0] * img.naturalWidth * scale;
    let y = height * .5 - focal[1] * img.naturalHeight * scale;
    x = img.naturalWidth * scale < width ? (width - img.naturalWidth * scale) / 2 : clamp(x, width - img.naturalWidth * scale, 0);
    y = img.naturalHeight * scale < height ? (height - img.naturalHeight * scale) / 2 : clamp(y, height - img.naturalHeight * scale, 0);
    return { x, y, scale, img };
  }
  function drawPhoto(i, zoom = 1, focus = [.5, .5], alpha = 1) {
    const c = camera(i, zoom, focus);
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.drawImage(c.img, c.x, c.y, c.img.naturalWidth * c.scale, c.img.naturalHeight * c.scale);
    ctx.restore();
    return c;
  }
  function mapped(i, corners, zoom = 1, focus = [.5, .5]) {
    const c = camera(i, zoom, focus);
    return corners.map(([x, y]) => [c.x + x * c.img.naturalWidth * c.scale, c.y + y * c.img.naturalHeight * c.scale]);
  }
  function rectangle(x, y, w, h) { return [[x,y], [x+w,y], [x+w,y+h], [x,y+h]]; }
  function interpolateQuad(a, b, t) { return a.map((p, i) => [mix(p[0], b[i][0], t), mix(p[1], b[i][1], t)]); }
  function artPosition() {
    const h = height * (mobile() ? .66 : .66), w = h * .82;
    const x = width * (mobile() ? .54 : .66) - w / 2;
    return rectangle(x, height * .5 - h / 2, w, h);
  }
  function path(points) {
    ctx.beginPath(); ctx.moveTo(...points[0]);
    points.slice(1).forEach(p => ctx.lineTo(...p)); ctx.closePath();
  }
  // Two clipped affine triangles allow a flat photo crop to turn and land on
  // the angled plate in the next photograph without swapping to an unrelated card.
  function textureQuad(texture, points, opacity = 1, shadow = false) {
    if (opacity <= 0) return;
    ctx.save(); ctx.globalAlpha = opacity;
    if (texture === bluePlate) { path(points); ctx.fillStyle = '#0c44b6'; ctx.fill(); }
    if (shadow) {
      path(points); ctx.shadowColor = '#0008'; ctx.shadowBlur = 38;
      ctx.shadowOffsetY = 20; ctx.fillStyle = '#e6e9e9'; ctx.fill(); ctx.shadowColor = 'transparent';
    }
    const [a,b,c,d] = points;
    ctx.save(); path([a,b,d]); ctx.clip();
    ctx.transform(b[0]-a[0], b[1]-a[1], d[0]-a[0], d[1]-a[1], a[0], a[1]);
    ctx.drawImage(texture,0,0,1,1);ctx.restore();
    ctx.save();path([b,c,d]);ctx.clip();
    ctx.transform(c[0]-d[0],c[1]-d[1],c[0]-b[0],c[1]-b[1],b[0]+d[0]-c[0],b[1]+d[1]-c[1]);
    ctx.drawImage(texture,0,0,1,1);ctx.restore();
    ctx.restore();
  }
  function makeTextures() {
    artwork = document.createElement('canvas'); artwork.width = 480; artwork.height = 584;
    const a = artwork.getContext('2d');
    a.fillStyle = '#f4eeeb'; a.fillRect(0,0,480,584);
    a.drawImage(imageFor(0), 811, 397, 209, 245, 24, 24, 432, 536);
    bluePlate = document.createElement('canvas'); bluePlate.width = 480; bluePlate.height = 584;
    const b = bluePlate.getContext('2d'), g = b.createLinearGradient(0,0,480,584);
    g.addColorStop(0,'#1760df');g.addColorStop(.45,'#0746bd');g.addColorStop(1,'#1038a1');
    b.fillStyle = g;b.fillRect(0,0,480,584);b.strokeStyle = '#b8ceeb';b.lineWidth = 4;b.strokeRect(2,2,476,580);
    cleanPlate = document.createElement('canvas');cleanPlate.width = 480;cleanPlate.height = 584;
    const c = cleanPlate.getContext('2d');c.fillStyle = '#d5dce4';c.fillRect(0,0,480,584);
    c.globalAlpha = .55;c.drawImage(artwork,24,35,432,514);
    c.globalCompositeOperation = 'color';c.fillStyle = '#2264bd';c.fillRect(0,0,480,584);
    c.globalCompositeOperation = 'source-over';c.globalAlpha = 1;c.fillStyle = '#1f62c8';c.fillRect(10,8,5,568);
    stockTexture = document.createElement('canvas');stockTexture.width = 580;stockTexture.height = 720;
    const stock = imageFor(5);
    stockTexture.getContext('2d').drawImage(stock,stock.naturalWidth*.465,stock.naturalHeight*.27,stock.naturalWidth*.4,stock.naturalHeight*.67,0,0,580,720);
  }
  function artworkScene(alpha = 1) {
    drawPhoto(0, 3.6, targets[0]);
    ctx.fillStyle = '#101e2aec';ctx.fillRect(0,0,width,height);
    // Fine registration grid connects the on-screen design with plate preparation.
    ctx.save();ctx.globalAlpha = .12;ctx.strokeStyle = '#94b4d4';ctx.lineWidth = 1;
    for(let x=0;x<width;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=0;y<height;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    ctx.restore();textureQuad(artwork,artPosition(),alpha,true);
  }
  function rest(i) { if(i===1) artworkScene(); else drawPhoto(i); }
  function zoomToArtwork(t) {
    const z = mix(1,3.6,ease(t));
    const focus = [mix(.5,targets[0][0],ease(t)),mix(.5,targets[0][1],ease(t))];
    drawPhoto(0,z,focus);
    const emerge = range(t,.42,1);
    ctx.fillStyle = `rgba(16,30,42,${emerge * .93})`;ctx.fillRect(0,0,width,height);
    const screen = mapped(0,[[.634,.414],[.797,.414],[.797,.669],[.634,.669]],z,focus);
    textureQuad(artwork,interpolateQuad(screen,artPosition(),emerge),emerge,true);
  }
  function artworkToPlate(t) {
    const arrive = range(t,.35,1), coating = range(t,.1,.6);
    drawPhoto(2,mix(2.5,1,arrive),[mix(targets[2][0],.5,arrive),mix(targets[2][1],.5,arrive)]);
    ctx.fillStyle = `rgba(16,30,42,${(1-range(t,.12,.7))*.94})`;ctx.fillRect(0,0,width,height);
    const destination = mapped(2,plateCorners);
    const quad = interpolateQuad(artPosition(),destination,ease(t));
    textureQuad(artwork,quad,1-range(t,.75,1),true);
    ctx.save();path(quad);ctx.clip();
    // The coating travels across the artwork, then the same object settles into CTP.
    const xs=quad.map(p=>p[0]),ys=quad.map(p=>p[1]);
    ctx.beginPath();ctx.rect(Math.min(...xs),Math.min(...ys),(Math.max(...xs)-Math.min(...xs))*coating,Math.max(...ys)-Math.min(...ys));ctx.clip();
    textureQuad(bluePlate,quad,1-range(t,.80,1));ctx.restore();
  }
  function connectedTransition(from,to,t,sourceCorners,destCorners,texture,kind) {
    const out = range(t,0,.57), incoming = range(t,.4,1);
    const fromFocus = [mix(.5,targets[from][0],out),mix(.5,targets[from][1],out)];
    const toFocus = [mix(targets[to][0],.5,incoming),mix(targets[to][1],.5,incoming)];
    const zoomLimit = kind==='stack'?1.35:kind==='paper'?1.6:2.8;
    const outZoom = mix(1,zoomLimit,out);
    const inZoom = mix(zoomLimit,1,incoming);
    drawPhoto(from,outZoom,fromFocus);
    // The environment dissolves behind the moving material; only the cleaning
    // pass uses a directional wipe across the plate itself.
    const reveal = range(t,.3,.78);
    if(reveal>0){
      drawPhoto(to,inZoom,toFocus,reveal);
    }
    const start=mapped(from,sourceCorners,outZoom,fromFocus);
    const end=mapped(to,destCorners,inZoom,toFocus);
    const travel=range(t,.12,.9);
    const quad=interpolateQuad(start,end,travel);
    const opacity=range(t,.04,.27)*(1-range(t,.76,1));
    if(kind==='paper'||kind==='stack') quad.forEach(p=>{p[1]-=Math.sin(Math.PI*t)*height*.09;});
    textureQuad(texture,quad,opacity,true);
    if(kind==='clean'){
      ctx.save();ctx.beginPath();ctx.rect(0,0,width*reveal,height);ctx.clip();textureQuad(cleanPlate,quad,opacity);ctx.restore();
      if(reveal>0&&reveal<1){ctx.fillStyle=`rgba(190,225,255,${Math.sin(Math.PI*reveal)*.7})`;ctx.fillRect(width*reveal-1,0,2,height);}
    }
  }
  function paperTransfer(t) {
    const a = range(t,0,.55),b = range(t,.35,1);
    drawPhoto(4,mix(1,2.3,a),[mix(.5,.35,a),mix(.5,.65,a)]);
    ctx.save();ctx.globalAlpha=b;drawPhoto(5,mix(1.5,1,b),[mix(.69,.5,b),mix(.6,.5,b)]);ctx.restore();
    const quad=interpolateQuad(mapped(4,outputCorners),mapped(5,stackCorners),ease(t));
    const alpha=range(t,0,.25)*(1-range(t,.7,1));
    ctx.save();ctx.globalAlpha=alpha;path(quad);ctx.fillStyle='#e3e5df';ctx.fill();
    for(let i=1;i<14;i++) {const p=i/14;ctx.beginPath();ctx.moveTo(mix(quad[0][0],quad[3][0],p),mix(quad[0][1],quad[3][1],p));ctx.lineTo(mix(quad[1][0],quad[2][0],p),mix(quad[1][1],quad[2][1],p));ctx.strokeStyle='#bdc4c150';ctx.lineWidth=1;ctx.stroke();}ctx.restore();
  }
  let paper;
  function render(position) {
    ctx.fillStyle='#101a24';ctx.fillRect(0,0,width,height);
    const from=Math.min(entries.length-1,Math.floor(position));
    const t=range(position-from,.24,.90);
    if(from===entries.length-1 || t===0) rest(from);
    else if(t===1) rest(from+1);
    else if(from===0) zoomToArtwork(t);
    else if(from===1) artworkToPlate(t);
    else if(from===2) connectedTransition(2,3,t,plateCorners,processorCorners,bluePlate,'blue');
    else if(from===3) connectedTransition(3,4,t,processorCorners,outputCorners,bluePlate,'clean');
    else if(from===4) paperTransfer(t);
    else if(from===5) connectedTransition(5,6,t,stackCorners,lifterCorners,stockTexture,'stack');
    else if(from===6) connectedTransition(6,7,t,lifterCorners,cutterCorners,paper,'paper');
    const current=clamp(from+(t>=.5?1:0),0,entries.length-1);
    if(current!==active){
      active=current;lead.textContent=entries[current].lead;detail.textContent=entries[current].detail;
      counter.textContent=String(current+1).padStart(2,'0')+' / 08';
      dots.forEach((dot,i)=>dot.setAttribute('aria-current',i===current?'step':'false'));
      previous.disabled=current===0;next.disabled=current===entries.length-1;
    }
    caption.style.opacity=String(1-Math.sin(t*Math.PI)*.35);
    progress.style.transform=`scaleX(${position/(entries.length-1)})`;
    story.dataset.view=String(current);
  }
  function update() {
    frame=0;
    if(!ready||!story.classList.contains('is-cinematic'))return;
    const rect=story.getBoundingClientRect();
    const distance=story.offsetHeight-viewer.offsetHeight;
    const position=clamp(-rect.top/Math.max(1,distance))*(entries.length-1);
    render(position);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function resize(){
    width=media.clientWidth;height=media.clientHeight;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);schedule();
  }
  function setMode(keepPosition=false){
    const wasActive=story.classList.contains('is-cinematic');
    const cinematic=ready&&!manualGallery&&!reduced.matches&&!shortScreen.matches;
    story.classList.toggle('is-cinematic',cinematic);
    mode.setAttribute('aria-pressed',String(!cinematic));
    mode.innerHTML=cinematic?'View all photos <span aria-hidden="true">↗</span>':'Back to the story <span aria-hidden="true">↗</span>';
    mode.hidden=reduced.matches||shortScreen.matches;
    resize();
    if(keepPosition&&wasActive!==cinematic)story.scrollIntoView({behavior:'instant',block:'start'});
  }
  function goTo(index){
    if(!story.classList.contains('is-cinematic'))return;
    const i=clamp(index,0,entries.length-1);
    const top=scrollY+story.getBoundingClientRect().top;
    scrollTo({top:top+(story.offsetHeight-viewer.offsetHeight)*(i/(entries.length-1)),behavior:reduced.matches?'instant':'smooth'});
  }
  previous.addEventListener('click',()=>goTo(active-1));next.addEventListener('click',()=>goTo(active+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>goTo(i)));
  mode.addEventListener('click',()=>{manualGallery=!manualGallery;setMode(true);});
  addEventListener('scroll',schedule,{passive:true});
  new ResizeObserver(resize).observe(media);
  reduced.addEventListener('change',()=>setMode(true));shortScreen.addEventListener('change',()=>setMode(true));
  // Keep the complete, readable gallery if any photograph cannot be loaded.
  Promise.all([...new Set(entries.map(e=>e.image))].map(src=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{images.set(src,img);resolve();};img.onerror=reject;img.src=src;
  }))).then(()=>{
    makeTextures();paper=document.createElement('canvas');paper.width=64;paper.height=64;
    const p=paper.getContext('2d');p.fillStyle='#f1f0e8';p.fillRect(0,0,64,64);
    for(let y=4;y<64;y+=4){p.fillStyle='#d9ddd5';p.fillRect(0,y,64,1);}
    ready=true;story.classList.add('is-ready');setMode();
    if(['#prepress','#press','#offpress'].includes(location.hash))document.querySelector(location.hash).scrollIntoView({behavior:'instant'});
  }).catch(()=>{story.classList.add('is-static');mode.hidden=true;});
})();
