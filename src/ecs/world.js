// Entidades e componentes simples
export class World {
  constructor(){ this.entities = new Set(); this.toAdd=[]; this.toRemove=new Set(); }
  create(data={}){ const e=Object.assign({id:crypto.randomUUID?.()||Math.random().toString(36).slice(2)}, data); this.toAdd.push(e); return e; }
  destroy(e){ this.toRemove.add(e); }
  commit(){
    for(const e of this.toAdd) this.entities.add(e); this.toAdd.length=0;
    for(const e of this.toRemove) this.entities.delete(e); this.toRemove.clear();
  }
  query(filter){ const out=[]; for(const e of this.entities){ if(filter(e)) out.push(e);} return out; }
}
