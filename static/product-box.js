(() => {
  const view = document.querySelector('.product-box-view');
  if (!view) return;
  const model = view.querySelector('.product-box-model');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = -12, y = -22, targetX = x, targetY = y, frame = 0, down = null;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function render() {
    const scale = Math.min(1, view.clientWidth / 440);
    x += (targetX - x) * (reduced.matches ? 1 : .16);
    y += (targetY - y) * (reduced.matches ? 1 : .16);
    model.style.transform = 'scale(' + scale + ') rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
    frame = Math.abs(x-targetX)+Math.abs(y-targetY) > .05 ? requestAnimationFrame(render) : 0;
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
  new ResizeObserver(render).observe(view);

  // Map the photographed quadrilateral onto a box face using small affine triangles.
  function texture(name, quad, w, h) {
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>{
        const canvas=view.querySelector('.box-'+name); canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        const point=(u,v)=>[
          (1-v)*((1-u)*quad[0][0]+u*quad[1][0])+v*((1-u)*quad[3][0]+u*quad[2][0]),
          (1-v)*((1-u)*quad[0][1]+u*quad[1][1])+v*((1-u)*quad[3][1]+u*quad[2][1])
        ];
        function triangle(uv) {
          const src=uv.map(p=>point(...p)), dst=uv.map(p=>[p[0]*w,p[1]*h]);
          const [a,b,c]=src, [A,B,C]=dst;
          const det=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
          const m=((B[0]-A[0])*(c[1]-a[1])-(C[0]-A[0])*(b[1]-a[1]))/det;
          const n=((C[0]-A[0])*(b[0]-a[0])-(B[0]-A[0])*(c[0]-a[0]))/det;
          const p=((B[1]-A[1])*(c[1]-a[1])-(C[1]-A[1])*(b[1]-a[1]))/det;
          const q=((C[1]-A[1])*(b[0]-a[0])-(B[1]-A[1])*(c[0]-a[0]))/det;
          ctx.save();ctx.beginPath();dst.forEach((d,i)=>i?ctx.lineTo(...d):ctx.moveTo(...d));ctx.closePath();ctx.clip();
          ctx.setTransform(m,p,n,q,A[0]-m*a[0]-n*a[1],A[1]-p*a[0]-q*a[1]);ctx.drawImage(image,0,0);ctx.restore();
        }
        for(let j=0;j<16;j++)for(let i=0;i<16;i++){
          const u=i/16,v=j/16,U=(i+1)/16,V=(j+1)/16;
          triangle([[u,v],[U,v],[U,V]]);triangle([[u,v],[U,V],[u,V]]);
        }
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
