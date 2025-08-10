const THREE = window.THREE;

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(canvas.width, canvas.height, false);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1016);
scene.fog = new THREE.Fog(0x0e1016, 20, 80);

const camera = new THREE.PerspectiveCamera(60, canvas.width/canvas.height, 0.1, 200);

const hemi = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.9); scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(12,18,6); dir.castShadow = true; dir.shadow.mapSize.set(2048,2048); scene.add(dir);

const groundGeo = new THREE.PlaneGeometry(200,200);
const groundMat = new THREE.MeshStandardMaterial({ color:0x262a34, roughness:0.95, metalness:0.02 });
const ground = new THREE.Mesh(groundGeo, groundMat); ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

function makeCapsule(r=0.45, h=1.7, color=0xffffff){
  const geo = new THREE.CapsuleGeometry(r, Math.max(0.01,h-2*r), 8, 16);
  const mat = new THREE.MeshStandardMaterial({ color, roughness:0.6, metalness:0.08 });
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}

function addRocks(){
  const g = new THREE.BoxGeometry(1,1,1);
  for(let i=0;i<30;i++){
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color:0x2f3442, roughness:0.9 }));
    m.castShadow = true; m.receiveShadow = true;
    const s = 0.6 + Math.random()*2.2; m.scale.set(s, s*(0.5+Math.random()*1.5), s);
    m.position.set((Math.random()-0.5)*60, m.scale.y/2, (Math.random()-0.5)*60);
    scene.add(m);
  }
}
addRocks();

const player = new THREE.Group();
const body = makeCapsule(0.42, 1.7, 0xe7ebff); body.position.y = 0.85; player.add(body);
const swordGeo = new THREE.BoxGeometry(0.9, 0.08, 0.12);
const swordMat = new THREE.MeshStandardMaterial({ color:0x9aa3d9, metalness:0.7, roughness:0.35 });
const sword = new THREE.Mesh(swordGeo, swordMat); sword.castShadow = true; sword.position.set(0.55, 0.6, 0); player.add(sword);
scene.add(player);

const state = { hp:100, maxHP:100, st:120, maxST:120, souls:0 };

const keys = { w:0,a:0,s:0,d:0, space:0, attack:0 };
window.addEventListener('keydown', e=>{ const k=e.key.toLowerCase(); if(['w','a','s','d'].includes(k)) keys[k]=1; if(k===' ') keys.space=1; if(k==='j') keys.attack=1; });
window.addEventListener('keyup', e=>{ const k=e.key.toLowerCase(); if(['w','a','s','d'].includes(k)) keys[k]=0; if(k===' ') keys.space=0; if(k==='j') keys.attack=0; });

let yaw = 0; let vx=0, vz=0, vy=0; let onGround=true; let atkTimer=0, atkWindow=0;

const menuRoot = document.getElementById('menuRoot');
const btnStart = document.getElementById('btnStart');
const btnFull = document.getElementById('btnFull');
let paused = true;
btnStart?.addEventListener('click', ()=>{ paused=false; menuRoot.classList.add('hiddenMenu'); canvas.requestPointerLock?.(); });
btnFull?.addEventListener('click', ()=>{ if(document.fullscreenElement){ document.exitFullscreen(); } else { document.documentElement.requestFullscreen?.(); }});

canvas.addEventListener('click', ()=>{ if(!paused) canvas.requestPointerLock?.(); });
window.addEventListener('mousemove', (e)=>{ if(document.pointerLockElement===canvas){ yaw -= e.movementX*0.0022; }});

function updateHUD(){
  const hpBar = document.getElementById('hpBar'); const hpText = document.getElementById('hpText');
  const stBar = document.getElementById('stBar'); const soulsText = document.getElementById('soulsText');
  if(hpBar) hpBar.style.width = Math.max(0, (state.hp/state.maxHP*100))+'%';
  if(hpText) hpText.textContent = 'HP';
  if(stBar) stBar.style.width = Math.max(0, (state.st/state.maxST*100))+'%';
  if(soulsText) soulsText.textContent = state.souls+' Souls';
}

const enemies = [];
for(let i=0;i<4;i++){
  const e = makeCapsule(0.42, 1.7, 0xc96f6f);
  e.position.set(4+i*3, 0.85, -3 + i*1.8);
  e.castShadow = true; scene.add(e);
  enemies.push({ mesh:e, hp:6, dead:false, vx:0, vz:0, vy:0, aggro:false });
}

