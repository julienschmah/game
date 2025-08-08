// Pequenas utilidades
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => t*t*(3-2*t);
export const dist2 = (ax, ay, bx, by) => {
  const dx = ax - bx, dy = ay - by; return dx*dx + dy*dy;
};

export class RNG {
  constructor(seed=1234567){ this.s = seed >>> 0; }
  next(){ this.s = (1664525*this.s + 1013904223) >>> 0; return this.s/2**32; }
  range(a,b){ return a + (b-a)*this.next(); }
  pick(arr){ return arr[(this.next()*arr.length)|0]; }
}

export function drawRoundedRect(ctx, x,y,w,h,r){
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}
