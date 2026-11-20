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
/* ---- card-physics synth, timed to the on-screen choreography ---- */
let noiseBuf: AudioBuffer | null = null;
function whiteNoise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
type Voice = { stop: (fade?: number) => void };
/** One noise grain through a filter with a fast attack and exponential decay. */
function grain(at: number, dur: number, gain: number, type: BiquadFilterType, freq: number, q: number, toFreq?: number): Voice | false {
  const c = audio();
  if (!c || !out || level <= 0) return false;
  const t = c.currentTime + at,
    src = c.createBufferSource(),
    f = c.createBiquadFilter(),
    g = c.createGain();
  src.buffer = whiteNoise(c);
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (toFreq) f.frequency.exponentialRampToValueAtTime(toFreq, t + dur);
  f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.004, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(out);
  src.start(t, Math.random() * 0.8);
  src.stop(t + dur + 0.02);
  return {
    stop: (fade = 0.06) => {
      const n = c.currentTime;
      g.gain.cancelScheduledValues(n);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), n);
      g.gain.exponentialRampToValueAtTime(0.0001, n + fade);
    },
  };
}
/** A single card edge snapping off the thumb: bright, papery, ~10ms. */
const snap = (at: number, gain: number, bright: number) => [grain(at, 0.012 + Math.random() * 0.008, gain, 'bandpass', bright * (0.85 + Math.random() * 0.3), 1.1), grain(at, 0.006, gain * 0.5, 'highpass', 5200, 0.7)];
/** A card landing flat on the pile: soft, low, felt-like. */
const tap = (at: number, gain: number) => [grain(at, 0.05, gain, 'lowpass', 1400, 0.9, 380), grain(at, 0.018, gain * 0.35, 'bandpass', 2600, 1.4)];
/** Air moved by a packet travelling across the table. */
const swish = (at: number, dur: number, gain: number, from = 700, to = 3200) => [grain(at, dur, gain, 'bandpass', from, 0.8, to)];
/** Riffle: dozens of snaps that accelerate in, peak, and thin out like a real thumb release. */
function riffleRun(at: number, span: number, n: number, gain: number, bright: number) {
  const vs: (Voice | false)[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1),
      t = at + span * (0.55 * u + 0.45 * u * u) + (Math.random() - 0.5) * 0.006,
      env = Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.06));
    vs.push(...snap(t, gain * (0.35 + 0.65 * env), bright * (0.9 + 0.25 * u)));
  }
  // the low "body" of the riffle: pages fluttering against each other
  vs.push(...swish(at, span * 1.05, gain * 0.35, 1800, 900));
  return vs;
}
/** Bridge / cascade: the arched halves falling back in a soft descending purr. */
function cascade(at: number, span: number, n: number, gain: number) {
  const vs: (Voice | false)[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    vs.push(...snap(at + span * u + (Math.random() - 0.5) * 0.004, gain * (1 - u * 0.6), 2600 - u * 1100));
  }
  vs.push(...swish(at, span, gain * 0.4, 2400, 600));
  return vs;
}
/* Timeline (seconds from the moment shuffling starts, p = 0.12 of a 3.3s draw):
 *  0.00–0.33 fan out · 0.33–0.66 split into two packets · 0.66–1.20 riffle #1 (lift → land)
 *  1.22 square up · 1.22–1.55 second cut · 1.55–2.14 riffle #2 · 2.15 square up → hero card rises */
type H = Voice | false;
const shuffles: (() => H[])[] = [
  // A — "Казино": crisp table riffle with a tight thumb release
  () => {
    const v: H[] = [];
    // fan: cards fan out one after another
    for (let i = 0; i < 6; i++) v.push(...snap(0.04 + i * 0.045, 0.22, 3000 + i * 150));
    v.push(...swish(0.02, 0.3, 0.12, 900, 2600));
    for (const [cut, riff, square, n] of [
      [0.33, 0.66, 1.22, 30],
      [1.22, 1.55, 2.09, 32],
    ] as const) {
      // split: the two packets slide apart and settle
      v.push(...swish(cut + 0.02, 0.28, 0.2, 600, 2400), play('slide4', 0.35, 1.25, cut + 0.02));
      v.push(...tap(cut + 0.27, 0.35), ...tap(cut + 0.3, 0.3));
      // riffle: the thumbs release, then the cards rain onto the pile
      v.push(...riffleRun(riff, 0.36, n, 0.5, 3200));
      for (let i = 0; i < 7; i++) v.push(...tap(riff + 0.31 + i * 0.035, 0.14));
      // square up: two firm taps of the deck on the table
      v.push(...tap(square, 0.6), play('place3', 0.35, 1.1, square), ...tap(square + 0.07, 0.35));
    }
    return v;
  },
  // B — "Бридж": softer air riffle with a cascading bridge finish
  () => {
    const v: H[] = [];
    v.push(play('fan2', 0.45, 1.25), ...swish(0, 0.34, 0.14, 500, 2200));
    for (const [cut, riff, square, n] of [
      [0.33, 0.66, 1.22, 38],
      [1.22, 1.55, 2.09, 40],
    ] as const) {
      v.push(...swish(cut, 0.3, 0.22, 400, 1800), play('shove3', 0.3, 1.2, cut + 0.03));
      v.push(...tap(cut + 0.29, 0.32));
      v.push(...riffleRun(riff, 0.3, n, 0.42, 2500));
      v.push(...cascade(riff + 0.3, 0.24, 22, 0.32));
      v.push(...tap(square, 0.55), ...tap(square + 0.05, 0.25), play('place', 0.3, 0.95, square));
    }
    return v;
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
  /** One of two shuffle performances (never the same twice in a row). Returns a stopper so the
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
