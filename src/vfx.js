// VFX util: partículas, shake, hitstop, afterimages e pós-processo leve

export const VFX = {
  particles: [],
  afters: [],
  shakeT: 0, shakeMag: 0,
  hitstopT: 0,
  vignette: 0.18,
};

export function addSpark(x,y,dir,color='#ffd26f'){
  for(let i=0;i<6;i++){
    VFX.particles.push({x,y,vx:dir*(120+Math.random()*180),vy:-80+Math.random()*160,life:0.25,t:0,c:color,s:1});
  }
}
export function addDust(x,y,count=6){
  for(let i=0;i<count;i++) VFX.particles.push({x,y,vx:(Math.random()*2-1)*60,vy:-40+Math.random()*80,life:0.4,t:0,c:'#c2b280',s:1});
}
export function addAfterimage(x,y,w,h,dir,color='#dfe6ff',life=0.18){
  VFX.afters.push({x,y,w,h,dir,color,t:0,life});
}
export function addFlash(duration=0.08){ VFX.hitstopT = Math.max(VFX.hitstopT, duration); }
export function addShake(mag=3, t=0.12){ VFX.shakeMag = Math.max(VFX.shakeMag, mag); VFX.shakeT = Math.max(VFX.shakeT, t); }

export function stepVFX(dt){
  // hitstop
  if(VFX.hitstopT>0){ VFX.hitstopT=Math.max(0,VFX.hitstopT-dt); }
  // shake
  if(VFX.shakeT>0){ VFX.shakeT=Math.max(0,VFX.shakeT-dt); }
  // partículas
  for(let i=VFX.particles.length-1;i>=0;i--){
    const p=VFX.particles[i]; p.t+=dt; if(p.t>p.life){ VFX.particles.splice(i,1); continue; }
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=900*dt; // gravidade leve
    p.s = 1 - p.t/p.life;
  }
  // afterimages
  for(let i=VFX.afters.length-1;i>=0;i--){
    const a=VFX.afters[i]; a.t+=dt; if(a.t>a.life){ VFX.afters.splice(i,1); continue; }
  }
}

export function applyCameraShake(ctx){
  if(VFX.shakeT<=0) return;
  const k = VFX.shakeT; const m = VFX.shakeMag*(0.3+0.7*k);
  const dx = (Math.random()*2-1)*m, dy=(Math.random()*2-1)*m;
  ctx.translate(dx, dy);
}

export function drawVFX(ctx){
  // afterimages
  for(const a of VFX.afters){
    const alpha = 1 - a.t/a.life;
    ctx.save(); ctx.globalAlpha = 0.25*alpha; ctx.fillStyle=a.color;
    ctx.fillRect(a.x, a.y, a.w, a.h);
    ctx.restore();
  }
  // partículas
  for(const p of VFX.particles){
    const alpha = 1 - p.t/p.life; const r = 2+3*p.s;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
}

export function postProcess(ctx, W, H){
  // vignette simples
  const grad = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25, W/2,H/2, Math.max(W,H)*0.7);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${VFX.vignette})`);
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);
  // grain leve
  ctx.globalAlpha = 0.05; for(let i=0;i<40;i++){ const x=Math.random()*W,y=Math.random()*H; ctx.fillStyle='#fff'; ctx.fillRect(x,y,1,1);} ctx.globalAlpha=1;
}
