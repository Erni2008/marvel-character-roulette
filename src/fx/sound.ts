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
    load();
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
/* ---- recorded samples (Kenney, CC0) ---- */
const names = ['shuffle', 'fan', 'slide1', 'slide2', 'slide3', 'place', 'shove', 'chip', 'tick', 'click', 'correct', 'fail', 'beep', 'open'] as const;
type Sample = (typeof names)[number];
const buffers = new Map<Sample, AudioBuffer>();
let loading = false;
function load() {
  const c = audio();
  if (!c || loading) return;
  loading = true;
  for (const n of names)
    fetch(`${import.meta.env.BASE_URL}sfx/${n}.m4a`)
      .then((r) => r.arrayBuffer())
      .then((b) => new Promise<AudioBuffer>((ok, bad) => c.decodeAudioData(b, ok, bad)))
      .then((buf) => buffers.set(n, buf))
      .catch(() => {});
}
function play(n: Sample, gain = 1, rate = 1, at = 0) {
  const c = audio(),
    buf = buffers.get(n);
  if (!c || !out || !buf || level <= 0) return false;
  const src = c.createBufferSource(),
    g = c.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  g.gain.value = gain;
  src.connect(g).connect(out);
  src.start(c.currentTime + at);
  return true;
}
const vary = (x = 0.08) => 1 + (Math.random() * 2 - 1) * x;
export const sfx = {
  tick: () => {
    if (!play('tick', 0.55, vary(0.12))) tone(1800, 0.03, 'square', 0.05);
  },
  whoosh: () => {
    noise(0.7, 0.3, 200, 2600);
    play('slide3', 0.8, 0.8);
  },
  flip: () => {
    play('slide2', 0.9, vary());
    play('place', 0.9, 1, 0.12);
  },
  riffle: () => {
    if (!play('shuffle', 1, vary(0.04))) for (let i = 0; i < 9; i++) noise(0.05, 0.18, 2500, 1400, i * 0.035);
  },
  slide: () => play(Math.random() < 0.5 ? 'slide1' : 'slide2', 0.7, vary(0.1)),
  reveal: () => {
    noise(1.1, 0.22, 5000, 180);
    tone(82, 1.6, 'sine', 0.45, 0, 41);
    tone(164, 1.2, 'triangle', 0.12, 0.02, 82);
    [392, 494, 587, 784].forEach((f, i) => tone(f, 1.6, 'sine', 0.05, 0.05 + i * 0.03));
    play('fan', 0.9);
  },
  correct: () => {
    play('correct', 1);
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.6, 'sine', 0.07, 0.05 + i * 0.07));
  },
  fail: () => {
    if (!play('fail', 1)) tone(196, 0.5, 'sawtooth', 0.12, 0, 98);
    tone(110, 0.8, 'sine', 0.25, 0, 55);
  },
  beep: (urgent = false) => {
    if (!play('beep', urgent ? 1 : 0.7, urgent ? 1.25 : 1)) tone(urgent ? 1320 : 880, 0.09, 'sine', 0.2);
  },
  click: () => {
    if (!play('click', 0.6, vary(0.05))) tone(1600, 0.03, 'triangle', 0.08);
  },
  open: () => play('open', 0.6),
};
