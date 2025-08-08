// Stubs para SFX simples (bips synth com WebAudio)
const ctxAudio = new (window.AudioContext||window.webkitAudioContext)();
function beep(freq=220, time=0.06, type='square', vol=0.02){
  const o = ctxAudio.createOscillator(); const g = ctxAudio.createGain();
  o.type = type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(ctxAudio.destination);
  const now = ctxAudio.currentTime; o.start(now); o.stop(now+time);
  g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now+time);
}
export const SFX = {
  hit(){ beep(160,0.05,'square',0.03); },
  parry(){ beep(880,0.08,'triangle',0.025); },
  roll(){ beep(300,0.04,'sawtooth',0.02); },
  die(){ beep(90,0.2,'sine',0.03); },
  fire(){ beep(500,0.03,'triangle',0.01); },
  ui(){ beep(600,0.05,'square',0.02); }
};
