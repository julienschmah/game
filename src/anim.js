// Sistema simples de estados e parâmetros de animação
// Evita alocações em loop e facilita ajustes visuais

export function updateAnim(entity, desired, dt){
  if(!entity.anim) entity.anim = {state:'idle', t:0};
  if(entity.anim.state !== desired){ entity.anim.state = desired; entity.anim.t = 0; }
  else entity.anim.t += dt;
}

export function playerStateFrom(player){
  if(player.hp<=0) return 'dead';
  if(player.iframes>0 && player.rollCd>0 && player.vx!==0) return 'roll';
  if(player.parryWindow>0) return 'parry';
  if(player.comboTimer>0){
    return player.comboStep===1? 'attack1' : player.comboStep===2? 'attack2' : 'attack3';
  }
  if(!player.onGround && Math.abs(player.vy)>40) return 'air';
  if(Math.abs(player.vx)>30) return 'run';
  return 'idle';
}

export function enemyStateFrom(e){
  if(!e.alive) return 'dead';
  if(e.stun>0) return 'stunned';
  if(e.state==='attack') return 'attack';
  if(e.state==='chase') return 'run';
  return 'idle';
}

export function bossStateFrom(b){
  if(!b.alive) return 'dead';
  if(b.stun>0) return 'stunned';
  if(b.state==='slash') return 'attack';
  if(b.state==='chase') return 'run';
  return b.state || 'idle';
}

// Parâmetros visuais para cada estado
export function animParams(state, t){
  switch(state){
    case 'idle': return { bobY: Math.sin(t*2)*1.5, swing:0, tilt:0 };
    case 'run': return { bobY: Math.sin(t*16)*2.5, swing: Math.sin(t*10)*3, tilt: Math.sin(t*8)*0.06 };
    case 'air': return { bobY: 0, swing:0, tilt:0.1 };
    case 'roll': return { bobY: 0, swing:0, tilt:0, after: true };
    case 'attack1': return { bobY: -1, swing:6*Math.sin(Math.min(1,t)*Math.PI), tilt:0.04 };
    case 'attack2': return { bobY: -1, swing:8*Math.sin(Math.min(1,t)*Math.PI), tilt:0.06 };
    case 'attack3': return { bobY: -1, swing:10*Math.sin(Math.min(1,t)*Math.PI), tilt:0.08 };
    case 'parry': return { bobY: 0, swing:0, tilt:0, aura:true };
    case 'stunned': return { bobY: 0, swing:0, tilt:-0.08 };
    case 'attack': return { bobY: 0, swing:6*Math.sin(Math.min(1,t)*Math.PI), tilt:0.05 };
    case 'dead': return { bobY: 0, swing:0, tilt:0 };
    default: return { bobY:0, swing:0, tilt:0 };
  }
}
