(() => {
  const additionalBoxes ={
  "zeflox": {
    "height": 198,
    "depth": 30,
    "faces": [
      [
        "front",
        [
          [
            289,
            267
          ],
          [
            936,
            269
          ],
          [
            930,
            722
          ],
          [
            297,
            721
          ]
        ],
        840,
        600
      ],
      [
        "left",
        [
          [
            397,
            205
          ],
          [
            462,
            207
          ],
          [
            472,
            707
          ],
          [
            406,
            692
          ]
        ],
        180,
        600
      ],
      [
        "right",
        [
          [
            855,
            268
          ],
          [
            910,
            267
          ],
          [
            898,
            677
          ],
          [
            849,
            692
          ]
        ],
        180,
        600
      ],
      [
        "top",
        [
          [
            290,
            324
          ],
          [
            949,
            320
          ],
          [
            966,
            355
          ],
          [
            279,
            362
          ]
        ],
        840,
        180
      ]
    ]
  },
  "danidol": {
    "height": 214,
    "depth": 72,
    "faces": [
      [
        "front",
        [
          [
            344,
            283
          ],
          [
            912,
            282
          ],
          [
            909,
            707
          ],
          [
            351,
            712
          ]
        ],
        840,
        600
      ],
      [
        "left",
        [
          [
            490,
            288
          ],
          [
            622,
            280
          ],
          [
            645,
            696
          ],
          [
            509,
            674
          ]
        ],
        180,
        600
      ],
      [
        "right",
        [
          [
            754,
            302
          ],
          [
            874,
            307
          ],
          [
            866,
            655
          ],
          [
            744,
            678
          ]
        ],
        180,
        600
      ],
      [
        "top",
        [
          [
            353,
            287
          ],
          [
            866,
            284
          ],
          [
            889,
            345
          ],
          [
            330,
            353
          ]
        ],
        840,
        180
      ]
    ]
  },
  "novex": {
    "height": 184,
    "depth": 32,
    "faces": [
      [
        "front",
        [
          [
            278,
            242
          ],
          [
            970,
            246
          ],
          [
            956,
            694
          ],
          [
            284,
            693
          ]
        ],
        840,
        600
      ],
      [
        "left",
        [
          [
            410,
            311
          ],
          [
            482,
            309
          ],
          [
            490,
            796
          ],
          [
            418,
            779
          ]
        ],
        180,
        600
      ],
      [
        "right",
        [
          [
            863,
            252
          ],
          [
            916,
            254
          ],
          [
            897,
            649
          ],
          [
            843,
            666
          ]
        ],
        180,
        600
      ],
      [
        "top",
        [
          [
            265,
            293
          ],
          [
            967,
            306
          ],
          [
            980,
            341
          ],
          [
            243,
            329
          ]
        ],
        840,
        180
      ]
    ]
  },
  "caber": {
    "height": 179,
    "depth": 37,
    "faces": [
      [
        "front",
        [
          [
            273,
            291
          ],
          [
            950,
            291
          ],
          [
            938,
            720
          ],
          [
            285,
            721
          ]
        ],
        840,
        600
      ],
      [
        "left",
        [
          [
            476,
            316
          ],
          [
            569,
            321
          ],
          [
            575,
            767
          ],
          [
            482,
            750
          ]
        ],
        180,
        600
      ],
      [
        "right",
        [
          [
            844,
            285
          ],
          [
            918,
            281
          ],
          [
            899,
            669
          ],
          [
            826,
            684
          ]
        ],
        180,
        600
      ],
      [
        "top",
        [
          [
            331,
            298
          ],
          [
            899,
            294
          ],
          [
            914,
            337
          ],
          [
            318,
            339
          ]
        ],
        840,
        180
      ]
    ]
  },
  "icon": {
    "height": 146,
    "depth": 34,
    "faces": [
      [
        "front",
        [
          [
            343,
            263
          ],
          [
            957,
            268
          ],
          [
            947,
            582
          ],
          [
            348,
            575
          ]
        ],
        840,
        600
      ],
      [
        "left",
        [
          [
            513,
            363
          ],
          [
            585,
            369
          ],
          [
            592,
            646
          ],
          [
            520,
            635
          ]
        ],
        180,
        600
      ],
      [
        "right",
        [
          [
            862,
            312
          ],
          [
            924,
            309
          ],
          [
            909,
            578
          ],
          [
            851,
            592
          ]
        ],
        180,
        600
      ],
      [
        "top",
        [
          [
            324,
            308
          ],
          [
            881,
            311
          ],
          [
            891,
            346
          ],
          [
            312,
            344
          ]
        ],
        840,
        180
      ]
    ]
  }
};
  Object.assign(additionalBoxes, window.productBoxSyrupBoxes || {}, window.productBoxFoodBoxes || {}, window.productBoxNeutraBoxes || {}, window.productBoxLabelBoxes || {});
  document.querySelectorAll('.product-box-view').forEach(view => {
  const model = view.querySelector('.product-box-model');
  const dimensions = additionalBoxes[view.dataset.box] || {height:178,depth:32};
  if (dimensions.leaflet) {
    view.classList.add('has-leaflet');
    for (const name of ['paper','flap']) {
      const canvas = document.createElement('canvas');
      canvas.className = 'box-face box-' + name;
      model.appendChild(canvas);
    }
  }
  if (dimensions.hanger) {
    const hanger = document.createElement('div');
    hanger.className = 'box-hanger';
    hanger.innerHTML = '<svg viewBox="0 0 280 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path fill="#16a1aa" stroke="#8bd1ca" stroke-width="1" fill-rule="evenodd" d="M10 60V31H101C101 13 118 1 140 1S179 13 179 31H270V60Z M120 17H131Q140 7 149 17H160V23H149Q140 33 131 23H120Z"/></svg>';
    model.appendChild(hanger);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, targetX = x, targetY = y, frame = 0, down = null, lastTime = 0;
  let leafletInsertion = 1;
  let visible = false, hovering = false, manualUntil = 0, autoTime = 0, autoPaused = false;
  const toggle = view.querySelector('.product-box-toggle');
  function wake() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); }
  toggle.addEventListener('click', () => {
    autoPaused = !autoPaused;
    toggle.textContent = autoPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', autoPaused ? 'Play automatic rotation' : 'Pause automatic rotation');
    wake();
  });
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function render(now) {
    const dt = lastTime ? Math.min(48, now - lastTime) : 16;
    lastTime = now;
    const blend = reduced.matches ? 1 : 1 - Math.exp(-dt / 125);
    const automatic = !reduced.matches && !autoPaused && !hovering && !down && now >= manualUntil;
    if (automatic) {
      autoTime += dt;
      const phase = Math.max(0, autoTime - 1200) / 18000 * Math.PI * 2;
      targetY = Math.sin(phase) * 28;
      targetX = -3 * (1 - Math.cos(phase));
    }
    if (dimensions.leaflet) {
      const desired = hovering || down || view.matches(':focus-within') ? 0 : 1;
      leafletInsertion += (desired - leafletInsertion) * (reduced.matches ? 1 : 1 - Math.exp(-dt / 260));
      if (Math.abs(desired - leafletInsertion) < .001) leafletInsertion = desired;
      model.style.setProperty('--paper-travel', (leafletInsertion * 104) + 'px');
      view.dataset.insertion = leafletInsertion.toFixed(3);
    }
    const scale = dimensions.width
      ? Math.min(1.18, view.clientWidth / 355,
          (view.querySelector('.product-box-stage').clientHeight - 36) / (dimensions.height + dimensions.depth * .4 + (dimensions.hanger ? 44 : dimensions.leaflet ? 180 : 0)))
      : Math.min(1.18, view.clientWidth / 355) * (dimensions.scale || 1);
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    model.style.transform = (dimensions.leaflet ? 'translateY(48px) ' : '') + 'scale(' + scale + ') rotateX(' + x + 'deg) rotateY(' + y + 'deg) scaleX('+((dimensions.width || 280)/280)+') scaleY('+(dimensions.height/178)+') scaleZ('+(dimensions.depth/32)+')';
    model.style.setProperty('--front-light', (1.015 - Math.abs(y) * .0013).toFixed(3));
    model.style.setProperty('--right-light', (.91 + y * .0015).toFixed(3));
    model.style.setProperty('--left-light', (.95 - y * .0015).toFixed(3));
    view.style.setProperty('--shadow-x', (-y * .22) + 'px');
    view.style.setProperty('--shadow-scale', (1 - Math.abs(y) * .003).toFixed(3));
    if (visible && !document.hidden && ((!reduced.matches && !autoPaused && (!hovering || dimensions.leaflet)) || Math.abs(x-targetX)+Math.abs(y-targetY) > .025 || (dimensions.leaflet && Math.abs(leafletInsertion - (hovering || down || view.matches(':focus-within') ? 0 : 1)) > .001))) frame = requestAnimationFrame(render);
    else { frame = 0; lastTime = 0; }
  }
  function update(rx, ry) {
    manualUntil = performance.now() + 2200;
    targetX = clamp(rx, -18, 0);
    targetY = clamp(ry, -48, 48);
    wake();
  }
  view.addEventListener('pointerenter', e => { if(e.pointerType==='mouse'){ hovering=true; wake(); } });
  view.addEventListener('focusin', wake);
  view.addEventListener('focusout', () => requestAnimationFrame(wake));
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
  view.addEventListener('pointerleave', e => {if(e.pointerType==='mouse'){ hovering=false; manualUntil=performance.now()+600; wake(); }});
  view.addEventListener('keydown', e => {
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;
    e.preventDefault();
    if(e.key==='Home')update(0,0);
    else update(targetX+(e.key==='ArrowUp'?-4:e.key==='ArrowDown'?4:0),targetY+(e.key==='ArrowLeft'?-12:e.key==='ArrowRight'?12:0));
  });
    new ResizeObserver(wake).observe(view);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { lastTime=0; wake(); }
  }).observe(view);
  document.addEventListener('visibilitychange', () => { lastTime=0; wake(); });
  reduced.addEventListener('change', () => { targetX=0; targetY=0; autoTime=0; wake(); });

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
      image.onerror=reject;image.src='/images/'+view.dataset.box+'-box/'+(dimensions.sources?.[name] || name)+(dimensions.extensions?.[name] || dimensions.ext || (view.dataset.box==='imo'?'.jpg':'.png'));
    });
  }
  const faces = additionalBoxes[view.dataset.box]?.faces || (view.dataset.box === 'vazkor' ? [
    ['front',[[259,280],[1014,270],[1009,741],[276,750]],840,534],
    ['right',[[882,282],[941,282],[932,711],[874,731]],96,534],
    ['left',[[283,210],[359,210],[373,773],[288,753]],96,534],
    ['top',[[286,307],[987,303],[1005,347],[271,350]],840,96]
  ] : [
    ['front',[[336,316],[994,319],[979,725],[339,722]],840,534],
    ['right',[[923,293],[969,279],[967,585],[924,605]],96,534],
    ['left',[[530,333],[587,342],[595,681],[542,669]],96,534],
    ['top',[[395,339],[960,337],[975,361],[393,364]],840,96]
  ]);
  Promise.all(faces.map(face => texture(...face))).then(()=>view.classList.add('is-ready')).catch(()=>{});
  });
})();
