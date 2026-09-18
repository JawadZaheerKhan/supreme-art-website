window.productBoxLabelBoxes = {
  'caber-leaflet': {width:180,height:278,depth:32,leaflet:true,sources:{paper:'front',flap:'front'},faces:[
    ['front',[[294,718],[619,718],[615,1215],[290,1215]],650,1000],
    ['left',[[446,655],[482,665],[492,1146],[449,1126]],130,1000],
    ['right',[[554,699],[594,699],[565,1128],[529,1147]],130,1000],
    ['paper',[[351,345],[563,349],[568,572],[350,570]],480,510],
    ['flap',[[295,575],[619,575],[619,711],[293,711]],650,272]
  ]}
};
(() => {
 const view=document.querySelector('.product-bottle-view'); if(!view)return;
 const canvas=view.querySelector('canvas'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cameras=[{name:'left',angle:-.91,cx:509,top:347,bottom:982,r:116},{name:'front',angle:0,cx:447,top:473,bottom:1012,r:97},{name:'right',angle:.91,cx:489,top:404,bottom:915,r:93}];
 const profile=[[0,.42],[.01,.54],[.035,.57],[.135,.58],[.15,.53],[.18,.51],[.21,.56],[.26,.75],[.31,.89],[.36,.97],[.40,1],[.92,.99],[.96,.93],[.983,.74],[1,.12]];
 function sourceRadius(v){for(let i=1;i<profile.length;i++){const [b,rb]=profile[i],[a,ra]=profile[i-1];if(v<=b)return ra+(rb-ra)*(v-a)/(b-a);}return .12;}
 function radius(v){
  // Smooth lathed silhouette: rounded cap, neck, flowing shoulder and elliptical heel.
  if(v<.018){const t=(.018-v)/.018;return .565*Math.sqrt(Math.max(0,1-t*t));}
  if(v<.133)return .565;
  if(v<.155){const t=(v-.133)/.022;return .52+.045*(1+Math.cos(Math.PI*t))/2;}
  if(v<.19)return .52;
  if(v<.41){const t=(v-.19)/.22;return .52+.48*(1-Math.cos(Math.PI*t))/2;}
  if(v<.955)return 1;
  const t=(v-.955)/.045;return Math.sqrt(Math.max(0,1-t*t));
 }
 let maps,angle=0,target=0,paused=false,hover=false,visible=false,drag=null,manualUntil=0,time=0,last=0,frame=0;
 const button=view.querySelector('button');
 const W=canvas.width,H=canvas.height,R=146;
 // Unwrap the visible portions of the three photographs onto a rounded bottle surface.
 Promise.all(cameras.map(camera=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);resolve({...camera,w:im.width,pixels:g.getImageData(0,0,im.width,im.height).data});};im.onerror=reject;im.src='/images/clarion-box/'+camera.name+'.png';}))).then(images=>{
   const tw=960,th=820,texture=new Uint8ClampedArray(tw*th*4);
   for(let y=0;y<th;y++){
    const v=y/(th-1),r=sourceRadius(v);
    for(let x=0;x<tw;x++){
     const theta=(x/(tw-1)-.5)*Math.PI*2;
     const weights=images.map(im=>Math.pow(Math.max(0,Math.cos(theta-im.angle)),24));
     const sum=weights.reduce((a,b)=>a+b,0)||1;
     const out=(y*tw+x)*4;
     images.forEach((im,i)=>{
      const sx=im.cx+im.r*r*Math.sin(theta-im.angle),sy=im.top+v*(im.bottom-im.top);
      const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
      const pos=(iy*im.w+ix)*4;
      for(let k=0;k<3;k++)texture[out+k]+=(im.pixels[pos+k]*(1-fx)*(1-fy)+im.pixels[pos+4+k]*fx*(1-fy)+im.pixels[pos+im.w*4+k]*(1-fx)*fy+im.pixels[pos+im.w*4+4+k]*fx*fy)*weights[i]/sum;
     });
     texture[out+3]=255;
    }
   }
   maps={texture,tw,th}; view.classList.add('is-ready');draw();wake();
 }).catch(()=>{});
 function draw(){
  if(!maps)return;
  const out=ctx.createImageData(W,H),{texture,tw}=maps;
  for(let y=0;y<H;y++){
   const r=R*radius(y/(H-1));
   for(let x=Math.ceil(W/2-r);x<W/2+r;x++){
    const theta=Math.asin(Math.max(-1,Math.min(1,(x-W/2)/r)))+angle;
    const tx=Math.max(0,Math.min(tw-2,(theta/(2*Math.PI)+.5)*(tw-1))),ix=Math.floor(tx),f=tx-ix;
    const src=(y*tw+ix)*4,dst=(y*W+x)*4;
    const nx=(x-W/2)/r;
    const normal=Math.sqrt(Math.max(0,1-nx*nx));
    const shade=.57+.43*Math.pow(normal,.55);
    const highlight=12*Math.exp(-Math.pow((nx+.38)/.16,2))*normal;
    for(let k=0;k<3;k++)out.data[dst+k]=(texture[src+k]*(1-f)+texture[src+4+k]*f)*shade+highlight;
    out.data[dst+3]=Math.min(1,r-Math.abs(x-W/2))*255;
   }
  }
  ctx.putImageData(out,0,0);view.dataset.angle=angle.toFixed(3);
 }
 function wake(){if(!frame&&visible&&!document.hidden&&maps)frame=requestAnimationFrame(render);}
 function render(now){
  frame=0;const dt=last?Math.min(48,now-last):16;last=now;
  const auto=!reduced.matches&&!paused&&!hover&&!drag&&now>manualUntil;
  if(auto){time+=dt;target=Math.sin(Math.max(0,time-1200)/18000*Math.PI*2)*.72;}
  const before=angle;angle+=(target-angle)*(reduced.matches?1:1-Math.exp(-dt/125));
  if(Math.abs(before-angle)>.0001)draw();
  if(auto||Math.abs(angle-target)>.001)wake();else last=0;
 }
 function update(value){target=Math.max(-.84,Math.min(.84,value));manualUntil=performance.now()+2200;wake();}
 button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'Play':'Pause';button.setAttribute('aria-label',paused?'Play automatic rotation':'Pause automatic rotation');wake();});
 view.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});
 view.addEventListener('pointermove',e=>{if(drag){update(drag.angle+(e.clientX-drag.x)*.008);return;}if(e.pointerType==='mouse'){const r=view.getBoundingClientRect();update(((e.clientX-r.left)/r.width-.5)*1.68);}});
 view.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,angle:target};view.setPointerCapture(e.pointerId);});
 for(const event of ['pointerup','pointercancel'])view.addEventListener(event,()=>{drag=null;wake();});
 view.addEventListener('pointerleave',()=>{hover=false;manualUntil=performance.now()+600;wake();});
 view.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();update(e.key==='Home'?0:target+(e.key==='ArrowLeft'?-.21:.21));});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}last=0;wake();}).observe(view);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}last=0;wake();});
 reduced.addEventListener('change',()=>{target=0;time=0;wake();});
})();

