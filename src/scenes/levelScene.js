import { Scene } from '../core/engine.js';
import { World } from '../ecs/world.js';
import { Level1 } from '../level1.js';
import { Keys } from '../input.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';

const TILE = 48; const G = 2200;

export class LevelScene extends Scene{
  constructor(levelData){ super(); this.levelData = levelData; this.world = new World(); this.cam={x:0,y:0}; }
  onEnter(engine){ this.init(engine); }
  init(engine){
    const L=this.levelData;
    this.level=L.solid;
    this.player={x:L.playerStart.x,y:L.playerStart.y,w:28,h:44,dir:1,hp:100,maxHP:100,st:120,maxSt:120,vx:0,vy:0,onGround:false,damage:1,attackTimer:0};
    this.enemies=[]; for(const e of L.enemies){ this.enemies.push({type:e.type,x:e.x,y:e.y,w:28,h:46,dir:1,hp:60,maxHP:60,dead:false}); }
    this.fog={ active:true, x: (L.solid[0].length-2)*TILE, y: (L.solid.length-2)*TILE-48, w: 2*TILE, h: 2*TILE };

    // Systems
    this.render = new RenderSystem(this, engine.ctx);
    this.physics = new PhysicsSystem(this);
    this.combat = new CombatSystem(this);
    this.systems = [
      { pre: (dt)=>{}, update: (dt)=>this.physics.update(dt), post: (dt)=>{} },
      { pre: (dt)=>this.combat.preUpdate(dt), update: (dt)=>this.combat.update(dt), post: (dt)=>{} },
      { pre: (dt,eng)=>this.updateCamera(eng), update: (dt,eng)=>this.draw(eng), post: (dt)=>{} },
    ];
  }

  tileAt(x,y){
    const cx = Math.floor(x / TILE), cy = Math.floor(y / TILE);
    if(cy < 0 || cy >= this.level.length || cx < 0 || cx >= this.level[0].length) return '0';
    return this.level[cy][cx];
  }
  rectVsLevel(ax, ay, aw, ah, vx, vy){
    let hitX=false, hitY=false, plat=false; const nx=ax+vx, ny=ay+vy;
    const mincx=Math.floor((Math.min(ax,nx))/TILE)-1, maxcx=Math.floor((Math.max(ax+aw,nx+aw))/TILE)+1;
    const mincy=Math.floor((Math.min(ay,ny))/TILE)-1, maxcy=Math.floor((Math.max(ay+ah,ny+ah))/TILE)+1;
    let px=nx, py=ny;
    for(let cy=mincy; cy<=maxcy; cy++){
      for(let cx=mincx; cx<=maxcx; cx++){
        const t=(this.level[cy] && this.level[cy][cx])||'0'; if(t==='0' || t==='3' || t==='4') continue;
        const tx=cx*TILE, ty=cy*TILE, tw=TILE, th=TILE;
        if(t==='2'){ // plataforma
          if(vy>0 && ay+ah<=ty && ny+ah>ty){ py=ty-ah; hitY=true; plat=true; }
          continue;
        }
        if(nx+aw>tx && nx<tx+tw && ay+ah>ty && ay<ty+th){ if(vx>0) px=tx-aw; else if(vx<0) px=tx+tw; hitX=true; }
        if(px+aw>tx && px<tx+tw && ny+ah>ty && ny<ty+th){ if(vy>0) py=ty-ah; else if(vy<0) py=ty+th; hitY=true; }
      }
    }
    return {x:px,y:py,hitX,hitY,plat};
  }

  updateCamera(engine){
    const p=this.player; const W=engine.W, H=engine.H; const Lw=this.level[0].length*TILE, Lh=this.level.length*TILE;
    const tx=Math.max(0, Math.min(Lw-W, p.x + p.w/2 - W/2));
    const ty=Math.max(0, Math.min(Lh-H, p.y + p.h/2 - H/2));
    this.cam.x += (tx - this.cam.x)*0.1; this.cam.y += (ty - this.cam.y)*0.1;
  }

  draw(engine){
    const ctx=engine.ctx; ctx.clearRect(0,0,engine.W,engine.H);
    this.render.drawBackground();
    ctx.save(); ctx.translate(-this.cam.x, -this.cam.y);
    this.render.drawTiles();
    this.render.drawDeco();
    this.render.drawEntities();
    ctx.restore();
  }
}

export function createLevel1Scene(){ return new LevelScene(Level1); }
