export const Keys = {
  left: false, right: false, up: false, down: false,
  attack: false, roll: false, parry: false, interact: false
};
const map = new Map([
  // use lowercase keys because we call toLowerCase() on event.key
  ["arrowleft","left"],["arrowright","right"],["arrowup","up"],["arrowdown","down"],
  ["a","left"],["d","right"],["w","up"],["s","down"],
  ["j","attack"],["k","roll"],["l","parry"],["e","interact"]
]);

const set = (e, v) => {
  const k = map.get(e.key.toLowerCase());
  if(!k) return;
  Keys[k] = v;
  if(["attack","roll","parry","interact"].includes(k)) e.preventDefault();
};

export function setupInput(){
  window.addEventListener('keydown', e=> set(e, true));
  window.addEventListener('keyup', e=> set(e, false));
}
