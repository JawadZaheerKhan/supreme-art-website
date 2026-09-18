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
 const view=document.querySelector('.product-bottle-view');if(!view)return;
 const canvas=view.querySelector('canvas'),ctx=canvas.getContext('2d'),button=view.querySelector('button');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let ready=false,visible=false,paused=false,hover=false,drag=null,angle=0,target=0,time=0,last=0,frame=0,manualUntil=0;
 const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
 let bottle,label;
 Promise.all([load('/images/bottle-mockup/amber-bottle.png'),load('/images/bottle-mockup/clarion-sticker.jpg')]).then(([b,sticker])=>{
  bottle=b;
  // Rectify the photographed sticker at runtime, preserving its original lettering.
  const source=document.createElement('canvas');source.width=sticker.width;source.height=sticker.height;
  const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(sticker,0,0);const data=sc.getImageData(0,0,source.width,source.height).data;
  label=document.createElement('canvas');label.width=1400;label.height=460;const lc=label.getContext('2d');const out=lc.createImageData(label.width,label.height);
  for(let y=0;y<label.height;y++)for(let x=0;x<label.width;x++){
   const u=(x+.5)/label.width,v=(y+.5)/label.height;
   const sx=(222+u*877)*(1-v)+(198+u*910)*v,sy=(193+u*18)*(1-v)+(469+u*22)*v;
   const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,p=(iy*source.width+ix)*4,q=(y*label.width+x)*4;
   for(let k=0;k<3;k++)out.data[q+k]=Math.min(255,(data[p+k]*(1-fx)*(1-fy)+data[p+4+k]*fx*(1-fy)+data[p+source.width*4+k]*(1-fx)*fy+data[p+source.width*4+4+k]*fx*fy)*1.17);
   out.data[q+3]=255;
  }
  lc.putImageData(out,0,0);ready=true;view.classList.add('is-ready');draw();wake();
 }).catch(()=>{});
 function draw(){
  if(!ready)return;ctx.clearRect(0,0,431,1147);ctx.filter='brightness(1.38) saturate(1.12)';ctx.drawImage(bottle,0,0);ctx.filter='none';
  for(let x=0;x<431;x++){
   const nx=Math.max(-.999,Math.min(.999,(x-215.5)/215.5)),c=Math.sqrt(1-nx*nx);
   const u=.5+(Math.asin(nx)+angle)/(Math.PI*2),sx=Math.max(0,Math.min(label.width-2,u*label.width));
   const top=430+42*c,bottom=1025+36*c;
   ctx.drawImage(label,sx,0,1.6,label.height,x,top,1.1,bottom-top);
   ctx.fillStyle='rgba(25,0,14,'+(.27*(1-c))+')';ctx.fillRect(x,top,1.1,bottom-top);
   ctx.fillStyle='rgba(255,255,255,'+(.09*Math.exp(-Math.pow((nx+.38)/.17,2)))+')';ctx.fillRect(x,top,1.1,bottom-top);
  }
  canvas.style.transform='translateX('+Math.sin(angle)*9+'px) rotate('+Math.sin(angle)*1.3+'deg)';view.dataset.angle=angle.toFixed(3);
 }
 function wake(){if(!frame&&ready&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function render(now){frame=0;const dt=last?Math.min(48,now-last):16;last=now;
  const auto=!reduced.matches&&!paused&&!hover&&!drag&&now>manualUntil;
  if(auto){time+=dt;target=Math.sin(Math.max(0,time-800)/14000*Math.PI*2)*.82;}
  const previous=angle;angle+=(target-angle)*(reduced.matches?1:1-Math.exp(-dt/160));if(Math.abs(previous-angle)>.0001)draw();
  if((!reduced.matches&&!paused&&!hover&&!drag)||Math.abs(target-angle)>.001)wake();else last=0;
 }
 function update(a){target=Math.max(-1.05,Math.min(1.05,a));manualUntil=performance.now()+1700;wake();}
 button.addEventListener('click',()=>{paused=!paused;if(paused)target=angle;button.textContent=paused?'Play':'Pause';button.setAttribute('aria-label',paused?'Play automatic rotation':'Pause automatic rotation');wake();});
 view.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});
 view.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,angle:target};view.setPointerCapture(e.pointerId);});
 view.addEventListener('pointermove',e=>{if(drag)update(drag.angle+(e.clientX-drag.x)*.009);else if(e.pointerType==='mouse'){const r=view.getBoundingClientRect();update(((e.clientX-r.left)/r.width-.5)*2.1);}});
 for(const type of ['pointerup','pointercancel'])view.addEventListener(type,()=>{drag=null;wake();});
 view.addEventListener('pointerleave',()=>{hover=false;manualUntil=performance.now()+500;wake();});
 view.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();update(e.key==='Home'?0:target+(e.key==='ArrowLeft'?-.22:.22));});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}last=0;wake();}).observe(view);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}last=0;wake();});
 reduced.addEventListener('change',()=>{target=0;time=0;wake();});
})();


