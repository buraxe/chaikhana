/**
 * Procedural sound effects. Everything is synthesised with WebAudio at play time: no files.
 * There is deliberately no ambience here; real coffeehouse recordings come later.
 */
export type Sfx =
  | 'click' | 'stone' | 'checker' | 'dice' | 'tile' | 'tileDraw' | 'ball' | 'cushion' | 'pocket' | 'cue'
  | 'card' | 'page' | 'flag' | 'reveal' | 'boom' | 'win' | 'lose' | 'draw' | 'whistle' | 'goal' | 'tea'
  | 'error' | 'slide' | 'peg' | 'splash' | 'hit' | 'sink' | 'pop';

let ctx: AudioContext | null = null, master: GainNode | null = null, noise: AudioBuffer | null = null;
let enabled = true;
export const setSoundEnabled = (on: boolean) => { enabled = on; };
export const soundEnabled = () => enabled;

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}
// Browsers only start audio after a gesture: wake the context on the first one.
if (typeof window !== 'undefined') {
  const wake = () => { ac(); window.removeEventListener('pointerdown', wake); window.removeEventListener('keydown', wake); };
  window.addEventListener('pointerdown', wake); window.addEventListener('keydown', wake);
}

type Env = { at?: number; a?: number; d: number; v: number };
function tone(c: AudioContext, f: number, e: Env, type: OscillatorType = 'sine', glide?: number) {
  const t = c.currentTime + (e.at ?? 0), o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + e.d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(e.v, t + (e.a ?? 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + e.d);
  o.connect(g).connect(master!); o.start(t); o.stop(t + e.d + 0.02);
  return o;
}
function burst(c: AudioContext, e: Env, filter: BiquadFilterType, f: number, q = 1, sweep?: number) {
  const t = c.currentTime + (e.at ?? 0), s = c.createBufferSource(), bq = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noise; s.playbackRate.value = 0.8 + Math.random() * 0.4;
  bq.type = filter; bq.frequency.setValueAtTime(f, t); bq.Q.value = q; if (sweep) bq.frequency.exponentialRampToValueAtTime(sweep, t + e.d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(e.v, t + (e.a ?? 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + e.d);
  s.connect(bq).connect(g).connect(master!); s.start(t, Math.random() * 0.5); s.stop(t + e.d + 0.02);
}
const jit = (x: number, p = 0.06) => x * (1 + (Math.random() * 2 - 1) * p);

/** Plays one effect. `v` scales loudness (0–1), e.g. by how hard two balls met. */
export function sfx(name: Sfx, v = 1) {
  if (!enabled) return;
  const c = ac(); if (!c || !master) return;
  v = Math.max(0.05, Math.min(1, v));
  switch (name) {
    case 'click': burst(c, { d: 0.03, v: 0.18 * v }, 'highpass', 3000); tone(c, jit(1700), { d: 0.04, v: 0.06 * v }); break;
    case 'stone': // a stone set down on a wooden board
      tone(c, jit(320), { d: 0.09, v: 0.35 * v }, 'sine', 180); burst(c, { d: 0.05, v: 0.3 * v }, 'bandpass', jit(2200), 1.4); break;
    case 'checker': // a tavla checker clacked onto a point
      burst(c, { d: 0.06, v: 0.45 * v }, 'bandpass', jit(1400), 2.5); tone(c, jit(190), { d: 0.1, v: 0.3 * v }, 'sine', 120);
      burst(c, { at: 0.035, d: 0.04, v: 0.15 * v }, 'bandpass', jit(1800), 3); break;
    case 'dice': { // two dice rattling in the hand, then landing
      for (let k = 0; k < 9; k++) burst(c, { at: k * 0.035 + Math.random() * 0.02, d: 0.025, v: (0.12 + Math.random() * 0.15) * v }, 'bandpass', jit(3200, 0.25), 4);
      for (let k = 0; k < 4; k++) { const at = 0.36 + k * (0.07 - k * 0.012); burst(c, { at, d: 0.05, v: (0.45 - k * 0.09) * v }, 'bandpass', jit(1600, 0.2), 2.5); tone(c, jit(240), { at, d: 0.06, v: (0.22 - k * 0.04) * v }); }
      break; }
    case 'tile': // an okey tile set down
      burst(c, { d: 0.04, v: 0.42 * v }, 'bandpass', jit(2800), 3.5); tone(c, jit(880), { d: 0.05, v: 0.12 * v }, 'triangle');
      burst(c, { at: 0.028, d: 0.03, v: 0.2 * v }, 'bandpass', jit(3400), 4); break;
    case 'tileDraw': burst(c, { d: 0.09, v: 0.16 * v }, 'bandpass', 2000, 1.2, 4500); burst(c, { at: 0.08, d: 0.035, v: 0.3 * v }, 'bandpass', jit(2900), 3.5); break;
    case 'ball': tone(c, jit(2500, 0.1), { d: 0.03, v: 0.4 * v }); tone(c, jit(3700, 0.1), { d: 0.02, v: 0.25 * v }); burst(c, { d: 0.015, v: 0.25 * v }, 'highpass', 5000); break;
    case 'cushion': tone(c, jit(130), { d: 0.09, v: 0.35 * v }); burst(c, { d: 0.06, v: 0.2 * v }, 'lowpass', 700); break;
    case 'pocket': burst(c, { d: 0.32, v: 0.3 * v }, 'lowpass', 900, 1, 200); tone(c, 95, { at: 0.26, d: 0.12, v: 0.4 * v }); burst(c, { at: 0.26, d: 0.05, v: 0.2 * v }, 'bandpass', 900, 2); break;
    case 'cue': burst(c, { d: 0.03, v: 0.4 * v }, 'bandpass', 1800, 1.5); tone(c, jit(700), { d: 0.05, v: 0.2 * v }, 'triangle'); break;
    case 'card': burst(c, { d: 0.12, v: 0.25 * v }, 'bandpass', 1800, 0.9, 6500); burst(c, { at: 0.1, d: 0.03, v: 0.18 * v }, 'highpass', 2500); break;
    case 'page': for (let k = 0; k < 3; k++) burst(c, { at: k * 0.07, a: 0.03, d: 0.16, v: (0.18 - k * 0.04) * v }, 'bandpass', jit(2400, 0.3), 0.7, jit(5200, 0.2)); break;
    case 'flag': tone(c, 620, { d: 0.07, v: 0.2 * v }, 'triangle', 900); break;
    case 'reveal': tone(c, jit(1250), { d: 0.04, v: 0.12 * v }); burst(c, { d: 0.02, v: 0.1 * v }, 'highpass', 4000); break;
    case 'pop': tone(c, jit(500), { d: 0.06, v: 0.25 * v }, 'sine', 1100); break;
    case 'slide': burst(c, { a: 0.02, d: 0.14, v: 0.16 * v }, 'bandpass', 900, 1, 1600); break;
    case 'peg': tone(c, jit(1500), { d: 0.05, v: 0.18 * v }, 'triangle'); burst(c, { d: 0.03, v: 0.15 * v }, 'bandpass', 3500, 3); break;
    case 'boom': burst(c, { a: 0.005, d: 0.7, v: 0.6 * v }, 'lowpass', 1200, 0.7, 90); tone(c, 70, { d: 0.5, v: 0.5 * v }, 'sine', 35); break;
    case 'splash': burst(c, { a: 0.01, d: 0.35, v: 0.3 * v }, 'bandpass', 1500, 0.6, 500); break;
    case 'hit': burst(c, { d: 0.4, v: 0.45 * v }, 'lowpass', 2000, 0.8, 150); tone(c, 110, { d: 0.25, v: 0.35 * v }, 'sawtooth', 50); break;
    case 'sink': [392, 330, 262, 196].forEach((f, k) => tone(c, f, { at: k * 0.12, d: 0.2, v: 0.18 * v }, 'triangle')); break;
    case 'win': [523, 659, 784, 1047].forEach((f, k) => { tone(c, f, { at: k * 0.09, d: 0.35, v: 0.2 * v }, 'triangle'); tone(c, f * 2, { at: k * 0.09, d: 0.2, v: 0.04 * v }); }); break;
    case 'lose': tone(c, 392, { d: 0.25, v: 0.2 * v }, 'triangle'); tone(c, 311, { at: 0.22, d: 0.45, v: 0.2 * v }, 'triangle', 280); break;
    case 'draw': tone(c, 440, { d: 0.22, v: 0.16 * v }, 'triangle'); tone(c, 440, { at: 0.2, d: 0.3, v: 0.14 * v }, 'triangle'); break;
    case 'whistle': { const o = tone(c, 2900, { a: 0.01, d: 0.42, v: 0.18 * v }); const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 28; lg.gain.value = 120; lfo.connect(lg).connect(o.frequency); lfo.start(); lfo.stop(c.currentTime + 0.45); break; }
    case 'goal': [523, 659, 784].forEach((f, k) => tone(c, f, { at: k * 0.07, d: 0.5, v: 0.16 * v }, 'square')); tone(c, 1047, { at: 0.24, d: 0.6, v: 0.14 * v }, 'triangle'); break;
    case 'tea': tone(c, 2637, { d: 0.5, v: 0.12 * v }); tone(c, 3951, { d: 0.35, v: 0.07 * v }); tone(c, 2637 * 1.5, { at: 0.09, d: 0.4, v: 0.08 * v }); break;
    case 'error': tone(c, 160, { d: 0.14, v: 0.18 * v }, 'square'); break;
  }
}
