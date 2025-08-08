// Pequeno motor com Scene/Systems e loop
export class Engine {
  constructor(ctx, width, height){
    this.ctx = ctx; this.W=width; this.H=height;
    this.scene = null; this.last = performance.now();
    this.running = false;
  }
  setScene(scene){ if(this.scene && this.scene.onExit) this.scene.onExit(); this.scene = scene; if(scene.onEnter) scene.onEnter(this); }
  start(){ if(this.running) return; this.running=true; const tick = (now)=>{ if(!this.running) return; const dt = Math.min(1/30,(now-this.last)/1000); this.last=now; if(this.scene) this.scene.update(dt, this); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
}

export class Scene {
  constructor(){ this.systems = []; }
  onEnter(engine){}
  onExit(){}
  add(system){ this.systems.push(system); return system; }
  update(dt, engine){ for(const s of this.systems){ if(s.pre) s.pre(dt, engine); if(s.update) s.update(dt, engine); if(s.post) s.post(dt, engine);} }
}