function enemyUpdate(dt){
  for(const e of enemies){ if(e.dead) continue;
    const dx = e.mesh.position.x - player.position.x;
    const dz = e.mesh.position.z - player.position.z;
    const d2 = dx*dx + dz*dz; e.aggro = d2 < 100;
    if(e.aggro){
      const d = Math.hypot(dx,dz)||1; const nx = -dx/d, nz = -dz/d;
      const speed = 2.2; e.vx += (nx*speed - e.vx)*0.08; e.vz += (nz*speed - e.vz)*0.08;
    } else { e.vx *= 0.95; e.vz *= 0.95; }
    e.vy -= 18*dt; if(e.vy < -25) e.vy = -25;
    e.mesh.position.x += e.vx*dt; e.mesh.position.z += e.vz*dt; e.mesh.position.y += e.vy*dt;
    if(e.mesh.position.y < 0.85){ e.mesh.position.y = 0.85; e.vy = 0; }
  }
}

const skyGeo = new THREE.SphereGeometry(120, 32, 16);
const skyMat = new THREE.ShaderMaterial({
  uniforms:{ uTime:{value:0} }, side:THREE.BackSide,
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`varying vec2 vUv; uniform float uTime; void main(){ float t = uTime*0.05; float v = 0.08 + 0.08*sin(6.283*(vUv.y+t)) + 0.04*sin(6.283*(vUv.x*1.5-t)); vec3 col = mix(vec3(0.06,0.07,0.1), vec3(0.08,0.1,0.16), v); gl_FragColor=vec4(col,1.); }`
});
const sky = new THREE.Mesh(skyGeo, skyMat); scene.add(sky);

function step(dt){
  sky.material.uniforms.uTime.value += dt;
  if(paused) return;

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const mx = (keys.d?1:0) - (keys.a?1:0);
  const mz = (keys.w?1:0) - (keys.s?1:0);
  const accel = 12, air=0.55, maxSpd=5.2;
  const ax = (right.x*mx + forward.x*mz) * (onGround?accel:accel*air);
  const az = (right.z*mx + forward.z*mz) * (onGround?accel:accel*air);
  vx += (ax - vx)*0.12; vz += (az - vz)*0.12;
  const spd = Math.hypot(vx,vz); if(spd>maxSpd){ vx *= maxSpd/spd; vz *= maxSpd/spd; }

  if(keys.space && onGround){ vy = 7.2; onGround=false; }
  vy -= 20*dt; if(vy<-28) vy=-28;

  player.position.x += vx*dt; player.position.z += vz*dt; player.position.y += vy*dt;
  if(player.position.y < 0.85){ player.position.y=0.85; vy=0; onGround=true; }
  if(spd>0.02){ const face = Math.atan2(vx, vz); player.rotation.y = face; }

  const camOffset = new THREE.Vector3(0, 2.2, 4.8);
  const rotY = new THREE.Euler(0, yaw, 0, 'YXZ');
  const offset = camOffset.clone().applyEuler(rotY);
  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position.x, player.position.y+1.2, player.position.z);

  if(keys.attack && atkTimer<=0 && state.st>10){ atkTimer=0.38; atkWindow=0.16; state.st-=12; }
  if(atkTimer>0){ atkTimer-=dt; const t=1-(atkTimer/0.38); sword.rotation.z = Math.sin(t*Math.PI)*1.05; } else { sword.rotation.z = 0; }
  if(atkWindow>0){
    atkWindow -= dt;
    const dir = player.rotation.y; const sx = player.position.x + Math.sin(dir)*0.9; const sz = player.position.z + Math.cos(dir)*0.9;
    for(const e of enemies){ if(e.dead) continue; const dx=e.mesh.position.x-sx, dz=e.mesh.position.z-sz; if(dx*dx+dz*dz<1.0){ e.hp--; e.vx += Math.sin(dir)*6; e.vz += Math.cos(dir)*6; atkWindow=0; if(e.hp<=0){ e.dead=true; e.mesh.visible=false; state.souls+=50; } } }
  }

  enemyUpdate(dt);
  state.st = Math.min(state.maxST, state.st + 20*dt);
  updateHUD();
}

let last=performance.now();
function animate(now){
  const dt = Math.min(0.033,(now-last)/1000); last=now;
  step(dt); renderer.render(scene,camera); requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize', ()=>{
  const w=canvas.clientWidth||canvas.width, h=canvas.clientHeight||canvas.height;
  renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
});
