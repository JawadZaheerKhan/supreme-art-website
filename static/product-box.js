(() => {
  const view = document.querySelector('.product-box-view');
  if (!view) return;
  const model = view.querySelector('.product-box-model');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = -12, y = -22, targetX = x, targetY = y, frame = 0, down = null, lastTime = 0;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function render(now) {
    const dt = lastTime ? Math.min(48, now - lastTime) : 16;
    lastTime = now;
    const blend = reduced.matches ? 1 : 1 - Math.exp(-dt / 125);
    const scale = Math.min(1, view.clientWidth / 440);
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    model.style.transform = 'scale(' + scale + ') rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
    model.style.setProperty('--front-light', (1.015 - Math.abs(y) * .0013).toFixed(3));
    model.style.setProperty('--right-light', (.91 + y * .0015).toFixed(3));
    model.style.setProperty('--left-light', (.95 - y * .0015).toFixed(3));
    view.style.setProperty('--shadow-x', (-y * .22) + 'px');
    view.style.setProperty('--shadow-scale', (1 - Math.abs(y) * .003).toFixed(3));
    if (Math.abs(x-targetX)+Math.abs(y-targetY) > .025) frame = requestAnimationFrame(render);
    else { frame = 0; lastTime = 0; }
  }
  function update(rx, ry) {
    targetX = clamp(rx, -24, -4);
    targetY = clamp(ry, -48, 48);
    if (!frame) frame = requestAnimationFrame(render);
  }
  view.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    down = {id:e.pointerId,x:e.clientX,y:targetY};
    view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') {
      if(down) update(-12,down.y+(e.clientX-down.x)*.55);
      return;
    }
    const r=view.getBoundingClientRect();
    update(-4-(1-(e.clientY-r.top)/r.height)*20,((e.clientX-r.left)/r.width-.5)*96);
  });
  view.addEventListener('pointerup', () => {down=null;});
  view.addEventListener('pointercancel', () => {down=null;});
  view.addEventListener('pointerleave', e => {if(e.pointerType==='mouse')update(-12,-22);});
  view.addEventListener('keydown', e => {
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='Home')update(-12,-22);
    else update(targetX+(e.key==='ArrowUp'?-4:e.key==='ArrowDown'?4:0),targetY+(e.key==='ArrowLeft'?-12:e.key==='ArrowRight'?12:0));
  });
  new ResizeObserver(() => { if (!frame) frame = requestAnimationFrame(render); }).observe(view);

  // Sample a projective texture directly: no triangle edges or transparent seams.
  function texture(name, quad, w, h) {
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        const canvas=view.querySelector('.box-'+name); canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        const source=document.createElement('canvas');
        source.width=image.naturalWidth; source.height=image.naturalHeight;
        const sourceCtx=source.getContext('2d',{willReadFrequently:true});
        sourceCtx.drawImage(image,0,0);
        const pixels=sourceCtx.getImageData(0,0,source.width,source.height).data;
        const output=ctx.createImageData(w,h);
        const [a,b,c,d]=quad;
        const dx1=b[0]-c[0], dx2=d[0]-c[0], dx3=a[0]-b[0]+c[0]-d[0];
        const dy1=b[1]-c[1], dy2=d[1]-c[1], dy3=a[1]-b[1]+c[1]-d[1];
        const det=dx1*dy2-dx2*dy1;
        const g=(dx3*dy2-dx2*dy3)/det, k=(dx1*dy3-dx3*dy1)/det;
        const ax=b[0]-a[0]+g*b[0], bx=d[0]-a[0]+k*d[0];
        const ay=b[1]-a[1]+g*b[1], by=d[1]-a[1]+k*d[1];
        for(let row=0;row<h;row++) for(let col=0;col<w;col++){
          const u=(col+.5)/w,v=(row+.5)/h,den=g*u+k*v+1;
          const sx=clamp((ax*u+bx*v+a[0])/den,0,source.width-2);
          const sy=clamp((ay*u+by*v+a[1])/den,0,source.height-2);
          const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
          const pos=(iy*source.width+ix)*4,out=(row*w+col)*4;
          // Slight edge shading gives the paperboard a crisp folded edge.
          const edge=Math.min(col,row,w-1-col,h-1-row);
          const shade=edge<2 ? .96 : 1;
          for(let channel=0;channel<3;channel++){
            const top=pixels[pos+channel]*(1-fx)+pixels[pos+4+channel]*fx;
            const bottom=pixels[pos+source.width*4+channel]*(1-fx)+pixels[pos+source.width*4+4+channel]*fx;
            output.data[out+channel]=(top*(1-fy)+bottom*fy)*shade;
          }
          output.data[out+3]=255;
        }
        ctx.putImageData(output,0,0);
        resolve();
      };
      image.onerror=reject;image.src='/images/imo-box/'+name+'.jpg';
    });
  }
  Promise.all([
    texture('front',[[336,316],[994,319],[979,725],[339,722]],840,534),
    texture('right',[[923,293],[969,279],[967,585],[924,605]],96,534),
    texture('left',[[530,333],[587,342],[595,681],[542,669]],96,534),
    texture('top',[[395,339],[960,337],[975,361],[393,364]],840,96)
  ]).then(()=>view.classList.add('is-ready')).catch(()=>{});
})();
