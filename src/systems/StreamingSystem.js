import { TILE } from './shared.js';

// Very lightweight streaming/chunking system scaffold. It swaps chunks when camera crosses thresholds.
export class StreamingSystem {
  constructor(scene){
    this.scene = scene;
    this.loadedChunks = new Map(); // key -> {solid,deco,enemies,traps}
    this.currentKey = null;
  }
  keyFromX(x){
    const chunkWidthTiles = 32; // 32 tiles per chunk
    const chunkWidth = chunkWidthTiles * TILE;
    const k = Math.floor(x / chunkWidth);
    return `c${k}`;
  }
  ensureChunk(key){
    if(this.loadedChunks.has(key)) return;
    const provider = this.scene.levelProvider;
    if(!provider) return;
    const chunk = provider(key);
    if(chunk){
      this.loadedChunks.set(key, chunk);
      // Merge into scene level data (append to the right)
      this.scene.addChunk(chunk);
    }
  }
  update(){
    const cam = this.scene.camera;
    if(!cam) return;
    const key = this.keyFromX(cam.x);
    if(this.currentKey!==key){
      this.currentKey = key;
      // Preload current, previous and next
      const kNum = parseInt(key.slice(1),10);
      [kNum-1,kNum,kNum+1].forEach(n => this.ensureChunk(`c${n}`));
    }
  }
}
