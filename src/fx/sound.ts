/** Tiny synthesized sound kit: no audio files, works offline, unlocked on the first tap (iOS). */
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let level = 0.6;
function audio() {
  if (!ctx) {
    const A = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!A) return null;
    ctx = new A();
    out = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    out.connect(comp).connect(ctx.destination);
    out.gain.value = level;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
export function setVolume(v: number) {
  level = Math.max(0, Math.min(1, v));
  if (out) out.gain.value = level;
}
export function unlockAudio() {
  const once = () => {
    audio();
    window.removeEventListener('pointerdown', once);
    window.removeEventListener('keydown', once);
  };
  window.addEventListener('pointerdown', once);
  window.addEventListener('keydown', once);
}
function tone(freq: number, dur: number, type: OscillatorType, gain: number, at = 0, slide?: number) {
  const c = audio();
  if (!c || !out || level <= 0) return;
  const t = c.currentTime + at,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function noise(dur: number, gain: number, from: number, to: number, at = 0) {
  const c = audio();
  if (!c || !out || level <= 0) return;
  const t = c.currentTime + at,
    buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate),
    d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(),
    f = c.createBiquadFilter(),
    g = c.createGain();
  src.buffer = buf;
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t);
}
export const sfx = {
  tick: () => {
    tone(2400, 0.035, 'square', 0.05);
    tone(900, 0.05, 'triangle', 0.08);
  },
  whoosh: () => noise(0.45, 0.35, 300, 3200),
  flip: () => noise(0.18, 0.3, 1800, 600),
  riffle: () => {
    for (let i = 0; i < 9; i++) noise(0.05, 0.18, 2500, 1400, i * 0.035);
  },
  reveal: () => {
    noise(0.9, 0.25, 4000, 200);
    [220, 330, 440, 554].forEach((f, i) => tone(f, 1.4, 'sawtooth', 0.05, i * 0.02));
    tone(110, 1.2, 'sine', 0.35, 0, 55);
  },
  correct: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, 'triangle', 0.18, i * 0.08));
    noise(0.6, 0.12, 6000, 9000, 0.2);
  },
  fail: () => {
    tone(196, 0.5, 'sawtooth', 0.12, 0, 98);
    tone(147, 0.6, 'sawtooth', 0.1, 0.12, 73);
  },
  beep: (urgent = false) => tone(urgent ? 1320 : 880, 0.09, 'sine', 0.2),
  click: () => tone(1600, 0.03, 'triangle', 0.08),
};
