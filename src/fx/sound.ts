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
function peg(speed: number) {
  const c = audio();
  if (!c || !out || level <= 0) return;
  const t = c.currentTime,
    len = 0.03,
    buf = c.createBuffer(1, Math.ceil(c.sampleRate * len), c.sampleRate),
    d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.0035));
  const src = c.createBufferSource(),
    bp = c.createBiquadFilter(),
    body = c.createBiquadFilter(),
    g = c.createGain();
  src.buffer = buf;
  bp.type = 'bandpass';
  bp.frequency.value = 2200 + speed * 1600 + Math.random() * 300;
  bp.Q.value = 3;
  body.type = 'peaking';
  body.frequency.value = 700;
  body.gain.value = 8;
  g.gain.value = 0.35 + speed * 0.4;
  src.connect(bp).connect(body).connect(g).connect(out);
  src.start(t);
  // tiny wooden body resonance
  const o = c.createOscillator(),
    og = c.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(420 + speed * 120, t);
  o.frequency.exponentialRampToValueAtTime(260, t + 0.04);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.09 + speed * 0.06, t + 0.002);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(og).connect(out);
  o.start(t);
  o.stop(t + 0.06);
}
/* ---- recorded samples (Kenney, CC0) ---- */
const names = ['shuffle', 'fan', 'fan2', 'pack1', 'pack2', 'slide1', 'slide2', 'slide3', 'slide4', 'slide5', 'slide7', 'slide8', 'place', 'place2', 'place3', 'place4', 'shove', 'shove2', 'shove3', 'chip', 'tick', 'click', 'correct', 'fail', 'beep', 'open'] as const;
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
function play(n: Sample, gain = 1, rate = 1, at = 0, offset = 0): false | { stop: (fade?: number) => void } {
  const c = audio(),
    buf = buffers.get(n);
  if (!c || !out || !buf || level <= 0) return false;
  const src = c.createBufferSource(),
    g = c.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  g.gain.value = gain;
  src.connect(g).connect(out);
  src.start(c.currentTime + at, offset);
  return {
    stop: (fade = 0.12) => {
      const t = c.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + fade);
      try {
        src.stop(t + fade + 0.02);
      } catch {
        /* already stopped */
      }
    },
  };
}
const vary = (x = 0.08) => 1 + (Math.random() * 2 - 1) * x;
const slides: Sample[] = ['slide1', 'slide2', 'slide4', 'slide5', 'slide7', 'slide8'],
  places: Sample[] = ['place', 'place2', 'place3', 'place4'],
  pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
type H = ReturnType<typeof play>;
/** A riffle "brrrt": many very short card slaps accelerating then easing. */
function burst(at: number, count: number, span: number, gain = 0.45): H[] {
  const out: H[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / (count - 1),
      t = at + span * (u * u * 0.35 + u * 0.65);
    out.push(play(pick(places), gain * (0.7 + Math.random() * 0.4), 1.5 + Math.random() * 0.6, t));
  }
  return out;
}
const shuffles: (() => H[])[] = [
  // 1. classic table riffle + bridge
  () => [play('shuffle', 1, 1.12)],
  // 2. bridge finish from the middle of the recording, then a soft fan
  () => [play('shuffle', 0.95, 1.0, 0, 0.55), play('fan2', 0.7, 1.05, 1.7)],
  // 3. double machine riffle
  () => [play('slide4', 0.6, 0.9), ...burst(0.25, 16, 0.6), play('shove2', 0.6, 1, 0.95), ...burst(1.15, 16, 0.6), play('place2', 0.8, 0.95, 1.85)],
  // 4. fan, cut, riffle
  () => [play('fan2', 0.8, 1.1), play('shove3', 0.7, 1, 0.55), ...burst(0.85, 14, 0.55, 0.5), play('fan', 0.7, 1.1, 1.5), play('place3', 0.8, 1, 1.95)],
  // 5. overhand shuffle: clusters of slides
  () => {
    const hs: H[] = [play('pack2', 0.6, 1.1)];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) hs.push(play(pick(slides), 0.45, 1.25 + Math.random() * 0.4, 0.3 + i * 0.28 + j * 0.06));
    hs.push(play('place4', 0.8, 1, 2.05));
    return hs;
  },
];
let lastShuffle = -1;
export const sfx = {
  /** Wheel peg hitting the flapper. `speed` 0..1 shapes loudness/brightness. */
  tick: (speed = 0.5) => peg(speed),
  thunk: () => {
    tone(70, 0.45, 'sine', 0.5, 0, 45);
    noise(0.25, 0.25, 900, 120);
    play('place2', 0.9, 0.7);
  },
  whoosh: () => {
    noise(0.9, 0.18, 300, 1800);
    play('slide3', 0.6, 0.75);
  },
  flip: () => {
    play('slide2', 0.9, vary());
    play('place', 0.9, 1, 0.12);
  },
  /** One of five shuffle performances (never the same twice in a row). Returns a stopper so the
   *  sound ends exactly when the deck settles. */
  riffle: () => {
    let k = Math.floor(Math.random() * shuffles.length);
    if (k === lastShuffle) k = (k + 1) % shuffles.length;
    lastShuffle = k;
    const hs = shuffles[k]();
    return () => hs.forEach((h) => h && h.stop(0.08));
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
