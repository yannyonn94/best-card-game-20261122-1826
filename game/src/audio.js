// audio.js — all sounds are synthesised with WebAudio: no audio files, no network.
// A tiny synth: short oscillator blips with envelopes, plus a win arpeggio.
let ctx = null;
let muted = false;

export function setMuted(value) { muted = !!value; }
export function isMuted() { return muted; }

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, dur, type = 'sine', gain = 0.12, when = 0) {
  if (muted) return;
  try {
    const ac = audioCtx();
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + when;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch (e) { /* audio is cosmetic; never break the game */ }
}

export const sfx = {
  click() { blip(660, 0.07, 'triangle', 0.08); },
  select() { blip(740, 0.06, 'triangle', 0.07); blip(990, 0.06, 'triangle', 0.06, 0.05); },
  deal() { blip(520, 0.09, 'triangle', 0.1); blip(780, 0.09, 'triangle', 0.08, 0.07); },
  flip() { blip(440, 0.08, 'square', 0.05); blip(880, 0.1, 'sine', 0.09, 0.05); },
  hit() { blip(160, 0.18, 'sawtooth', 0.12); blip(90, 0.22, 'sine', 0.14, 0.02); },
  combo() { [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.14, 'triangle', 0.1, i * 0.07)); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, 0.22, 'triangle', 0.11, i * 0.09)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => blip(f, 0.25, 'sine', 0.1, i * 0.11)); },
  stage() { [262, 392, 523].forEach((f, i) => blip(f, 0.16, 'triangle', 0.1, i * 0.08)); },
};
