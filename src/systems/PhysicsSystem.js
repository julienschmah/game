import { TILE } from './shared.js';
import { Keys } from '../input.js';

export class PhysicsSystem{
  constructor(scene){ this.scene=scene; this.G=2200; this.coyote=0; }
  tileAt(x,y){ return this.scene.tileAt(x,y); }
  rectVsLevel(ax, ay, aw, ah, vx, vy){ return this.scene.rectVsLevel(ax,ay,aw,ah,vx,vy); }
  update(dt){
    const p=this.scene.player; if(!p) return;
    // movimento horizontal com entrada do usuário
    const spd=180; const air=0.75; const acc=8.0; // acc como taxa de interpolação por segundo
    let ax=0; if(Keys.left) ax-=1; if(Keys.right) ax+=1; if(ax) p.dir=Math.sign(ax);
    const targetVx=ax*spd*(p.onGround?1:air);
    const t=1-Math.exp(-acc*dt); // suavização baseada em segundos
    p.vx = p.vx + (targetVx - p.vx)*t;

    // gravidade e colisões
    p.vy += this.G*dt;
    const col=this.rectVsLevel(p.x,p.y,p.w,p.h,p.vx*dt,p.vy*dt);
    p.x=col.x; p.y=col.y; if(col.hitX) p.vx=0; if(col.hitY){ p.vy=0; p.onGround=true; this.coyote=0.1; } else { p.onGround=false; this.coyote=Math.max(0,this.coyote-dt);}    
    // limite de chão para evitar cair fora do mundo
    const Lw=this.scene.level[0].length*TILE, Lh=this.scene.level.length*TILE;
    if(p.y> Lh- p.h-4){ p.y=Lh-p.h-4; p.vy=0; p.onGround=true; }
    // wrap horizontal (sensação de continuidade)
    if(p.x < -p.w){ p.x = Lw-2; } else if(p.x > Lw){ p.x = 2; }
  }
}
