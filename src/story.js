const box = document.createElement('div');
box.id = 'storyBox';
box.className = 'hidden';
box.innerHTML = '<div class="txt"></div><div class="hint">[Espaço] Continuar</div>';
document.body.appendChild(box);
const txt = box.querySelector('.txt');

let queue = [];
let onEnd = null;

export function showTexts(arr, done){
  queue = arr.slice(0);
  onEnd = done||null;
  txt.textContent = '';
  box.classList.remove('hidden');
  next();
}

function next(){
  if(queue.length===0){ box.classList.add('hidden'); if(onEnd) onEnd(); return; }
  txt.textContent = queue.shift();
}

function onKey(e){
  if(e.code==='Space' || e.key===' '){ e.preventDefault(); if(!box.classList.contains('hidden')) next(); }
}
window.addEventListener('keydown', onKey);
