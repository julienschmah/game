import { TILE } from './shared.js';
import { Keys } from '../input.js';

export class CombatSystem {
  constructor(scene){
    this.scene = scene;
    this.hitstopTime = 0;
    this.attackHeld = false;
  }
  preUpdate(dt){
    if(this.hitstopTime>0){
      this.hitstopTime -= dt;
    }
  }
  update(dt){
    const { player, enemies, boss, vfx } = this.scene;
    if(!player) return;

    // Handle attack input (edge)
    const pressed = Keys.attack && !this.attackHeld;
    this.attackHeld = Keys.attack;
    if(pressed && player.attackTimer<=0){
      player.isAttacking = true;
    }

    if(player.attackTimer>0){
      player.attackTimer -= dt;
    }

    if(player.isAttacking && player.attackTimer<=0){
      const range = 32;
      const dir = player.dir || Math.sign(player.vx||1) || 1;
      const px = player.x + dir * (player.w*0.6);
      const py = player.y + player.h*0.5;
      const targets = [...(enemies||[]), boss].filter(Boolean);
      let hit = false;
      for(const e of targets){
        if(e.dead) continue;
        const ex = e.x + e.w*0.5;
        const ey = e.y + e.h*0.5;
        const dx = Math.abs(px-ex);
        const dy = Math.abs(py-ey);
        if(dx < (e.w*0.5 + range) && dy < (e.h*0.5 + 20)){
          e.hp = Math.max(0, (e.hp??3) - (player.damage??1));
          e.hurtTimer = 0.12;
          e.vx = (e.vx||0) + dir * 140;
          if(e.hp===0) e.dead = true;
          hit = true;
        }
      }
      if(hit){
        this.hitstopTime = 0.06;
        if(vfx?.addShake) vfx.addShake(4, 0.08);
      }
      player.attackTimer = 0.25; // lock to avoid multi-hits per frame
    }

    // End attack for this frame
    player.isAttacking = false;

    // Parry window handling (placeholder)
    if(player.parryTimer>0){
      player.parryTimer -= dt;
    }
  }
  draw(ctx){
    // Could draw debug hitboxes if needed
  }
}
