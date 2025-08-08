import { drawRoundedRect } from '../utils.js';
import { TILE } from './shared.js';

export class RenderSystem{
  constructor(scene, ctx){ this.scene=scene; this.ctx=ctx; }
  drawBackground(){ const ctx=this.ctx, W=ctx.canvas.width, H=ctx.canvas.height; const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0b0c11'); g.addColorStop(1,'#11131a'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
  drawTiles(){ const { ctx }=this; const L=this.scene.level; for(let y=0;y<L.length;y++){ for(let x=0;x<L[0].length;x++){ const t=L[y][x]; const px=x*TILE, py=y*TILE; if(t==='1'){ ctx.fillStyle=((x+y)&1)?'#171922':'#1d1f28'; ctx.fillRect(px,py,TILE,TILE);} else if(t==='2'){ ctx.strokeStyle='#3f4457'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(px,py+TILE-10); ctx.lineTo(px+TILE,py+TILE-10); ctx.stroke(); } else if(t==='4'){ ctx.fillStyle='#2a2a33'; drawRoundedRect(ctx,px+18,py+28,12,16,4); ctx.fill(); const tt=performance.now()/1000+(x+y); const h=10+Math.sin(tt*7)*3; ctx.fillStyle='#f90'; ctx.beginPath(); ctx.moveTo(px+24, py+26-h); ctx.quadraticCurveTo(px+12, py+30, px+24, py+46); ctx.quadraticCurveTo(px+36, py+30, px+24, py+26-h); ctx.fill(); } }} }
  drawDeco(){ const { ctx }=this; for(const d of this.scene.levelData.deco){ const x=d.tx*TILE, y=d.ty*TILE; if(d.type==='torch'){ ctx.fillStyle='#2a2a33'; drawRoundedRect(ctx,x+18,y+28,12,16,4); ctx.fill(); const tt=performance.now()/1000+(x+y); const h=10+Math.sin(tt*7)*3; ctx.fillStyle='#f9a825'; ctx.beginPath(); ctx.moveTo(x+24, y+26-h); ctx.quadraticCurveTo(x+12, y+30, x+24, y+46); ctx.quadraticCurveTo(x+36, y+30, x+24, y+26-h); ctx.fill(); } }}
  drawEntities(){ const { ctx }=this; const p=this.scene.player; if(p){ ctx.fillStyle='#0009'; ctx.beginPath(); ctx.ellipse(p.x+p.w/2,p.y+p.h,p.w*0.5,6,0,0,Math.PI*2); ctx.fill(); // corpo com shading
      const grad=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h); grad.addColorStop(0,'#eceef6'); grad.addColorStop(1,'#cfd3e6'); ctx.fillStyle=grad; drawRoundedRect(ctx,p.x,p.y,p.w,p.h,8); ctx.fill(); // arma detalhada
      ctx.save(); ctx.translate(p.x+p.w/2,p.y+10); ctx.rotate(0.05*p.dir); ctx.scale(p.dir,1); const g2=ctx.createLinearGradient(0,0,24,0); g2.addColorStop(0,'#dfe6ff'); g2.addColorStop(1,'#9aa3d9'); ctx.fillStyle=g2; ctx.fillRect(6,-2,22,3); ctx.fillStyle='#9aa3d9'; ctx.fillRect(2,-3,6,6); ctx.restore(); }
      for(const e of this.scene.enemies){ ctx.fillStyle='#0009'; ctx.beginPath(); ctx.ellipse(e.x+e.w/2,e.y+e.h,e.w*0.5,6,0,0,Math.PI*2); ctx.fill(); const grad=ctx.createLinearGradient(e.x,e.y,e.x,e.y+e.h); grad.addColorStop(0,'#d78383'); grad.addColorStop(1,'#9e3f3f'); ctx.fillStyle=grad; drawRoundedRect(ctx,e.x,e.y,e.w,e.h,8); ctx.fill(); }
      if(this.scene.fog?.active){ ctx.fillStyle='#99a3ff77'; ctx.fillRect(this.scene.fog.x,this.scene.fog.y,this.scene.fog.w,this.scene.fog.h); }
  }
}
