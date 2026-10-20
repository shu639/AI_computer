// Procedural table-tennis SFX for the 120s spin explainer.
// Design goals: tight wooden impacts, hard table ticks, short rubber squeaks,
// and a low match pulse. No long broadband noise tails, no "static" hiss.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SR = 48000;
const DUR = 120;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let seed = 0x51a7c0de;
function noise() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
}

function panGains(pan) {
  const a = ((pan + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}

// --- Tonal layers -----------------------------------------------------------

function addTone(start, dur, freq, opts = {}) {
  const {
    wave = 'sine',
    vol = 0.05,
    pan = 0,
    duty = 0.5,
    attack = 0.004,
    release = 0.06,
  } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  const inc = freq / SR;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    let env = Math.min(1, tt / attack);
    env *= Math.min(1, (dur - tt) / release);
    phase += inc;
    const p = phase % 1;
    let v = 0;
    if (wave === 'square') v = p < duty ? 1 : -1;
    else if (wave === 'triangle') v = 4 * Math.abs(p - 0.5) - 1;
    else v = Math.sin(2 * Math.PI * p);
    const s = v * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

// A short pitched body with an exponential pitch drop and a fast decay.
function addImpactTone(start, dur, f0, f1, vol, pan = 0) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const p = tt / dur;
    const f = f1 + (f0 - f1) * Math.exp(-p * 7);
    phase += f / SR;
    const env = Math.min(1, tt / 0.0012) * Math.exp(-tt / (dur * 0.24));
    const s = Math.sin(2 * Math.PI * phase) * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addClick(start, freq, vol, pan = 0, dur = 0.014) {
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const env = Math.exp(-tt / (dur * 0.3));
    const s = Math.sin(2 * Math.PI * freq * tt) * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

// Band-limited noise: one-pole low-pass at `high`, then subtract a low-pass at
// `low`. This keeps slaps and paper sounds out of the harsh high band.
function addBandNoise(start, dur, vol, opts = {}) {
  const {
    low = 500,
    high = 3500,
    decay = 0.02,
    attack = 0.0008,
    pan = 0,
  } = opts;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  const aHigh = 1 - Math.exp((-2 * Math.PI * high) / SR);
  const aLow = 1 - Math.exp((-2 * Math.PI * low) / SR);
  let lp1 = 0;
  let lp2 = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const n = noise();
    lp1 += (n - lp1) * aHigh;
    lp2 += (lp1 - lp2) * aLow;
    const band = lp1 - lp2;
    const env = Math.min(1, tt / attack) * Math.exp(-tt / decay);
    const s = band * env * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

// --- Impacts ---------------------------------------------------------------

function addPock(start, vol = 1, pan = 0) {
  // Rubber/wood contact: very short bright transient, warm body, low thump.
  addBandNoise(start, 0.028, 0.075 * vol, {
    low: 900,
    high: 3600,
    decay: 0.005,
    pan,
  });
  addImpactTone(start, 0.12, 330, 145, 0.12 * vol, pan);
  addImpactTone(start, 0.075, 95, 58, 0.065 * vol, pan);
  addClick(start, 1900, 0.022 * vol, pan, 0.012);
}

function addTok(start, vol = 1, pan = 0) {
  // Table contact: harder and higher than the paddle.
  addBandNoise(start, 0.02, 0.055 * vol, {
    low: 700,
    high: 3200,
    decay: 0.004,
    pan,
  });
  addImpactTone(start, 0.085, 640, 300, 0.085 * vol, pan);
  addImpactTone(start, 0.055, 135, 82, 0.04 * vol, pan);
  addClick(start, 2450, 0.018 * vol, pan, 0.01);
}

function addRim(start, vol = 1, pan = 0) {
  addClick(start, 1350, 0.035 * vol, pan, 0.02);
  addClick(start, 2250, 0.016 * vol, pan, 0.008);
  addBandNoise(start, 0.014, 0.018 * vol, {
    low: 1200,
    high: 4200,
    decay: 0.004,
    pan,
  });
}

function addKickSoft(start, vol = 1, pan = 0) {
  addImpactTone(start, 0.28, 88, 46, 0.055 * vol, pan);
  addClick(start, 120, 0.01 * vol, pan, 0.02);
}

function addSqueak(start, vol = 1, pan = 0) {
  const dur = 0.085;
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const p = tt / dur;
    const f = 950 + 520 * p;
    phase += f / SR;
    const env = Math.min(1, p * 12) * Math.min(1, (1 - p) * 4);
    const s = Math.sin(2 * Math.PI * phase) * env * 0.028 * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
  addBandNoise(start, 0.06, 0.014 * vol, {
    low: 1400,
    high: 3200,
    decay: 0.018,
    pan,
  });
}

function addWhooshLow(start, dur = 0.6, vol = 1, pan = 0) {
  // Low, soft air movement: no high-frequency hiss.
  addBandNoise(start, dur, 0.026 * vol, {
    low: 60,
    high: 520,
    attack: dur * 0.22,
    decay: dur * 0.42,
    pan,
  });
  const s0 = Math.max(0, Math.floor(start * SR));
  const s1 = Math.min(N, Math.floor((start + dur) * SR));
  if (s1 <= s0) return;
  const [gl, gr] = panGains(pan);
  let phase = 0;
  for (let i = s0; i < s1; i++) {
    const tt = (i - s0) / SR;
    const p = tt / dur;
    const f = 150 - 55 * p;
    phase += f / SR;
    const env = Math.sin(Math.PI * p) ** 2;
    const s = Math.sin(2 * Math.PI * phase) * env * 0.018 * vol;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function addPaper(start, vol = 1, pan = 0) {
  addBandNoise(start, 0.2, 0.045 * vol, {
    low: 250,
    high: 1600,
    decay: 0.055,
    attack: 0.004,
    pan,
  });
  addTone(start, 0.14, 210, { wave: 'triangle', vol: 0.012 * vol, pan, release: 0.08 });
}

function addStamp(start, vol = 1) {
  addKickSoft(start, 0.9 * vol);
  addBandNoise(start, 0.06, 0.04 * vol, {
    low: 80,
    high: 900,
    decay: 0.018,
  });
  addTone(start, 0.08, 145, { wave: 'square', vol: 0.015 * vol, release: 0.05 });
}

function addChime(start, vol = 1) {
  [880, 1108.73, 1318.51].forEach((f, i) => {
    addTone(start + i * 0.09, 0.22, f, {
      wave: 'triangle',
      vol: 0.038 * vol,
      release: 0.12,
    });
  });
}

function addBlip(start, param = 0, vol = 1) {
  addTone(start, 0.055, 880 + param * 90, {
    wave: 'triangle',
    vol: 0.028 * vol,
    release: 0.025,
  });
}

function addFinal(start) {
  [220, 329.63, 440, 554.37].forEach((f, i) => {
    addTone(start + i * 0.03, 2.6, f, {
      wave: 'sine',
      vol: 0.035,
      attack: 0.02,
      release: 0.8,
    });
    addTone(start + i * 0.03, 2.2, f * 0.5, {
      wave: 'triangle',
      vol: 0.018,
      attack: 0.03,
      release: 0.8,
    });
  });
}

// A low, sparse match pulse. It should be felt more than heard.
function matchBed(start, end, opts = {}) {
  const { bpm = 104, vol = 1 } = opts;
  const beat = 60 / bpm;
  for (let i = 0; ; i++) {
    const t = start + i * beat;
    if (t >= end) break;
    const bar = i % 4;
    if (bar === 0 || bar === 2) addKickSoft(t, 0.11 * vol, 0);
    if (bar === 1 || bar === 3) addRim(t, 0.012 * vol, bar === 1 ? -0.32 : 0.32);
    if (bar === 2) addTok(t + beat * 0.5, 0.09 * vol, 0.2);
  }
}

function sfx(name, t, param = 0, pan = 0) {
  switch (name) {
    case 'pock':
      addPock(t, 0.85, pan);
      break;
    case 'tok':
      addTok(t, 0.7, pan);
      break;
    case 'rim':
      addRim(t, 0.8, pan);
      break;
    case 'squeak':
      addSqueak(t, 0.7, pan);
      break;
    case 'paper':
      addPaper(t, 0.8, pan);
      break;
    case 'stamp':
      addStamp(t, 1);
      break;
    case 'chime':
      addChime(t, 0.9);
      break;
    case 'blip':
      addBlip(t, param, 0.8);
      break;
    case 'whoosh':
      addWhooshLow(t, 0.7, 0.9, pan);
      break;
    case 'air':
      addWhooshLow(t, 0.9, 0.65, pan);
      break;
    case 'final':
      addFinal(t);
      break;
    default:
      break;
  }
}

// --- Event timeline ---------------------------------------------------------
// Title
sfx('rim', 0.35, 0, -0.2);
sfx('paper', 1.05, 0, -0.2);
sfx('chime', 1.45);

// Hook: a short rally, then the curved serve and miss.
matchBed(2.0, 7.6, { bpm: 112, vol: 0.7 });
sfx('squeak', 2.0, 0, -0.3);
sfx('pock', 2.35, 0, -0.35);
sfx('tok', 2.85, 0, 0.2);
sfx('pock', 4.2, 0, 0.4);
sfx('whoosh', 5.8, 0, -0.1);
sfx('stamp', 7.55);

// Axis
matchBed(8.0, 21.8, { bpm: 100, vol: 0.32 });
sfx('rim', 10.6, 0, -0.2);
sfx('rim', 12.8, 0, -0.2);
sfx('rim', 13.15, 1, 0);
sfx('rim', 13.5, 2, 0.2);
sfx('rim', 17.4, 0, 0.2);
sfx('rim', 18.0, 1, -0.2);
sfx('paper', 20.0, 0, 0.2);

// Friction
matchBed(22.0, 41.8, { bpm: 100, vol: 0.32 });
sfx('squeak', 22.4, 0, -0.2);
sfx('pock', 25.0, 0, 0);
sfx('squeak', 27.6, 0, 0.2);
sfx('squeak', 30.2, 0, 0.1);
sfx('pock', 32.8, 0, -0.2);
sfx('pock', 33.4, 0, 0.2);
sfx('stamp', 35.7);
sfx('rim', 38.4, 0, 0.2);
sfx('paper', 40.0, 0, 0);

// Air
matchBed(42.0, 63.8, { bpm: 96, vol: 0.25 });
sfx('air', 42.6, 0, -0.2);
sfx('air', 45.0, 0, 0.2);
sfx('whoosh', 47.8, 0, 0);
sfx('rim', 50.4, 0, 0);
sfx('rim', 53.0, 0, 0.2);
sfx('rim', 56.0, 1, 0);
sfx('rim', 58.6, 2, 0.2);
sfx('rim', 61.2, 3, -0.2);
sfx('paper', 63.55, 0, 0);

// Bounce: table ticks and paddle pocks.
matchBed(64.6, 83.6, { bpm: 112, vol: 0.8 });
sfx('tok', 64.8, 0, 0);
sfx('tok', 67.4, 0, 0.2);
sfx('pock', 69.8, 1, 0.3);
sfx('rim', 72.4, 0, 0);
sfx('tok', 75.2, 2, -0.2);
sfx('rim', 77.8, 0, -0.2);
sfx('tok', 80.2, 0, 0.3);
sfx('chime', 82.3);
sfx('paper', 83.55);

// Read and return: alternating left/right hits.
matchBed(84.6, 103.6, { bpm: 112, vol: 0.75 });
sfx('rim', 84.6, 0, 0);
sfx('rim', 86.6, 1, -0.3);
sfx('rim', 87.1, 2, 0);
sfx('rim', 87.6, 3, 0.3);
sfx('squeak', 89.2, 0, 0);
sfx('pock', 91.6, 0, 0.2);
sfx('pock', 94.2, 0, -0.3);
sfx('pock', 96.8, 0, 0.3);
sfx('squeak', 99.6, 0, 0);
sfx('chime', 101.8);
sfx('paper', 103.55);

// Outro
sfx('rim', 104.5, 0, 0);
sfx('air', 106.8, 0, 0);
sfx('tok', 109.4, 0, 0);
sfx('chime', 112.0);
sfx('pock', 114.8, 0, 0);
sfx('final', 116.8);

// --- Mix and write ----------------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i++) {
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = peak > 0 ? 0.82 / peak : 1;

const outDir = path.resolve(import.meta.dirname, '..', 'out');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'mix.wav');
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);

// Gentle soft clip adds impact without hard digital clipping.
for (let i = 0; i < N; i++) {
  const l = Math.tanh(L[i] * gain * 1.1) * 0.92;
  const r = Math.tanh(R[i] * gain * 1.1) * 0.92;
  buf.writeInt16LE(Math.round(clamp(l, -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(clamp(r, -1, 1) * 32767), 46 + i * 4);
}
writeFileSync(outFile, buf);
console.log(`wrote ${outFile} (${DUR}s, ${SR}Hz stereo, raw peak ${peak.toFixed(3)}, gain ${gain.toFixed(3)})`);
